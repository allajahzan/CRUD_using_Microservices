# CRUD Application with Microservices

This is a CRUD application designed with React, TypeScript, Tailwind CSS, and Flowbite, utilizing a Microservices Architecture.




#### The application is composed of the following services:

- Auth Service: Handles authentication and authorization.
- User Service: Manages user data and operations.
- Admin Service: Provides administrative functionalities such as user management.
- Notification Service: Handles user notifications.

--

#### How to Run the Application

You can run this application either locally or using Docker Compose. Follow the instructions below for each approach:

* Running Locally

a) Clone the Repository:

```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
Start Nginx:
```
b) Nginx must be containerized. Build and run the Nginx container:

```bash
docker build -t nginx-container ./nginx
docker run -d -p 80:80 --name nginx-container nginx-container
```
Ensure you set the service hostnames in the Nginx config file as host.docker.internal.

c) Run Each Service Locally:

Navigate to each service directory (e.g., auth, user, admin, or notification) and start it with:

```bash
npm run dev
```
Each service will run on its unique port as specified in its configuration.

d) Access the Application:

Open your browser and navigate to the respective service endpoints.


---


2. Running with Docker Compose

a) Clone the Repository:

```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

b) Start the Application:

Use Docker Compose to build and run all services:
```bash
docker-compose up --build
```
This will start the Nginx container alongside the microservices.

c) Update Nginx Hostnames:

When using Docker Compose, ensure the Nginx configuration specifies the service names which given in docker-compose.yaml file 
(e.g., auth_service, user_service) as hostnames instead of host.docker.internal.

d) Access the Application:

Navigate to http://localhost in your browser to use the application. Nginx will route requests to the appropriate services.