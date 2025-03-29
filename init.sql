CREATE TABLE users (
    id UUID PRIMARY KEY,
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
INSERT INTO users (id, email, username, password) VALUES
('7d408f03-39f5-4cca-8dc8-0bb47a1cb0bd', 'admin@gmail.com', 'admin', '$2b$10$z.D59r2NBFgvwVZf0T1vee64XHWhUaDQ.AuTfOxeVY0LdKUMTGkna'), -- Unhashed password: admin
('dc155e9a-29ab-4900-b754-253eb13e7606', 'homersimpson123@gmail.com', 'homersimpson', '$2b$10$XcIouuzaUOj0lW1EjBiH8.W1GY95JjLa/LvwUk.KWJNtSYs1DYmQK'), -- Unhashed password: pass
('23cb06c0-d74b-4755-8e73-e82043c3d3d6', 'breakfast452@hotmail.com', 'breakfastman', '$2b$10$P1N8LYNwSE3zobMTSeCQHeZ5fmLbDeEPZBPnBvCoasJ5bLN47rk5W'), -- Unhashed password: pass
('72e3eed3-3bbb-4a9c-adf5-10e166d3d757', 'foodguy79@yahoo.com', 'foodguy79', '$2b$10$amiXg6HNomFdTRfmlYFR/eKgrRdU5Pry6MIOPmWx1yb5NGvDLUeam'); -- Unhashed password: pass


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

