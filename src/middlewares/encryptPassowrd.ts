import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

 export const encryptPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    (res.locals as any).hashedPassword = hashedPassword;

    next();
  } catch (error) {
    console.error('Error encrypting password:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

