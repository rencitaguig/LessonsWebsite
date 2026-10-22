CREATE DATABASE IF NOT EXISTS learn_schema;
USE learn_schema;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
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
