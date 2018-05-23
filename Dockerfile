FROM node:9.7-alpine

RUN npm i
ADD slackSend.js slackSend.js
ADD slackReceive.js slackReceive.js
ADD node_modules/ node_modules/

ENTRYPOINT ["node", "slackSend.js"]
