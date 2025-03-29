DSS Food Blog
This is the front-end for your DSS Blog. It has a "Login" page, a "Home" page, a "Posts" page, and a "My Posts" page. It includes
functional login, plus search, add, edit and delete of posts using local JSON files. You will update the functionality through the completion of your assignment.

---- Logging in -----
At the moment, logins are hardcoded. The username is "username" and the password is "password" in plaintext.

---- Handling posts -----
Posts can be searched using the search bar. See my_posts.js or posts.js for the function that handles this.
Posts can be edited or deleted from the "My Posts" page. Editing posts is handled by deleting the original post and inserting the new post in its place. See app.js for the POST request which handles this.

---- Loading posts -----
Posts are loaded from a local JSON file called posts.json. Posts are loaded on three different pages: "Home", "Posts", and "My Posts".

# How to start the app

Normal Flow:

1. `docker-compose up --build` to start the app. After running once with the `--build` flag, you can subsequently omit this to speed up the load time.

2. `Control + C` to stop the app.

3. `docker-compose down` to clean up the environment (removes containers but preserves the DB data).

Making changes to DB Flow:

1. `Control + C` to stop the app.

2. `docker-compose down -v` to remove the data in stored DB.

3. `docker-compose up --build` to re-start the app.

`docker-compose up --build` re-builds the Docker images and starts up the Docker containers (i.e. starts the app).

`docker-compose down` cleans up the environment and frees up system resources.

`docker-compose down -v` cleans up the environment, frees up system resources, and removes all stored data in the database(s).
