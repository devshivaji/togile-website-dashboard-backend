import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  name: string;
  phone: string;
  scheduledDate: Date;
  scheduledTime: string;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const meetingSchema = new Schema<IMeeting>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):?([0-5]\d)$/,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);

export default Meeting;
