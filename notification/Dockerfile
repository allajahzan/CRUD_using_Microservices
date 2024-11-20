FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

RUN npm run copy-proto

EXPOSE 50052 3000

CMD [ "npm", "start" ]