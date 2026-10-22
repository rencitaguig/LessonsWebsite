USE learn_schema;

-- Seed quiz for Level 3 - Object-Oriented Python
DELETE q FROM quizzes q
JOIN topics t ON q.topic_id = t.id
WHERE t.title LIKE '%Level 3%Object-Oriented%' OR t.slug LIKE '%Level 3%Object-Oriented%';

INSERT INTO quizzes (topic_id, title, passing_score)
SELECT id, 'Level 3 Quiz — Object-Oriented Python', 60
FROM topics
WHERE title LIKE '%Level 3%Object-Oriented%' OR slug LIKE '%Level 3%Object-Oriented%'
LIMIT 1;

SET @quiz_id = (SELECT id FROM quizzes WHERE title = 'Level 3 Quiz — Object-Oriented Python' ORDER BY id DESC LIMIT 1);

-- Q1
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which method acts as the instance initializer in a Python class?', 1, 0);
SET @q1 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q1, '__new__()', FALSE, 0),
(@q1, '__init__()', TRUE, 1),
(@q1, '__create__()', FALSE, 2),
(@q1, '__construct__()', FALSE, 3);

-- Q2
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What distinguishes a class attribute from an instance attribute?', 1, 1);
SET @q2 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q2, 'Class attributes are private; instance attributes are public', FALSE, 0),
(@q2, 'Class attributes are shared across all instances; instance attributes belong to an individual instance', TRUE, 1),
(@q2, 'Class attributes can only hold primitive numbers', FALSE, 2),
(@q2, 'Instance attributes must be initialized outside the class body', FALSE, 3);

-- Q3
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What implicit first parameter is automatically passed to a method decorated with @classmethod?', 1, 2);
SET @q3 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q3, 'self', FALSE, 0),
(@q3, 'base', FALSE, 1),
(@q3, 'cls', TRUE, 2),
(@q3, 'super', FALSE, 3);

-- Q4
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What does Python do when an attribute name is prefixed with double underscores (e.g., __balance)?', 1, 3);
SET @q4 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q4, 'Triggers name mangling to prevent accidental overwrites in subclasses', TRUE, 0),
(@q4, 'Restricts operating-system read access to root users only', FALSE, 1),
(@q4, 'Makes the variable immutable', FALSE, 2),
(@q4, 'Automatically creates a REST API endpoint for the property', FALSE, 3);

-- Q5
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What decorator allows a method to be accessed like an attribute while controlling getter and setter logic?', 1, 4);
SET @q5 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q5, '@classmethod', FALSE, 0),
(@q5, '@staticmethod', FALSE, 1),
(@q5, '@property', TRUE, 2),
(@q5, '@abstractmethod', FALSE, 3);

-- Q6
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'How do you delegate a method call to a parent class within a derived child class?', 1, 5);
SET @q6 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q6, 'parent.method(self)', FALSE, 0),
(@q6, 'super().method()', TRUE, 1),
(@q6, 'base.call(method)', FALSE, 2),
(@q6, 'inherit().method()', FALSE, 3);

-- Q7
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Which Python module provides the tools required to define Abstract Base Classes and abstract methods?', 1, 6);
SET @q7 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q7, 'types', FALSE, 0),
(@q7, 'sys', FALSE, 1),
(@q7, 'abc', TRUE, 2),
(@q7, 'inspect', FALSE, 3);

-- Q8
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What dunder method must you implement to customize an object''s behavior when evaluated by print() or str()?', 1, 7);
SET @q8 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q8, '__repr__', FALSE, 0),
(@q8, '__format__', FALSE, 1),
(@q8, '__echo__', FALSE, 2),
(@q8, '__str__', TRUE, 3);

-- Q9
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'Overloading the + operator for a custom class is achieved by defining which special method?', 1, 8);
SET @q9 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q9, '__plus__', FALSE, 0),
(@q9, '__sum__', FALSE, 1),
(@q9, '__add__', TRUE, 2),
(@q9, '__concat__', FALSE, 3);

-- Q10
INSERT INTO quiz_questions (quiz_id, question_text, points, sort_order)
VALUES (@quiz_id, 'What object-oriented concept models a "has-a" relationship by assembling classes inside other classes?', 1, 9);
SET @q10 = LAST_INSERT_ID();
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order) VALUES
(@q10, 'Polymorphism', FALSE, 0),
(@q10, 'Composition', TRUE, 1),
(@q10, 'Single Inheritance', FALSE, 2),
(@q10, 'Method Overriding', FALSE, 3);
