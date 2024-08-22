import { Request, Response } from "express";
import Meeting, { IMeeting } from "../../models/meeting/meetingModel";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

export const createMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, phone, scheduledDate, scheduledTime } = req.body;

  try {
    const newMeeting: IMeeting = new Meeting({
      name,
      phone,
      scheduledDate,
      scheduledTime,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });

    await newMeeting.save();
    res.status(201).json(newMeeting);
  } catch (error) {
    console.error("Error creating meeting entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMeetingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const meeting: IMeeting | null = await Meeting.findById(id);

    if (!meeting) {
      res.status(404).json({ error: "Meeting entry not found" });
    } else {
      res.status(200).json(meeting);
    }
  } catch (error) {
    console.error("Error fetching meeting entry by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllMeetings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pageSize, page, searchQuery, sortBy } = req.body;

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
          phone: 1,
          scheduledDate: 1,
          scheduledTime: 1,
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
    const permission = await ProfileModel.findOne({ _id: me?.role ,status:true});

    const isReadUser = permission?.permission.meeting.view;
    let meetings = [] as any[];

    if (isReadUser) {
      const meetingData = await Meeting.aggregate(pipeLine);
      meetings = meetingData;
      const totalMeetings = await Meeting.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalMeetings / limitNumber),
        totalMeetings,
        meetings,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalMeetings: 0,
        meetings,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, phone, scheduledDate, scheduledTime } = req.body;

  try {
    const updatedMeeting: IMeeting | null = await Meeting.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        scheduledDate,
        scheduledTime,
        updatedBy: (req as any).userId,
      },
      { new: true }
    );

    if (!updatedMeeting) {
      res.status(404).json({ error: "Meeting entry not found" });
    } else {
      res.status(200).json(updatedMeeting);
    }
  } catch (error) {
    console.error("Error updating meeting entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
