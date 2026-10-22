USE learn_schema;

SET @parent_topic_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topics'
    AND COLUMN_NAME = 'parent_topic_id'
);

SET @add_parent_topic_column = IF(
  @parent_topic_column_exists = 0,
  'ALTER TABLE topics ADD COLUMN parent_topic_id INT NULL AFTER author_id',
  'SELECT 1'
);
PREPARE add_parent_topic_column FROM @add_parent_topic_column;
EXECUTE add_parent_topic_column;
DEALLOCATE PREPARE add_parent_topic_column;

SET @parent_topic_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'topics'
    AND CONSTRAINT_NAME = 'topics_parent_fk'
);

SET @add_parent_topic_fk = IF(
  @parent_topic_fk_exists = 0,
  'ALTER TABLE topics ADD CONSTRAINT topics_parent_fk FOREIGN KEY (parent_topic_id) REFERENCES topics(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE add_parent_topic_fk FROM @add_parent_topic_fk;
EXECUTE add_parent_topic_fk;
DEALLOCATE PREPARE add_parent_topic_fk;