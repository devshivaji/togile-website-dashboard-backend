import { Request, Response } from "express";
import JobPost, { IJobPost } from "../../models/jobPost/jobPostModel";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

export const createJobPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { role, jd, location, dept, shortDesc, status } = req.body;

  try {
    const jobPostNumber = (await JobPost.countDocuments()) + 1;
    const newJobPost: IJobPost = new JobPost({
      jobPostNumber,
      role,
      jd,
      location,
      dept,
      shortDesc,
      status,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });
    await newJobPost.save();
    res.status(201).json(newJobPost);
    
  } catch (error) {
    console.error("Error creating job post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateJobPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { jobPostNumber, role, jd, location, dept, shortDesc, status } =
    req.body;

  try {
    const jobPost = await JobPost.findByIdAndUpdate(
      id,
      {
        jobPostNumber,
        role,
        jd,
        location,
        dept,
        shortDesc,
        status,
        updatedBy: (req as any).userId,
      },
      { new: true }
    );
    if (!jobPost) {
      res.status(404).json({ error: "Job post not found" });
    } else {
      res.status(200).json(jobPost);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getAllJobPosts = async (
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
          jobPostNumber: 1,
          role: 1,
          jd: 1,
          location: 1,
          dept: 1,
          shortDesc: 1,
          status: 1,
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
    const isReadUser = permission?.permission.career.view;
    let jobPosts = [] as any[];

    if (isReadUser) {
      const jobPostsData = await JobPost.aggregate(pipeLine);
      jobPosts = jobPostsData;
      const totalJobPosts = await JobPost.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalJobPosts / limitNumber),
        totalJobPosts,
        jobPosts,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalJobPosts: 0,
        jobPosts,
        permission,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};
