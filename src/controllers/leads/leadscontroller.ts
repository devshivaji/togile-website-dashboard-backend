import { Request, Response } from "express";
import Lead, { ILead } from "../../models/leads/leadsModel";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

export const createLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const updateLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, email, phone,tag,message,industry, companyName, employeeSize } = req.body;
  try {
    const updatedLead: ILead | null = await Lead.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        tag,
        message,
        industry,
        companyName,
        employeeSize,
        updatedBy: (req as any).userId,
      },
      { new: true }
    );
    if (!updatedLead) {
      res.status(404).json({ error: "Lead not found" });
    } else {
      res.status(200).json(updatedLead);
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLeadById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const lead: ILead | null = await Lead.findById(id);

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
    } else {
      res.status(200).json(lead);
    }
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllLeads = async (
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
          email: 1,
          tag:1,
          message:1,
          industry: 1,
          companyName: 1,
          employeeSize: 1,
          createdBy: "$createdByUser.name",
          updatedBy: "$updatedByUser.name",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $skip: +(pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      },
      { $sort: { [sortBy.field]: +sortBy.by } },
    ];


    if (searchQuery && searchQuery.length) {
      pipeLine.unshift({
        $match: {
          $or: [
            { name: { $regex: regexPattern } },
            { email: { $regex: regexPattern } },
            { phone: { $regex: regexPattern } },
            { companyName: { $regex: regexPattern } },
            { tag: { $regex: regexPattern } },
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
    const isReadUser = permission?.permission.leads.view;
    let leads = [] as any[];
    if (isReadUser) {
      const leadData = await Lead.aggregate(pipeLine);
      leads = leadData;
      const totalLeads = await Lead.countDocuments();
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalLeads / limitNumber),
        totalLeads,
        leads,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalLeads: 0,
        leads,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
