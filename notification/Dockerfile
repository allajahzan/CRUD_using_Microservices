FROM node:alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

EXPOSE 50052 3000

CMD [ "npm", "start" ]