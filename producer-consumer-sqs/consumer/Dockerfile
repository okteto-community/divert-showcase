FROM node:22-slim

WORKDIR /usr/src/app

ADD package.json .
RUN npm install

COPY index.js sqs.js /usr/src/app/

EXPOSE 8080

CMD node index.js
