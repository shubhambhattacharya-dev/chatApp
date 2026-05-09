import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/message.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
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

    const { messageId } = await params;

    await connectDB();

    const message = await Message.findById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user owns the message
    if (message.senderId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this message" },
        { status: 403 }
      );
    }

    await Message.findByIdAndDelete(messageId);

    return NextResponse.json(
      { success: true, message: "Message deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}