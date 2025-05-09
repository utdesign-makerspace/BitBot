FROM --platform=linux/amd64 node:22.14.0

WORKDIR /opt/bitbot
COPY package.json .
COPY package-lock.json .
RUN npm install --quiet
COPY . .

CMD npm start
