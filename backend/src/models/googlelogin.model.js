import mongoose, { Schema } from "mongoose";

const googleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    
    },
 
  },
  { timestamps: true }
);

export const GoogleModel = mongoose.model("social-login", googleSchema);
