import mongoose, { Document, Schema } from "mongoose";

export interface IJobPost extends Document {
  jobPostNumber: number;
  role: string;
  jd: string;
  location: string;
  dept: string;
  shortDesc: string;
  status: boolean;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const jobPostSchema: Schema = new Schema<IJobPost>(
  {
    jobPostNumber: { type: Number, required: false },
    role: { type: String, required: true },
    jd: { type: String, required: true },
    location: { type: String, required: true },
    dept: { type: String, required: true },
    shortDesc: { type: String, required: true },
    status: { type: Boolean, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const JobPost = mongoose.model<IJobPost>("JobPost", jobPostSchema);

export default JobPost;
