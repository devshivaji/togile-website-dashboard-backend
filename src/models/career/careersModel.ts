import mongoose, { Document, Schema } from "mongoose";

export interface ICareer extends Document {
  name: string;
  email: string;
  phone: string;
  profile: string;
  resume: string;
  jobPostNumber: number;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}
const careerSchema: Schema = new Schema<ICareer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profile: { type: String, required: true },
    resume: { type: String, required: true },
    jobPostNumber: { type: Number, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Career = mongoose.model<ICareer>("Career", careerSchema);

export default Career;
