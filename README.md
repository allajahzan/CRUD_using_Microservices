# CRUD Application with Microservices

This is a CRUD application designed with React, TypeScript, Tailwind CSS, and Flowbite, utilizing a Microservices Architecture.




## The application is composed of the following services:

- Auth Service: Handles authentication and authorization.
- User Service: Manages user data and operations.
- Admin Service: Provides administrative functionalities such as user management.
- Notification Service: Handles user notifications.


## How to Run the Application

You can run this application either locally or using Docker Compose. Follow the instructions below for each approach:

<br>

### Running Locally

<br>

1. Clone the Repository:
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```
<br>

2. Start Nginx:
```bash
docker build -t nginx-container ./nginx
docker run -d -p 80:80 --name nginx-container nginx-container
```
<br>

3. Change Hostnames in the Nginx config file as host.docker.internal.
```bash
server host.docker.internal:3000; 
```
<br>

4. Run Each Service Locally:
```bash
cd services/service-name
npm run dev
```
<br>

5. Access the Application:

http://localhost:5173


---

## Running with Docker Compose

<br>

1. Clone the Repository:
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```
<br>

2. Start the Application:
```bash
docker-compose up --build
```
<br>

3. Update Nginx Hostnames:

When using Docker Compose, ensure the Nginx configuration specifies the service names which given in docker-compose.yaml file 
(e.g., auth_service, user_service) as hostnames instead of host.docker.internal.

<br>

4. Access the Application:

Navigate to http://localhost in your browser to use the application. Nginx will route requests to the appropriate services.