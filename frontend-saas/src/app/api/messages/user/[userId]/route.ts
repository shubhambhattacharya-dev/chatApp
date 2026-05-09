import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/message.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const messages = await Message.find({
      $or: [
        { senderId: payload.userId, receiverId: userId },
        { senderId: userId, receiverId: payload.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username fullName profilePic")
      .populate("receiverId", "username fullName profilePic");

    await Message.updateMany(
      { senderId: userId, receiverId: payload.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json(
      { success: true, messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}