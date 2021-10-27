FROM node:current-alpine

WORKDIR /opt/bitbot
COPY package.json .
RUN npm install --quiet
COPY . .

CMD npm start
