import { Request, Response } from "express";

import Blog, { IBlog } from "../../models/blog/blogModel";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config();
cloudinary.config({
  cloud_name: "dk85hphzd",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, "../../uploads/blogimage");
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadblogimg = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/svg" ||
      file.mimetype === "image/svg+xml"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only jpeg, jpg, png, and svg Image allow"));
    }
  },
});

export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { heading, slug, body, status, PublishedDate, description } = req.body;
  const originalFileName = req.file?.filename;
  const result = await cloudinary.uploader.upload(req.file?.path!, {
    folder: "blogimgs",
  });
  if (result) {
    fs.unlink(req.file?.path!, (err) => {
      if (!err) {
        console.log("Delted temp File");
      }
    });
  }
  try {
    const newBlog: IBlog = new Blog({
      heading,
      slug,
      thumbnails: result.secure_url,
      body,
      status,
      description,
      PublishedDate,
      author: (req as any).userId,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { heading, slug, body, status, PublishedDate, description } = req.body;
  const originalFileName = req.file?.filename;
  try {
    const updateData: Partial<IBlog> = {
      heading,
      slug,
      status,
      body,
      PublishedDate,
      description,
      updatedBy: (req as any).userId,
    };

    if (originalFileName) {
      const result = await cloudinary.uploader.upload(req.file?.path!, {
        folder: "blogimgs",
      });
      // console.log("result: ", result);

      updateData.thumbnails = result.secure_url;

      if (result) {
        fs.unlink(req.file?.path!, (err) => {
          if (!err) {
            console.log("Delted temp File");
          }
        });
      }
    }
    const updatedBlog: IBlog | null = await Blog.findByIdAndUpdate(
      id,
      updateData
    );

    if (!updatedBlog) {
      res.status(404).json({ error: "Blog not found" });
    } else {
      res.status(200).json(updatedBlog);
    }
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllBlogs = async (
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
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorUser",
        },
      },
      {
        $unwind: {
          path: "$authorUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          heading: 1,
          slug: 1,
          author: "$authorUser.name",
          createdBy: "$createdByUser.name",
          updatedBy: "$updatedByUser.name",
          createdAt: 1,
          updatedAt: 1,
          PublishedDate: 1,
          status: 1,
          body: 1,
          thumbnails: 1,
          description: 1,
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
            { heading: { $regex: regexPattern } },
            { author: { $regex: regexPattern } },
            { slug: { $regex: regexPattern } },
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

    const isReadUser = permission?.permission.blog.view;
    let blogs = [] as any[];
    if (isReadUser) {
      const blogData = await Blog.aggregate(pipeLine);
      blogs = blogData;
      const totalblogs = await Blog.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalblogs / limitNumber),
        totalblogs,
        blogs,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalblogs: 0,
        blogs,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      res.status(404).json({ error: "Blog not found" });
      return;
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkSlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  try {
    const existingBlog = await Blog.findOne({ slug });

    if (existingBlog) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllBlogData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const BlogData = await Blog.find({ status: true });
    res.status(200).json(BlogData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Blog data", error });
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog data", error });
  }
};
