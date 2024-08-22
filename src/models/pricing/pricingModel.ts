import mongoose, { Document, Schema } from "mongoose";

export interface IPricing extends Document {
  packageName: string;
  sequence: number;
  shortDescription: string;
  price: number;
  label: string;
  discount: number;
  category: string;
  headline: string;
  feature: string[];
  badge:string;
  btnTxt:string;
  url:string;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const pricingSchema: Schema = new Schema<IPricing>(
  {
    packageName: { type: String, required: true },
    sequence: { type: Number, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: false },
    label: { type: String, required: false },
    discount: { type: Number, required: false },
    category: { type: String, required: true },
    headline: { type: String, required: true },
    feature: { type: [String], required: true },
    badge: { type: String, required: false },
    btnTxt: { type: String, required: false },
    url: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Pricing = mongoose.model<IPricing>("Pricing", pricingSchema);

export default Pricing;
