import { model, Schema } from "mongoose";

export interface userType {
    name: string,
    email: string,
    image: string
}

const userSchema = new Schema<userType>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
}, { timestamps: true })

const User = model<userType>('User', userSchema)
export default User