import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  heading: string;
  slug: string;
  thumbnails: string;
  body: string;
  status: boolean;
  PublishedDate:string;
  description:string;
  author?: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const blogSchema = new Schema<IBlog>(
  {
    heading: { type: String, required: true },
    slug: { type: String, required: true },
    thumbnails: { type: String, required: false },
    body: { type: String, required: true },
    status: { type: Boolean, required: true },
    PublishedDate: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;
