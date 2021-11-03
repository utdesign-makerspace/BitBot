FROM node:16.6.0

WORKDIR /opt/bitbot
COPY package.json .
RUN npm install --quiet
COPY . .

CMD npm run prod
