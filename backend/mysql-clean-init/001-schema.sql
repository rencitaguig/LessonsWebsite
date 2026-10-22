USE lessonswebsite_clean;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  parent_topic_id INT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content MEDIUMTEXT NOT NULL,
  title_text_size TINYINT UNSIGNED NOT NULL DEFAULT 24,
  content_text_size TINYINT UNSIGNED NOT NULL DEFAULT 16,
  youtube_url VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  image_position ENUM('top', 'bottom', 'left', 'right') NOT NULL DEFAULT 'top',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT topics_author_fk FOREIGN KEY (author_id) REFERENCES users(id),
  CONSTRAINT topics_parent_fk FOREIGN KEY (parent_topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

CREATE TABLE topic_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_position ENUM('top', 'bottom', 'left', 'right') NOT NULL DEFAULT 'top',
  image_width TINYINT UNSIGNED NOT NULL DEFAULT 100,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT topic_images_topic_fk FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  passing_score DECIMAL(5,2) NOT NULL DEFAULT 60,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT quizzes_topic_fk FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT quiz_questions_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT quiz_options_question_fk FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total_points INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT quiz_attempts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT quiz_attempts_quiz_fk FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
