FROM node:16-alpine

WORKDIR /opt/bitbot
COPY package.json .
RUN npm install --quiet
COPY . .
