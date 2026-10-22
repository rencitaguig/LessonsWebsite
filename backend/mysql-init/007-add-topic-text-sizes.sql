USE learn_schema;

SET @title_text_size_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'topics' AND COLUMN_NAME = 'title_text_size'
);
SET @add_title_text_size = IF(
  @title_text_size_exists = 0,
  'ALTER TABLE topics ADD COLUMN title_text_size TINYINT UNSIGNED NOT NULL DEFAULT 24 AFTER content',
  'SELECT 1'
);
PREPARE add_title_text_size FROM @add_title_text_size;
EXECUTE add_title_text_size;
DEALLOCATE PREPARE add_title_text_size;

SET @content_text_size_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'topics' AND COLUMN_NAME = 'content_text_size'
);
SET @add_content_text_size = IF(
  @content_text_size_exists = 0,
  'ALTER TABLE topics ADD COLUMN content_text_size TINYINT UNSIGNED NOT NULL DEFAULT 16 AFTER title_text_size',
  'SELECT 1'
);
PREPARE add_content_text_size FROM @add_content_text_size;
EXECUTE add_content_text_size;
DEALLOCATE PREPARE add_content_text_size;