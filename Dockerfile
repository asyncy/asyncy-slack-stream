FROM node:9.7-alpine

RUN npm install @slack/client request

ADD app.js app.js

EXPOSE 5000

ENTRYPOINT ["node", "app.js"]
