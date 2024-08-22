import { Request, Response } from "express";
import Addon, { IAddon } from "../../models/addOn/addOnModel";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

export const createAddon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, price, count } = req.body;
  try {
    const newAddon: IAddon = new Addon({
      name,
      price,
      count,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });
    await newAddon.save();
    res.status(201).json(newAddon);
  } catch (error) {
    console.error("Error creating addon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAddon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, price, count } = req.body;

  try {
    const updatedAddon = await Addon.findByIdAndUpdate(
      id,
      { name, price, count },
      { new: true }
    );
    if (!updatedAddon) {
      res.status(404).json({ error: "Addon not found" });
    } else {
      res.status(200).json(updatedAddon);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getAddonById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const addon: IAddon | null = await Addon.findById(id).populate(
      "createdBy updatedBy",
      "name email"
    );

    if (!addon) {
      res.status(404).json({ error: "Addon not found" });
    } else {
      res.status(200).json(addon);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getAllAddons = async (
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
          count: 1,
          price: 1,
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
            { packageName: { $regex: regexPattern } },
            { category: { $regex: regexPattern } },
            { shortDescription: { $regex: regexPattern } },
          ],
        },
      });
    } else {
      pipeLine.unshift({ $match: {} });
    }
    
    const me = await User.findOne({ _id: (req as any).userId });
    const permission = await ProfileModel.findOne({ _id: me?.role, status:true });
    const isReadUser = permission?.permission.pricing.view;

    let addons = [] as any[];
    if (isReadUser) {
      const addonsData = await Addon.aggregate(pipeLine);
      addons = addonsData;
      const totalAddons = await Addon.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalAddons / limitNumber),
        totalAddons,
        addons,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalAddons: 0,
        addons,
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

export const deleteAddonById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedAddon = await Addon.findByIdAndDelete(id);

    if (!deletedAddon) {
      res.status(404).json({ error: "Addon not found" });
    } else {
      res.status(200).json({ message: "Addon deleted successfully" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getAllAddOnData = async (req: Request, res: Response): Promise<void> => {
  try {
    const AddOnData = await Addon.find();
    res.status(200).json(AddOnData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching AddOn data', error });
  }
};