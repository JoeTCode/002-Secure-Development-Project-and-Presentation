# DSS Food Blog

This is the front-end for your DSS Blog. It has a "Login" page, a "Home" page, a "Posts" page, and a "My Posts" page. It includes
functional login, plus search, add, edit and delete of posts by interacting with a PostgreSQL docker container. You will update the functionality through the completion of your assignment.

---- Handling posts -----
Posts can be searched using the search bar. See my_posts.js or posts.js for the function that handles this.
Posts can be edited or deleted from the "My Posts" page. Editing posts is handled by deleting the original post and inserting the new post in its place. See app.js for the POST request which handles this.

 ---- Loading posts -----
Posts are loaded from the PostgreSQL database. Posts are loaded on three different pages: "Home", "Posts", and "My Posts".


# Security Features:

1. `Hashing` and `Salting` of the user's password.
2. `JWT` (with **protected routes**) for authentication and session management.
3. `HTTP-Only cookies` to prevent `cookies` (containing the `JWT`) from being accessed on the client-side.
4. **UUIDs** for the `id` column in the `Users` table, preventing predictable IDs.
5. **Encryption** functions using bcrypt, with unique salts. **No data is being encrypted yet**.
6. Using `element.textContent` instead of `element.innerHTML` when populating the post elements to prevent possible scripts from being executed (XSS prevention).
7. A **login limit** based on a user's **IP**, with **Google's reCAPTCHAv2** for limit reset.


# Pre-requisites

- Built using Node 20.x.x, please use a similar version.
- **Docker desktop** is needed to run this app, please [download](https://www.docker.com/products/docker-desktop/) the latest version for your machine.
- Please **download** the `.env` file from our shared [Trello board](https://trello.com/b/iofxikyy/dss2024-25-002-ug29) in the **relevant documents list**, otherwise the app will not run.

# How to start the app

**Normal Flow:**

1. `docker compose up --build` to start the app. After running docker for the first time with the `--build` flag, you can subsequently omit this to speed up the load time.

2. `Control + C` to stop the app.

3. `docker compose down` to clean up the environment (removes containers but preserves the DB data).

**Making changes to DB Flow:**

1. `Control + C` to stop the app.

2. `docker compose down -v` to remove the data in stored DB.

3. `docker compose up --build` to re-start the app.

`docker compose up --build` re-builds the Docker images and starts up the Docker containers (i.e. starts the app).

`docker compose down` cleans up the environment and frees up system resources.

`docker compose down -v` cleans up the environment, frees up system resources, and removes all stored data in the database(s).

**Additional note(s):**

After altering the `.env` file you need to rerun the docker container to implement the changes, using:
- `Control + C` to stop the app (if the app is running)
- `docker compose down`
- `docker compose up`


# Logging in

Admin login details:
- Username: admin
- password: admin
