import mongoose, { Document, Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  settings: {
    allowPublicChannels: boolean;
    requireEmailVerification: boolean;
  };
  plan: "starter" | "pro" | "enterprise";
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      allowPublicChannels: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
    },
    plan: {
      type: String,
      enum: ["starter", "pro", "enterprise"],
      default: "starter",
    },
    stripeCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ ownerId: 1 });

const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;