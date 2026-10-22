USE learn_schema;

SET @image_url_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topics'
    AND COLUMN_NAME = 'image_url'
);

SET @add_image_url_column = IF(
  @image_url_column_exists = 0,
  'ALTER TABLE topics ADD COLUMN image_url VARCHAR(500) NULL AFTER content',
  'SELECT 1'
);
PREPARE add_image_url_column FROM @add_image_url_column;
EXECUTE add_image_url_column;
DEALLOCATE PREPARE add_image_url_column;