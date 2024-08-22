import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
      const privateKey = process.env.JWT_SECRET;
      const token = req.cookies["token"];
     // console.log("Received token:", token); 
    if (!token) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access",
        message: "No token found",
      });
      return;
    }

    jwt.verify(
      token,
      privateKey!,
      (err: JsonWebTokenError | null, decoded: any) => {
        if (err) {
          res.status(401).json({
            success: false,
            error: "Unauthorized access",
            message: err.message ?? "Invalid token",
          });
          return;
        } else {
          (req as any).userId = decoded.userId;
          next();
        }
      }
    );
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
