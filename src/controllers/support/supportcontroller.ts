import { query, Request, Response } from "express";
import Support, { IChat, ISupport } from "../../models/support/supportModel";
import multer from "multer";
import path from "path";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, "../../uploads/image");
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadsupportimg = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only jpeg, jpg, png, and gif Image allow"));
    }
  },
});

export const createSupportTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, query, status, title, chat } = req.body;
  // const image = req.file ? req.file.path : '';
  const originalFileName = req.file?.filename;

  try {
    const ticketNumber = (await Support.countDocuments() ) + 1000;

    const newSupportTicket: ISupport = new Support({
      email,
      query,
      status,
      ticketNumber,
      title,
      image: originalFileName,
      chat,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });

    await newSupportTicket.save();
    res.status(201).json(newSupportTicket);
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSupportTicketById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const supportTicket: ISupport | null = await Support.findById(id);

    if (!supportTicket) {
      res.status(404).json({ error: "Support ticket not found" });
    } else {
      res.status(200).json(supportTicket);
    }
  } catch (error) {
    console.error("Error fetching support ticket by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllSupportTickets = async (
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
          ticketNumber: 1,
          title: 1,
          status: 1,
          email: 1,
          query: 1,
          image: 1,
          chat: 1,
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
            { ticketNumber: { $regex: regexPattern } },
            { email: { $regex: regexPattern } },
            { title: { $regex: regexPattern } },
          ],
        },
      });
    } else {
      pipeLine.unshift({ $match: {} });
    }

    const me = await User.findOne({ _id: (req as any).userId });
    const permission = await ProfileModel.findOne({ _id: me?.role,status:true });

    const isReadUser = permission?.permission.support.view;
    let supports = [] as any[];
    if (isReadUser) {
      const SupportData = await Support.aggregate(pipeLine);
      supports = SupportData;
      const totalSupportTickets = await Support.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalSupportTickets / limitNumber),
        totalSupportTickets,
        supports,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalSupportTickets: 0,
        supports,
        permission,
      });
    }

  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { msg ,isAdminReplay } = req.body;
  const originalFileName = req.file?.filename;

  try {
   const user= await User.findOne({_id:(req as any).userId})
    const updatedSupportchat: Partial<IChat> = {
      msg,
      sender:user?.name,
      isAdminReplay,
      updatedBy: (req as any).userId,
    };

    if (originalFileName) {
      updatedSupportchat.chatimage = originalFileName;
    }

    const updatedSchat = await Support.findByIdAndUpdate(
      id,
      { $push: { chat: updatedSupportchat } },
    );

    if (!updatedSchat) {
      res.status(404).json({ error: "Support chat not found" });
    } else {
      const newData =  await Support.findById(id)
      res.status(200).json(newData);
    }
  } catch (error) {
    console.error("Error updating support chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedSupportTicket: ISupport | null =
      await Support.findByIdAndUpdate(
        id,
        { status, updatedBy: (req as any).userId },
        { new: true }
      );
    if (!updatedSupportTicket) {
      res.status(404).json({ error: "Support ticket not found" });
    } else {
      res.status(200).json(updatedSupportTicket);
    }
  } catch (error) {
    console.error("Error updating support ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
