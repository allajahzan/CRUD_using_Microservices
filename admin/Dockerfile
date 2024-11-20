FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

RUN npm run copy-proto

EXPOSE 3002

CMD [ "npm", "start" ]