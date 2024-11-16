import { Request, Response, NextFunction, Errback } from "express"

export  const errorHandler = async(error:Errback, req:Request, res:Response, next:NextFunction)=>{
    console.log(error)
    res.status(501).json({msg:error})
}