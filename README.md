# CRUD Application with Microservices

This is a CRUD application designed with React, TypeScript, Tailwind CSS, and Flowbite, utilizing a Microservices Architecture.


## The application is composed of the following services:

- Auth Service: Handles authentication and authorization.
- User Service: Manages user data and operations.
- Admin Service: Provides administrative functionalities such as user management.
- Notification Service: Handles user notifications.

<br>

## How to Run the Application

You can run this application either locally or using Docker Compose. Follow the instructions below for each approach:

## A) Running Locally

1. Clone the Repository:
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

2. Change Hostnames in the Nginx config file as host.docker.internal.
```bash
server host.docker.internal:3000; 
```
```bash
server host.docker.internal:3001; 
```
```bash
server host.docker.internal:3002; 
```

3. Start Nginx:
```bash
docker build -t nginx-container ./nginx
docker run -d -p 80:80 --name nginx-container nginx-container
```

4. Change RabbitMq Connection URL (Admin, User, Auth):
```bash
const amqpServer = 'amqp://localhost:5672';
```

5. Run Each Service Locally:
```bash
cd services/service-name
npm run dev
```

6. Access the Application: http://localhost:5173

<br>

## B) Running with Docker Compose

1. Clone the Repository:
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

2. Change Hostnames in the Nginx config file as host.docker.internal.
```bash
server auth:3000
```
```bash
server admin:3000
```
```bash
server user:3000
```

3. Change RabbitMq Connection URL (Admin, User, Auth):
```bash
const amqpServer = 'amqp://rabbitmq:5672';
```

4. Start the Application:
```bash
docker-compose up --build
```

5. Access the Application: http://localhost:5173

<br>

---

<div align="center">
<p>If you have any questions or need assistance, feel free to open an issue on GitHub.</p>

<p>🚀 Thank you!</p>
</div>