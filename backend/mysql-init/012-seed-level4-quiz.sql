USE learn_schema;

-- Seed quiz for Level 4 - Advanced Python
DELETE q FROM quizzes q
JOIN topics t ON q.topic_id = t.id
WHERE t.title LIKE '%Level 4%Advanced%' OR t.slug LIKE '%Level 4%Advanced%';

INSERT INTO quizzes (topic_id, title, passing_score)
SELECT id, 'Level 4 Quiz — Advanced Python', 60
FROM topics
WHERE title LIKE '%Level 4%Advanced%' OR slug LIKE '%Level 4%Advanced%'
LIMIT 1;

SET @quiz_id = (SELECT id FROM quizzes WHERE title = 'Level 4 Quiz — Advanced Python' ORDER BY id DESC LIMIT 1);

-- Q1
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What exception is raised by an iterator''s __next__() method to signal that all values are exhausted?', 1, 0);
SET @q1 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q1, 'StopIteration', TRUE, 0),
(@q1, 'IndexError', FALSE, 1),
(@q1, 'KeyError', FALSE, 2),
(@q1, 'GeneratorExit', FALSE, 3);

-- Q2
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which keyword turns a regular function into a generator that produces values lazily?', 1, 1);
SET @q2 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q2, 'return', FALSE, 0),
(@q2, 'emit', FALSE, 1),
(@q2, 'yield', TRUE, 2),
(@q2, 'defer', FALSE, 3);

-- Q3
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What is the purpose of @functools.wraps(func) inside a custom decorator wrapper?', 1, 2);
SET @q3 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q3, 'To prevent the decorated function from throwing errors', FALSE, 0),
(@q3, 'To preserve the original function''s name, docstring, and metadata', TRUE, 1),
(@q3, 'To run the function inside a separate worker thread', FALSE, 2),
(@q3, 'To cache function returns automatically', FALSE, 3);

-- Q4
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What pair of dunder methods forms the class-based Context Manager protocol?', 1, 3);
SET @q4 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q4, '__start__ and __stop__', FALSE, 0),
(@q4, '__open__ and __close__', FALSE, 1),
(@q4, '__enter__ and __exit__', TRUE, 2),
(@q4, '__init__ and __del__', FALSE, 3);

-- Q5
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'How do you declare a variable user_id that can be either an int or None using modern Python 3.10+ syntax?', 1, 4);
SET @q5 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q5, 'user_id: int or None', FALSE, 0),
(@q5, 'user_id: int | None', TRUE, 1),
(@q5, 'user_id: Union(int, None)', FALSE, 2),
(@q5, 'user_id: Optional[int | null]', FALSE, 3);

-- Q6
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which decorator from the standard library automatically writes __init__, __repr__, and __eq__ for structured classes?', 1, 5);
SET @q6 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q6, '@struct', FALSE, 0),
(@q6, '@record', FALSE, 1),
(@q6, '@dataclass', TRUE, 2),
(@q6, '@model', FALSE, 3);

-- Q7
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What is the Global Interpreter Lock (CPython GIL)?', 1, 6);
SET @q7 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q7, 'A lock preventing multithreaded I/O file access', FALSE, 0),
(@q7, 'A mutex preventing multiple native threads from executing Python bytecodes concurrently in a single process', TRUE, 1),
(@q7, 'A firewall rule restricting socket connections', FALSE, 2),
(@q7, 'A security layer that disables code execution in production', FALSE, 3);

-- Q8
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which concurrency model is best suited for compute-heavy, CPU-bound tasks in Python?', 1, 7);
SET @q8 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q8, 'asyncio', FALSE, 0),
(@q8, 'threading', FALSE, 1),
(@q8, 'multiprocessing', TRUE, 2),
(@q8, 'Cooperative coroutines', FALSE, 3);

-- Q9
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What keyword suspends execution of a coroutine until an asynchronous operation yields a result?', 1, 8);
SET @q9 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q9, 'wait', FALSE, 0),
(@q9, 'await', TRUE, 1),
(@q9, 'pause', FALSE, 2),
(@q9, 'yield from', FALSE, 3);

-- Q10
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What built-in function drops the execution directly into the interactive Python debugger?', 1, 9);
SET @q10 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q10, 'debug()', FALSE, 0),
(@q10, 'breakpoint()', TRUE, 1),
(@q10, 'pdb.stop()', FALSE, 2),
(@q10, 'trace()', FALSE, 3);
