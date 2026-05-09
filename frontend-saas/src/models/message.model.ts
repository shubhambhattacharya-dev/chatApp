import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId | string;
  receiverId: Types.ObjectId | string;
  message?: string;
  attachments?: Array<{
    url: string;
    publicId: string;
  }>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
    },
    attachments: [attachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;