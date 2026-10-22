USE lessonswebsite_clean;

INSERT INTO users (username, email, password_hash, role)
VALUES
  ('admin', 'admin@lessonswebsite.local', '$2b$10$mDpjzQX4pFjzF/hGw5QmJu9OnW2Es3RL7H9ZNdFNgjikqWWRSLEWa', 'admin'),
  ('user', 'user@lessonswebsite.local', '$2b$10$mDpjzQX4pFjzF/hGw5QmJu9OnW2Es3RL7H9ZNdFNgjikqWWRSLEWa', 'user')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role);
