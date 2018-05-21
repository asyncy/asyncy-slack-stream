FROM node:9.7-alpine

RUN npm i
ADD slack.js slack.js
ADD node_modules/ node_modules/

ENTRYPOINT ["node", "slack.js"]
