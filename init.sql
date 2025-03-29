CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);


CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date_published TIMESTAMP,
    CONSTRAINT fk_author FOREIGN KEY (username) REFERENCES users(username)
);


-- Insert initial users (passwords hashed with 10 salt rounds)
INSERT INTO users (email, username, password) VALUES
('admin@gmail.com', 'admin', '$2b$10$z.D59r2NBFgvwVZf0T1vee64XHWhUaDQ.AuTfOxeVY0LdKUMTGkna'), -- Unhashed password: admin
('homersimpson123@gmail.com', 'homersimpson', '$2b$10$XcIouuzaUOj0lW1EjBiH8.W1GY95JjLa/LvwUk.KWJNtSYs1DYmQK'), -- Unhashed password: pass
('breakfast452@hotmail.com', 'breakfastman', '$2b$10$P1N8LYNwSE3zobMTSeCQHeZ5fmLbDeEPZBPnBvCoasJ5bLN47rk5W'), -- Unhashed password: pass
('foodguy79@yahoo.com', 'foodguy79', '$2b$10$amiXg6HNomFdTRfmlYFR/eKgrRdU5Pry6MIOPmWx1yb5NGvDLUeam'); -- Unhashed password: pass


-- Insert initial posts
INSERT INTO posts (username, title, content, date_published) VALUES
(
    'homersimpson', 
    'To Sprinkle or Not To Sprinkle', 
    'What do you consider to be the classic donut? Sprinkled or glazed? Does a simple glaze cut it? There''s hundreds and thousands of options to consider.', 
    '2024-11-23 13:37:02'
),
(
    'breakfastman', 
    'Pancakes or Waffles: The Never Ending Debate',
    'Why do we feel the need to pit them against one another? Why can''t pancakes and waffles live in harmony?',
    '2024-11-23 19:14:16'
),
(
    'foodguy79', 
    'Dessert Sushi - should it exist?',
    'I personally think it is an abomination. ''Red Hots'' are not a suitable wasabi substitute!',
    '2024-11-24 15:14:32'
);

