import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Workspace from "@/models/workspace.model";
import User from "@/models/user.model";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
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

    const { workspaceId } = await params;

    await connectDB();

    const workspace = await Workspace.findById(workspaceId)
      .populate("ownerId", "username fullName email profilePic")
      .populate("members", "username fullName email profilePic isOnline");

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is a member
    const memberIds = workspace.members.map((m: any) => m._id.toString());
    if (!memberIds.includes(payload.userId)) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this workspace" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, workspace },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get workspace error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
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

    const { workspaceId } = await params;
    const { name, settings } = await request.json();

    await connectDB();

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (workspace.ownerId.toString() !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Only owner can update workspace" },
        { status: 403 }
      );
    }

    if (name) workspace.name = name;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };

    await workspace.save();

    return NextResponse.json(
      { success: true, workspace },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update workspace error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}