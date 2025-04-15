FROM node:18-alpine

RUN apk add --no-cache wget curl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8083

CMD ["node", "server.js"]
