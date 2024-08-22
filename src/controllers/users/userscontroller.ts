import { Request, Response } from "express";
import User, { IUser } from "../../models/users/usersModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;
import dotenv from "dotenv";
import ProfileModel from "../../models/Permission/PermissionModel";
dotenv.config();

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, phone, role, status } = req.body;

  try {
    const hashedPassword = await bcrypt.hash("User@123", 10);
    const newUser: IUser = new User({
      name,
      phone,
      email,
      role,
      status,
      password: hashedPassword,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });
    //console.log('(req as any).userId: ', (req as any).userId);
    // console.log('(req as any).userId: ', (req as any).userId);
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user: IUser | null = await User.findOne({ email, status: true });

    if (!user) {
      res.status(404).json({ error: "User not found or User not active " });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite:'none',
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user: IUser | null = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pageSize, page, searchQuery } = req.body;
  try {
    const pageNumber = +page;

    const limitNumber = +pageSize;

    const regexPattern = new RegExp(searchQuery as string, "i");

    const pipeLine: Array<any> = [
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByUser",
        },
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedByUser",
        },
      },
      {
        $unwind: {
          path: "$updatedByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          status: 1,
          password: 1,
          createdBy: "$createdByUser.name",
          updatedBy: "$updatedByUser.name",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $skip: +(pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
    ];

    if (searchQuery && searchQuery.length) {
      pipeLine.unshift({
        $match: {
          $or: [
            { name: { $regex: regexPattern } },
            { email: { $regex: regexPattern } },
          ],
        },
      });
    } else {
      pipeLine.unshift({ $match: {} });
    }
    const me = await User.findOne({ _id: (req as any).userId });
    const permission = await ProfileModel.findOne({
      _id: me?.role,
      status: true,
    });
    const isReadUser = permission?.permission.users.view;
    let users = [] as any[];
    const roles = await ProfileModel.find({});
    if (isReadUser) {
      const userData = await User.aggregate(pipeLine);
      users = userData;
      const totalUsers = await User.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        users,
        roles,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalUsers: 0,
        users,
        roles,
        permission,
      });
    }
    // const users = await User.aggregate(pipeLine);
    //console.log('users: ', users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, email, phone, role, status } = req.body;

  try {
    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      id,
      { name, email, phone, role, status, updatedBy: (req as any).userId },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (_: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.clearCookie("next-token");
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ error });
    console.error();
  }
};
