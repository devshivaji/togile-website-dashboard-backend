import { Request, Response } from "express";
import Career, { ICareer } from "../../models/career/careersModel";
import multer from "multer";
import path from "path";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads/resume"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
export const uploadresume = multer({
  storage,
  fileFilter: (req: Request, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/doc" ||
      file.mimetype === "application/docx" ||
      file.originalname.endsWith(".doc") ||
      file.originalname.endsWith(".docx")
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only pdf ,doc ,docx are allow"));
    }
  },
});

export const createCareer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, phone, profile, jobPostNumber } = req.body;
  const resume = req.file?.path;
  const originalFileName = req.file?.originalname;

  if (!resume) {
    res.status(400).json({ error: "Resume is required" });
    return;
  }

  try {
    const newCareer: ICareer = new Career({
      name,
      email,
      phone,
      profile,
      jobPostNumber,
      resume: originalFileName,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });

    await newCareer.save();
    res.status(201).json(newCareer);
  } catch (error) {
    console.error("Error creating career entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCareerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const career: ICareer | null = await Career.findById(id);

    if (!career) {
      res.status(404).json({ error: "Career entry not found" });
    } else {
      res.status(200).json(career);
    }
  } catch (error) {
    console.error("Error fetching career entry by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCareers = async (
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
          profile: 1,
          resume: 1,
          jobPostNumber: 1,
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
            { role: { $regex: regexPattern } },
            { jobPostNumber: { $regex: regexPattern } },
          ],
        },
      });
    } else {
      pipeLine.unshift({ $match: {} });
    }

    const me = await User.findOne({ _id: (req as any).userId });
    const permission = await ProfileModel.findOne({ _id: me?.role ,status:true});
    const isReadUser = permission?.permission.career.view;
    let careers = [] as any[];

    if (isReadUser) {
      const careerData = await Career.aggregate(pipeLine);
      careers = careerData;
      const totalCareers = await Career.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalCareers / limitNumber),
        totalCareers,
        careers,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalCareers: 0,
        careers,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching careers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
