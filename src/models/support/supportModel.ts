import mongoose, { Document, Schema} from 'mongoose';

export interface IChat {
  msg: string;
  chatimage: string;
  sender: string;
  isAdminReplay:boolean;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

export interface ISupport extends Document {
  email: string;
  query: string;
  status: boolean;
  ticketNumber: number;
  title: string;
  image: string; 
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  chat: IChat[];
}


const chatSchema = new Schema<IChat>({
  msg: { type: String, required: true },
  chatimage: { type: String, required: false },
  sender: { type: String, required: false },
  isAdminReplay:{ type: Boolean, required: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
},{ timestamps: true });


const supportSchema = new Schema<ISupport>({
  email: { type: String, required: true },
  query: { type: String, required: true },
  status: { type: Boolean, required: true },
  ticketNumber: { type: Number, required: false },
  title: { type: String, required: true },
  image: { type: String, required: false }, 
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  chat: { type: [chatSchema] ||  [] , default:[]}
}, { timestamps: true });


const Support = mongoose.model<ISupport>("Support", supportSchema);
export default Support;
