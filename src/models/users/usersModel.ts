import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  status:boolean;
  role: Schema.Types.ObjectId;
  password:string;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}


const userSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'User'},  
  status:{type:Boolean, required:true},
  password: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true 
});


const User = mongoose.model<IUser>('User', userSchema);

export default User; 
