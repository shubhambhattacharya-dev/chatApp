import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/message.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function POST(request: Request) {
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

    const { receiverId, message, attachments } = await request.json();

    if (!receiverId || (!message && (!attachments || attachments.length === 0))) {
      return NextResponse.json(
        { success: false, message: "Message or attachments required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newMessage = await Message.create({
      senderId: payload.userId,
      receiverId,
      message: message || "",
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username fullName profilePic")
      .populate("receiverId", "username fullName profilePic");

    return NextResponse.json(
      { success: true, message: populatedMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}