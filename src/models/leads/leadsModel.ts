import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  name: string;
  phone: string;
  email: string;
  tag:string;
  message:string;
  industry: string;
  companyName: string;
  employeeSize: number;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}


const leadSchema: Schema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tag: { type: String, required: false },
    message: { type: String, required: false },
    industry: { type: String, required: false },
    companyName: { type: String, required: false },
    employeeSize: { type: Number, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);


const Lead = mongoose.model<ILead>("Lead", leadSchema);

export default Lead;