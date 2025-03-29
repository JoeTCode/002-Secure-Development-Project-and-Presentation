FROM node:20

WORKDIR /app
COPY app/package.json app/package-lock.json .
RUN npm install
# Install nodemon globally
RUN npm install -g nodemon
COPY app/. .

CMD ["nodemon", "--verbose", "app.js"]