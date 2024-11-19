// import * as grpc from '@grpc/grpc-js';
// import * as protoLoader from '@grpc/proto-loader';
// import path, { resolve } from 'path';

// const packageDefinition = protoLoader.loadSync(
//     path.join(__dirname, 'user.proto'),
// );

// const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// const client = new (userProto as any).UserService('localhost:50051', grpc.credentials.createInsecure());

// // get user from auth service
// export const getUserFromAuthService = (userId: string): Promise<any> => {
//     return new Promise((resolve, reject) => {
//         client.getUser({ userId }, (error: any, response: any) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(response);
//             }
//         })
//     })
// }

// // update user from auth service
// export const updateUserFromAuthService = (userId: string, name: string, email: string, image: string): Promise<any> => {
//     return new Promise((resolve, reject) => {
//         client.updateUser({ userId, name, email, image }, (error: any, response: any) => {
//             if (error) {
//                 reject(error)
//             } else {
//                 resolve(response)
//             }
//         })
//     })
// }
