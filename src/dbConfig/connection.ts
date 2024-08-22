import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dburl: string = process.env.MNGODB_URI as string;

const dbConnection = mongoose
  .connect(dburl)
  .then(() => console.log('Successfully connected to Database'))
  .catch((err) => console.error('Error', err));

export default dbConnection;
