const bcrypt = require('bcrypt');
const pool = require('../config/db');
const dbTransaction = require('../utils/dbTransaction');
const pricing = require('../config/pricing');
const ApiError = require('../utils/apiError');

async function readPricing(client = pool) {
  const result = await client.query(
    `SELECT settings_student_price, settings_regular, settings_membership_price
     FROM system_settings ORDER BY settings_id DESC LIMIT 1`
  );
  const settings = result.rows[0];
  return {
    regularMonthly: settings?.settings_regular > 0 ? Number(settings.settings_regular) : pricing.regularMonthly,
    studentMonthly: settings?.settings_student_price > 0 ? Number(settings.settings_student_price) : pricing.studentMonthly,
    dayPass: settings?.settings_membership_price > 0 ? Number(settings.settings_membership_price) : pricing.dayPass,
  };
}

const MEMBER_FIELDS = `
  m.member_id,
  m.mem_fullname,
  m.mem_username,
  m.mem_contact_num,
  m.mem_address,
  m.mem_status::text AS mem_status,
  latest.membership_id,
  latest.membership_type,
  latest.mbs_start_date,
  latest.mbs_expiration_date,
  CASE
    WHEN latest.mbs_expiration_date IS NULL OR latest.mbs_expiration_date < CURRENT_DATE THEN 'expired'
    WHEN latest.mbs_expiration_date <= CURRENT_DATE + 7 THEN 'expiring'
    ELSE 'active'
  END AS membership_status
`;

const LATEST_MEMBERSHIP = `
  LEFT JOIN LATERAL (
    SELECT membership_id, membership_type, mbs_start_date, mbs_expiration_date
    FROM membership
    WHERE member_id = m.member_id
    ORDER BY mbs_expiration_date DESC, membership_id DESC
    LIMIT 1
  ) latest ON true
`;

async function listMembers() {
  const result = await pool.query(
    `SELECT ${MEMBER_FIELDS} FROM members m ${LATEST_MEMBERSHIP} ORDER BY m.member_id`
  );
  return result.rows;
}

async function getMember(memberId) {
  const client = await pool.connect();
  try {
    const [memberResult, weightsResult, attendanceResult] = await Promise.all([
      client.query(
        `SELECT ${MEMBER_FIELDS} FROM members m ${LATEST_MEMBERSHIP} WHERE m.member_id = $1`,
        [memberId]
      ),
      client.query(
        `SELECT weight_rec_id, weight_kg, weight_recorded_date
         FROM weight_records WHERE member_id = $1
         ORDER BY weight_recorded_date DESC, weight_rec_id DESC LIMIT 12`,
        [memberId]
      ),
      client.query(
        `SELECT attendance_id, atd_time_in FROM member_attendance
         WHERE member_id = $1 ORDER BY atd_time_in DESC LIMIT 20`,
        [memberId]
      ),
    ]);
    if (!memberResult.rowCount) return null;
    return {
      ...memberResult.rows[0],
      weights: weightsResult.rows,
      attendance: attendanceResult.rows,
    };
  } finally {
    client.release();
  }
}

async function createMember(input, actorId) {
  return dbTransaction(async (client) => {
    const rates = await readPricing(client);
    const memberResult = await client.query(
      `INSERT INTO members
         (mem_fullname, mem_username, mem_contact_num, mem_address, mem_pin_hash, mem_status, mem_processed_by)
       VALUES ($1, $2, $3, $4, $5, 'active'::status_enum, $6)
       RETURNING member_id, mem_fullname, mem_username, mem_contact_num, mem_address, mem_status::text AS mem_status`,
      [input.name, input.username, input.phone, input.address, await bcrypt.hash(input.pin, 12), actorId]
    );
    const member = memberResult.rows[0];

    const amount = input.membershipType === 'student' ? rates.studentMonthly : rates.regularMonthly;
    const payment = input.payment;
    const membershipResult = await client.query(
      `INSERT INTO membership
         (member_id, mbs_start_date, mbs_expiration_date, mbs_status, mbs_processed_by, membership_type)
       VALUES ($1, CURRENT_DATE, (CURRENT_DATE + INTERVAL '1 month')::date, 'active'::mbs_status_enum, $2, $3)
       RETURNING membership_id, mbs_start_date, mbs_expiration_date`,
      [member.member_id, actorId, input.membershipType]
    );
    const membership = membershipResult.rows[0];

    await client.query(
      `INSERT INTO transactions
         (member_id, membership_id, amount, transaction_processed_by, payment_method, payment_reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [member.member_id, membership.membership_id, amount, actorId, payment.method, payment.reference]
    );

    if (input.weightKg !== null) {
      await client.query(
        `INSERT INTO weight_records (member_id, weight_kg, weight_processed_by)
         VALUES ($1, $2, $3)`,
        [member.member_id, input.weightKg, actorId]
      );
    }

    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'member.registered', 'member', $2, $3::jsonb)`,
      [actorId, member.member_id, JSON.stringify({ name: member.mem_fullname })]
    );

    return { ...member, ...membership, membership_type: input.membershipType, amount };
  });
}

async function findMemberForCheckIn(username) {
  const result = await pool.query(
    `SELECT m.member_id, m.mem_fullname, m.mem_username, m.mem_pin_hash,
            current_membership.membership_type,
            current_membership.mbs_expiration_date,
            CASE
              WHEN current_membership.mbs_expiration_date <= CURRENT_DATE + 7 THEN 'expiring'
              ELSE 'active'
            END AS membership_status
     FROM members m
     JOIN LATERAL (
       SELECT membership_type, mbs_expiration_date
       FROM membership
       WHERE member_id = m.member_id
         AND mbs_expiration_date >= CURRENT_DATE
         AND mbs_status::text <> 'expired'
       ORDER BY mbs_expiration_date DESC, membership_id DESC
       LIMIT 1
     ) current_membership ON true
     WHERE lower(m.mem_username) = lower($1)
       AND m.mem_status::text = 'active'
     LIMIT 1`,
    [username]
  );
  return result.rows[0] || null;
}

async function recordCheckIn(member, actorId) {
  return dbTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [847221, member.member_id]);
    const existingAttendance = await client.query(
      `SELECT 1
       FROM member_attendance
       WHERE member_id = $1
         AND CASE
           WHEN pg_typeof(atd_time_in) = 'timestamp with time zone'::regtype
             THEN (atd_time_in AT TIME ZONE 'Asia/Manila')::date
           ELSE ((atd_time_in AT TIME ZONE current_setting('TimeZone'))
                 AT TIME ZONE 'Asia/Manila')::date
         END = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date
       LIMIT 1`,
      [member.member_id]
    );
    if (existingAttendance.rowCount) return null;

    const result = await client.query(
      `INSERT INTO member_attendance (member_id, atd_processed_by)
       VALUES ($1, $2)
       RETURNING attendance_id, atd_time_in`,
      [member.member_id, actorId]
    );
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'member.checked_in', 'member', $2, $3::jsonb)`,
      [actorId, member.member_id, JSON.stringify({
        name: member.mem_fullname,
        status: member.membership_status,
        expiresOn: member.mbs_expiration_date,
      })]
    );
    return result.rows[0];
  });
}

async function createWalkIn(input, actorId) {
  return dbTransaction(async (client) => {
    const rates = await readPricing(client);
    if (input.amountPaid < rates.dayPass) throw new ApiError(400, `Day pass requires at least ${rates.dayPass}.`);
    const passResult = await client.query(
      `INSERT INTO walk_in_attendance
         (wiatd_name, wiatd_contact_num, wiatd_rate, wiatd_status, wiatd_processed_by)
       VALUES ($1, $2, $3, 'active'::status_enum, $4)
       RETURNING walk_in_id, wiatd_time_in, wiatd_name, wiatd_rate`,
      [input.name, input.phone, rates.dayPass, actorId]
    );
    const walkIn = passResult.rows[0];
    await client.query(
      `INSERT INTO transactions
         (walk_in_id, amount, transaction_processed_by, payment_method)
       VALUES ($1, $2, $3, 'cash')`,
      [walkIn.walk_in_id, rates.dayPass, actorId]
    );
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'walk_in.registered', 'walk_in', $2, $3::jsonb)`,
      [actorId, walkIn.walk_in_id, JSON.stringify({ name: walkIn.wiatd_name })]
    );
    return walkIn;
  });
}

async function renewMembership(memberId, input, actorId) {
  return dbTransaction(async (client) => {
    const rates = await readPricing(client);
    const memberResult = await client.query(
      `SELECT member_id, mem_fullname
       FROM members WHERE member_id = $1 AND mem_status::text = 'active' FOR UPDATE`,
      [memberId]
    );
    if (!memberResult.rowCount) return null;

    const amount = input.membershipType === 'student' ? rates.studentMonthly : rates.regularMonthly;
    const membershipResult = await client.query(
      `INSERT INTO membership
         (member_id, mbs_start_date, mbs_expiration_date, mbs_status, mbs_processed_by, membership_type)
       SELECT m.member_id,
              GREATEST(CURRENT_DATE, COALESCE(MAX(ms.mbs_expiration_date), CURRENT_DATE)),
              (GREATEST(CURRENT_DATE, COALESCE(MAX(ms.mbs_expiration_date), CURRENT_DATE)) + INTERVAL '1 month')::date,
              'active'::mbs_status_enum, $2, $3
       FROM members m
       LEFT JOIN membership ms ON ms.member_id = m.member_id
       WHERE m.member_id = $1
       GROUP BY m.member_id
       RETURNING membership_id, mbs_start_date, mbs_expiration_date`,
      [memberId, actorId, input.membershipType]
    );
    const membership = membershipResult.rows[0];
    await client.query(
      `INSERT INTO transactions
         (member_id, membership_id, amount, transaction_processed_by, payment_method, payment_reference)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [memberId, membership.membership_id, amount, actorId, input.payment.method, input.payment.reference]
    );
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'membership.renewed', 'member', $2, $3::jsonb)`,
      [actorId, memberId, JSON.stringify({ name: memberResult.rows[0].mem_fullname })]
    );
    return { ...membership, member_name: memberResult.rows[0].mem_fullname, amount };
  });
}

async function updatePin(memberId, pin, actorId) {
  return dbTransaction(async (client) => {
    const result = await client.query(
      `UPDATE members SET mem_pin_hash = $2 WHERE member_id = $1 RETURNING member_id, mem_fullname`,
      [memberId, await bcrypt.hash(pin, 12)]
    );
    if (!result.rowCount) return null;
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id, activity_details)
       VALUES ($1, 'member.pin_reset', 'member', $2, $3::jsonb)`,
      [actorId, memberId, JSON.stringify({ name: result.rows[0].mem_fullname })]
    );
    return result.rows[0];
  });
}

async function addWeight(memberId, weightKg, actorId) {
  return dbTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO weight_records (member_id, weight_kg, weight_processed_by)
       SELECT m.member_id, $2, $3 FROM members m
       WHERE m.member_id = $1
       RETURNING weight_rec_id, weight_kg, weight_recorded_date`,
      [memberId, weightKg, actorId]
    );
    if (!result.rowCount) return null;
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, entity_id)
       VALUES ($1, 'member.weight_recorded', 'member', $2)`,
      [actorId, memberId]
    );
    return result.rows[0];
  });
}

module.exports = {
  listMembers,
  getMember,
  createMember,
  findMemberForCheckIn,
  recordCheckIn,
  createWalkIn,
  renewMembership,
  updatePin,
  addWeight,
};
