CREATE TABLE IF NOT EXISTS staff_shift_attendance (
  staff_shift_attendance_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  emp_id integer NOT NULL REFERENCES emp_acc(emp_id),
  time_in timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  time_out timestamp with time zone,
  attendance_date date NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date,
  CONSTRAINT staff_shift_attendance_time_order CHECK (time_out IS NULL OR time_out >= time_in)
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_shift_attendance_one_open_per_employee_idx
  ON staff_shift_attendance (emp_id)
  WHERE time_out IS NULL;

CREATE INDEX IF NOT EXISTS staff_shift_attendance_time_in_idx
  ON staff_shift_attendance (time_in DESC, staff_shift_attendance_id DESC);
