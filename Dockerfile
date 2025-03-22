FROM node:20

WORKDIR /app
COPY app/package.json .
RUN npm install
COPY app/ .
CMD ["node", "./app.js"]