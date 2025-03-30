CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
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
('7d408f03-39f5-4cca-8dc8-0bb47a1cb0bd', '2be161456d0d88d5254a5af11b2be0414525ba67d063119446b84efe648754069403db8ed1f6b548c87b75ae0e4703a2', 'admin', '$2b$10$z.D59r2NBFgvwVZf0T1vee64XHWhUaDQ.AuTfOxeVY0LdKUMTGkna'), -- Unhashed password: admin
('dc155e9a-29ab-4900-b754-253eb13e7606', '0a7a5c17b7771b179df995f0a9aa7d2c3d4f449e7bb3ef4809fd5f243cf5388d8c175bb6de1799c4a6dd69effffc9062b0674d3d5ceab540af04d86e76aadf4a', 'homersimpson', '$2b$10$XcIouuzaUOj0lW1EjBiH8.W1GY95JjLa/LvwUk.KWJNtSYs1DYmQK'), -- Unhashed password: pass
('23cb06c0-d74b-4755-8e73-e82043c3d3d6', 'e3098b5cb18a8025827150a359bff82693433a2b45d82bfd8c93004e4a9021d34f919ef9439d742aff7dc9b4931aa0f280cc9b0d54d866e0d8e10bb9c94a48e5', 'breakfastman', '$2b$10$P1N8LYNwSE3zobMTSeCQHeZ5fmLbDeEPZBPnBvCoasJ5bLN47rk5W'), -- Unhashed password: pass
('72e3eed3-3bbb-4a9c-adf5-10e166d3d757', 'eb982150c11254f190351ddfb3e577f3c560eb4fb0751b5ae838d46fff15df9f0a7a1b471405f3365004e8a597fe110b3919339d250fd58e1e595fdc05161461', 'foodguy79', '$2b$10$amiXg6HNomFdTRfmlYFR/eKgrRdU5Pry6MIOPmWx1yb5NGvDLUeam'); -- Unhashed password: pass


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

