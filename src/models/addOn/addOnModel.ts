import mongoose, { Document, Schema } from "mongoose";

export interface IAddon extends Document {
  name: string;
  count: string;
  price: number;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const addonSchema: Schema = new Schema<IAddon>(
  {
    name: { type: String, required: true },
    count: { type: String, required: false },
    price: { type: Number, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Addon = mongoose.model<IAddon>("Addon", addonSchema);

export default Addon;
