import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

interface JwtPayload {
    userId: string;
}

export default async function middleware (req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers["authorization"] ?? ""
        if (!token) {
            res.status(403).json({ message: "Unauthorized: No token provided" });
            return
        }
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded || typeof decoded !== "object" || !decoded.userId) {
            res.status(403).json({ 
                message: "Unauthorized: Invalid token" 
            });
            return
        }
        
        
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(403).json({ 
            message: "Unauthorized: Invalid or expired token" 
        });
    }
}