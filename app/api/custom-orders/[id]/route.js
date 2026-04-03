import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/customorders";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function normalizeValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const order = await CustomOrder.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/custom-orders/[id] error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    let body = {};
    try {
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 0) {
        body = await req.json();
      }
    } catch (parseError) {
      console.warn("Failed to parse request body:", parseError.message);
      body = {};
    }

    const updateData = {
      name: normalizeValue(body.name, body.customerName, body.fullName),
      email: normalizeValue(body.email),
      phone: normalizeValue(body.phone, body.mobile, body.contact),
      productType: normalizeValue(
        body.productType,
        body.product,
        body.orderType,
        body.type
      ),
      colorTheme: normalizeValue(body.colorTheme, body.color, body.theme),
      budget: normalizeValue(
        body.budget,
        body.price,
        body.amount,
        body.priceRange
      ),
      deadline: normalizeValue(body.deadline, body.date, body.requiredDate),
      subject: normalizeValue(body.subject, body.title),
      message: normalizeValue(body.message, body.description, body.details),
      referenceImage: normalizeValue(body.referenceImage, body.image),
      status: normalizeValue(body.status) || "Pending",
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === "") {
        delete updateData[key];
      }
    });

    const updatedOrder = await CustomOrder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/custom-orders/[id] error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const deletedOrder = await CustomOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/custom-orders/[id] error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}