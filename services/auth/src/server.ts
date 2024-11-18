import express from "express";
import mongose from "mongoose";
import dotenv from "dotenv";
import route from "./router/auth";
import morgan from "morgan";
import { connect } from './controller/auth'
import { grpcServer_userService } from "./gRPC/userService";
import { grpcServer_adminService } from "./gRPC/adminService";
import { errorHandle } from "./middleware/error.handle";

// create app
const app = express();

// env config
dotenv.config();

// mongodb connection
mongose.connect(process.env.MONGO_URL as string)
  .then((res) => console.log("successfully connected to auth db"))
  .catch((err) => console.log("failed to connect to auth db"));

// rabbitmq connection
connect()

// middlewares
app.use(express.json());
app.use(morgan("dev"));

// router middleware
app.use("/", route);

// error logger
app.use(errorHandle);

// gRPC Servers
grpcServer_userService();
grpcServer_adminService();

// server listening
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
