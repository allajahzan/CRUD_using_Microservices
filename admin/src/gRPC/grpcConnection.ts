import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path, { resolve } from 'path';

const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, '..', '/proto/admin.proto'),
);

const adminProto = grpc.loadPackageDefinition(packageDefinition).admin;

const client = new (adminProto as any).AdminService('notification:50052', grpc.credentials.createInsecure());

// send request to notification service to send notification
export const sendRequestToNotificationService = (id: string, email:string): Promise<any> => {
    return new Promise((resolve, reject) => {
        client.sendNotification({ id , email}, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        })
    })
}
