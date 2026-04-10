import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/contact";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  return adminAuth === "true";
}

export async function PUT(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const updatedMessage = await Contact.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMessage) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const deletedMessage = await Contact.findByIdAndDelete(params.id);

    if (!deletedMessage) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete message" },
      { status: 500 }
    );
  }
}