import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

// server
export const server = async(req:Request, res:Response) =>{
    res.send("server is runnnin on port 3002 - admin service")
}

// admin verify token
export const verifyToken = async(req:Request, res:Response, next:NextFunction) : Promise<any> =>{
    try{
        res.setHeader('Cache-Control', 'no-store');

        const accessToken = req.headers['authorization']?.split(' ')[1]
        if(!accessToken) return res.status(403).json({msg:"Unauthorized access"})

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined)=>{
            if(err) return res.status(403).json({msg:"Unauthorized access"})
            else{
            // check weather the user with isAdmin true is existing or not - through gRPC
            
            }    
        })    

    }catch(err){
        next(err)
    }
}
