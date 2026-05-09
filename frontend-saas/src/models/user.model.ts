import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePic: string;
  isOnline: boolean;
  lastSeen: Date;
  workspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profilePic: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    workspaceId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findByEmailOrUsername = async function (identifier: string) {
  return await this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
};

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;