import { model, Schema } from "mongoose";

export interface userType {
    name: string,
    email: string,
    password: string,
    image: string,
    isAdmin: Boolean,
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
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const User = model<userType>('User', userSchema)
export default User