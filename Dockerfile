FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 7792

CMD ["sh", "-c", "node server.js & npm start"]