import { Request, Response } from "express";
import Pricing, { IPricing } from "../../models/pricing/pricingModel";
import User from "../../models/users/usersModel";
import ProfileModel from "../../models/Permission/PermissionModel";

export const createPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    packageName,
    sequence,
    shortDescription,
    price,
    label,
    discount,
    category,
    headline,
    feature,
    badge,
    btnTxt,
    url,
  } = req.body;

  try {
    const newPricing: IPricing = new Pricing({
      packageName,
      sequence,
      shortDescription,
      price,
      label,
      discount,
      category,
      headline,
      feature,
      badge,
      btnTxt,
      url,
      createdBy: (req as any).userId,
      updatedBy: (req as any).userId,
    });

    await newPricing.save();
    res.status(201).json(newPricing);
  } catch (error) {
    console.error("Error creating pricing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPricingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const pricing: IPricing | null = await Pricing.findById(id);

    if (!pricing) {
      res.status(404).json({ error: "Pricing not found" });
    } else {
      res.status(200).json(pricing);
    }
  } catch (error) {
    console.error("Error fetching pricing by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPricing = async (
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
          packageName: 1,
          sequence: 1,
          shortDescription: 1,
          price: 1,
          label: 1,
          discount: 1,
          category: 1,
          headline: 1,
          feature: 1,
          badge:1,
          btnTxt:1,
          url:1,
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
    const permission = await ProfileModel.findOne({ _id: me?.role,status:true });
    const isReadUser = permission?.permission.pricing.view;

    let pricing = [] as any[];
    if (isReadUser) {
      const pricingData = await Pricing.aggregate(pipeLine);
      pricing = pricingData;
      const totalPricing = await Pricing.countDocuments();

      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: Math.ceil(totalPricing / limitNumber),
        totalPricing,
        pricing,
        permission,
      });
    } else {
      res.status(200).json({
        page: pageNumber,
        pagesize: limitNumber,
        totalPages: 0,
        totalPricing: 0,
        pricing,
        permission,
      });
    }
  } catch (error) {
    console.error("Error fetching pricing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    packageName,
    sequence,
    shortDescription,
    price,
    label,
    discount,
    category,
    headline,
    feature,
    badge,
    btnTxt,
    url,
  } = req.body;

  try {
    const updatedPricing: IPricing | null = await Pricing.findByIdAndUpdate(
      id,
      {
        packageName,
        sequence,
        shortDescription,
        price,
        label,
        discount,
        category,
        headline,
        feature,
        badge,
        btnTxt,
        url,
      },
      {
        new: true,
      }
    );

    if (!updatedPricing) {
      res.status(404).json({ error: "Pricing not found" });
    } else {
      res.status(200).json(updatedPricing);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const deletePricingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedPricing = await Pricing.findByIdAndDelete(id);

    if (!deletedPricing) {
      res.status(404).json({ error: "Pricing not found" });
    } else {
      res.status(200).json({ message: "Pricing deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting pricing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getAllPricingData = async (req: Request, res: Response): Promise<void> => {
  try {
    const pricingData = await Pricing.find();
    res.status(200).json(pricingData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing data', error });
  }
};