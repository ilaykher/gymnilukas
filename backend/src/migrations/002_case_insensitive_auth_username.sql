CREATE UNIQUE INDEX IF NOT EXISTS login_auth_auth_username_lower_unique
  ON login_auth (lower(auth_username))
  WHERE auth_username IS NOT NULL;
