import { Errback, NextFunction, Request, Response } from "express";

// error handler
export const errorHandle = async(error:Errback, req:Request,res:Response, next:NextFunction) : Promise<any> =>{
    console.log(error)
    res.status(501).json({msg:error})
}