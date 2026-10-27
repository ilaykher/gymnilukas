const pool = require('../config/db');
const dbTransaction = require('../utils/dbTransaction');
const defaultPricing = require('../config/pricing');

async function listTransactions({ from = null, to = null } = {}) {
  const result = await pool.query(
    `SELECT
       t.transaction_id,
       t.transaction_date_created,
       t.amount,
       t.payment_method,
       t.payment_reference,
       COALESCE(m.mem_fullname, wi.wiatd_name, 'Unknown') AS customer_name,
       CASE WHEN t.walk_in_id IS NOT NULL THEN 'Daily Pass' ELSE 'Membership Renewal' END AS category,
       COALESCE(ms.membership_type, 'walk-in') AS membership_type
     FROM transactions t
     LEFT JOIN members m ON m.member_id = t.member_id
     LEFT JOIN membership ms ON ms.membership_id = t.membership_id
     LEFT JOIN walk_in_attendance wi ON wi.walk_in_id = t.walk_in_id
     WHERE ($1::date IS NULL OR
            (CASE
               WHEN pg_typeof(t.transaction_date_created) = 'timestamp with time zone'::regtype
                 THEN t.transaction_date_created AT TIME ZONE 'Asia/Manila'
               ELSE t.transaction_date_created::timestamp without time zone
             END) >= $1::date::timestamp)
       AND ($2::date IS NULL OR
            (CASE
               WHEN pg_typeof(t.transaction_date_created) = 'timestamp with time zone'::regtype
                 THEN t.transaction_date_created AT TIME ZONE 'Asia/Manila'
               ELSE t.transaction_date_created::timestamp without time zone
             END) < ($2::date + 1)::timestamp)
     ORDER BY t.transaction_date_created DESC, t.transaction_id DESC`,
    [from, to]
  );
  return result.rows;
}

async function getDashboard() {
  const { rows: [{ today }] } = await pool.query(
    `SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date AS today`
  );
  const localTimestamp = (column) => `CASE
    WHEN pg_typeof(${column}) = 'timestamp with time zone'::regtype
      THEN ${column} AT TIME ZONE 'Asia/Manila'
    ELSE ${column}::timestamp without time zone
  END`;

  const [stats, activity] = await Promise.all([
    pool.query(
      `WITH bounds AS (SELECT $1::date AS today)
       SELECT
         (SELECT count(*)::int
          FROM member_attendance, bounds
          WHERE ${localTimestamp('atd_time_in')} >= bounds.today::timestamp
            AND ${localTimestamp('atd_time_in')} < (bounds.today + 1)::timestamp) AS member_checkins_today,
         (SELECT count(*)::int
          FROM walk_in_attendance, bounds
          WHERE ${localTimestamp('wiatd_time_in')} >= bounds.today::timestamp
            AND ${localTimestamp('wiatd_time_in')} < (bounds.today + 1)::timestamp) AS walk_ins_today,
         (SELECT COALESCE(sum(amount), 0)::numeric
          FROM transactions, bounds
          WHERE ${localTimestamp('transaction_date_created')} >= bounds.today::timestamp
            AND ${localTimestamp('transaction_date_created')} < (bounds.today + 1)::timestamp) AS revenue_today,
         (SELECT count(*)::int
          FROM membership, bounds
          WHERE mbs_expiration_date = bounds.today) AS memberships_expiring_today`,
      [today]
    ),
    pool.query(
      `SELECT
         l.activity_id,
         l.activity_action,
         l.entity_type,
         l.entity_id,
         l.activity_date_created,
         l.activity_details->>'name' AS customer_name,
         l.activity_details->>'status' AS status,
         l.activity_details->>'expiresOn' AS expires_on,
         l.activity_details,
         to_char(member_membership.mbs_expiration_date, 'YYYY-MM-DD') AS membership_expires_on
       FROM activity_logs l
       LEFT JOIN LATERAL (
         SELECT ms.mbs_expiration_date
         FROM membership ms
         WHERE l.entity_type = 'member'
           AND ms.member_id = l.entity_id
           AND ms.mbs_start_date <= (${localTimestamp('l.activity_date_created')})::date
           AND ms.mbs_expiration_date >= (${localTimestamp('l.activity_date_created')})::date
           AND ms.mbs_status::text <> 'expired'
         ORDER BY ms.mbs_expiration_date DESC, ms.membership_id DESC
         LIMIT 1
       ) member_membership ON true
       WHERE l.activity_action IN ('member.checked_in', 'walk_in.registered')
         AND ${localTimestamp('l.activity_date_created')} >= $1::date::timestamp
         AND ${localTimestamp('l.activity_date_created')} < ($1::date + 1)::timestamp
       ORDER BY l.activity_date_created DESC, l.activity_id DESC
       LIMIT 10`,
      [today]
    ),
  ]);
  return { ...stats.rows[0], activity: activity.rows };
}

async function getReport(timeframe, from, to) {
  const localTime = `CASE
    WHEN pg_typeof(t.transaction_date_created) = 'timestamp with time zone'::regtype
      THEN t.transaction_date_created AT TIME ZONE 'Asia/Manila'
    ELSE t.transaction_date_created::timestamp without time zone
  END`;
  const bucket = {
    Daily: `date_trunc('day', ${localTime})`,
    Monthly: `date_trunc('month', ${localTime})`,
    Yearly: `date_trunc('year', ${localTime})`,
  }[timeframe];
  const step = { Daily: '1 day', Monthly: '1 month', Yearly: '1 year' }[timeframe];
  const seriesStart = timeframe === 'Daily'
    ? '$1::date::timestamp'
    : `date_trunc('${timeframe === 'Monthly' ? 'month' : 'year'}', $1::date::timestamp)`;
  const seriesEnd = timeframe === 'Daily'
    ? '$2::date::timestamp'
    : `date_trunc('${timeframe === 'Monthly' ? 'month' : 'year'}', $2::date::timestamp)`;
  const result = await pool.query(
    `SELECT to_char(d::date, 'YYYY-MM-DD') AS bucket,
            COALESCE(sum(t.amount) FILTER (WHERE t.walk_in_id IS NULL), 0)::numeric AS membership,
            COALESCE(sum(t.amount) FILTER (WHERE t.walk_in_id IS NOT NULL), 0)::numeric AS walk_in
     FROM generate_series(${seriesStart}, ${seriesEnd}, INTERVAL '${step}') d
     LEFT JOIN transactions t
       ON ${localTime} >= $1::date::timestamp
      AND ${localTime} < ($2::date + 1)::timestamp
      AND ${bucket} = d
     GROUP BY d::date
     ORDER BY d::date`,
    [from, to]
  );
  const format = (date) => {
    const value = new Date(`${date}T00:00:00Z`);
    if (timeframe === 'Daily') return {
      label: value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      fullLabel: value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    };
    if (timeframe === 'Monthly') return {
      label: value.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      fullLabel: value.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    };
    return { label: String(value.getUTCFullYear()), fullLabel: String(value.getUTCFullYear()) };
  };
  const buckets = result.rows.map((row) => ({
    ...format(row.bucket),
    membership: Number(row.membership),
    walkIn: Number(row.walk_in),
  }));
  return {
    labels: buckets.map((bucket) => bucket.label),
    fullLabels: buckets.map((bucket) => bucket.fullLabel),
    membership: buckets.map((bucket) => bucket.membership),
    walkIn: buckets.map((bucket) => bucket.walkIn),
    periodLabel: buckets.length ? `${buckets[0].fullLabel} - ${buckets[buckets.length - 1].fullLabel}` : '',
    cardPeriod: buckets[buckets.length - 1]?.fullLabel || '',
  };
}

async function listActivity({ from, to, limit, actions = null }) {
  const result = await pool.query(
    `SELECT
       l.activity_id,
       l.activity_action,
       l.entity_type,
       l.entity_id,
       l.activity_date_created,
       l.activity_details,
       ea.emp_name AS actor_name
     FROM activity_logs l
     LEFT JOIN emp_acc ea ON ea.emp_id = l.actor_emp_id
     WHERE ($1::date IS NULL OR l.activity_date_created::date >= $1::date)
       AND ($2::date IS NULL OR l.activity_date_created::date <= $2::date)
       AND ($4::text[] IS NULL OR l.activity_action = ANY($4::text[]))
     ORDER BY l.activity_date_created DESC, l.activity_id DESC
     LIMIT $3`,
    [from || null, to || null, limit, actions]
  );
  return result.rows;
}

async function getPricing() {
  const result = await pool.query(
    `SELECT settings_student_price, settings_regular, settings_membership_price
     FROM system_settings ORDER BY settings_id DESC LIMIT 1`
  );
  const settings = result.rows[0];
  return {
    regularMonthly: settings?.settings_regular > 0 ? Number(settings.settings_regular) : defaultPricing.regularMonthly,
    studentMonthly: settings?.settings_student_price > 0 ? Number(settings.settings_student_price) : defaultPricing.studentMonthly,
    dayPass: settings?.settings_membership_price > 0 ? Number(settings.settings_membership_price) : defaultPricing.dayPass,
    persisted: Boolean(settings),
  };
}

async function updatePricing(prices, actorId) {
  return dbTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1)', [847219]);
    const existing = await client.query(
      `SELECT settings_id FROM system_settings ORDER BY settings_id DESC LIMIT 1 FOR UPDATE`
    );
    let result;
    if (existing.rowCount) {
      result = await client.query(
        `UPDATE system_settings
         SET settings_membership_price = $2,
             settings_student_price = $3,
             settings_regular = $4
         WHERE settings_id = $1
         RETURNING settings_membership_price, settings_student_price, settings_regular`,
        [existing.rows[0].settings_id, prices.dayPass, prices.studentMonthly, prices.regularMonthly]
      );
    } else {
      result = await client.query(
        `INSERT INTO system_settings (settings_membership_price, settings_student_price, settings_regular)
         VALUES ($1, $2, $3)
         RETURNING settings_membership_price, settings_student_price, settings_regular`,
        [prices.dayPass, prices.studentMonthly, prices.regularMonthly]
      );
    }
    await client.query(
      `INSERT INTO activity_logs (actor_emp_id, activity_action, entity_type, activity_details)
       VALUES ($1, 'pricing.updated', 'settings', $2::jsonb)`,
      [actorId, JSON.stringify(prices)]
    );
    return {
      regularMonthly: Number(result.rows[0].settings_regular),
      studentMonthly: Number(result.rows[0].settings_student_price),
      dayPass: Number(result.rows[0].settings_membership_price),
      persisted: true,
    };
  });
}

module.exports = { listTransactions, getDashboard, getReport, listActivity, getPricing, updatePricing };
