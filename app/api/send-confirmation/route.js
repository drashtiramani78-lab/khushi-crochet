import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const data = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Khushi Crochet" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: "Your Order is Confirmed 💖",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Thank you for your order 💖</h2>
          <p>Your order has been confirmed successfully.</p>
          <p><strong>Order ID:</strong> ${data._id || data.orderId}</p>
          <p><strong>Name:</strong> ${data.name || "Customer"}</p>
          <p><strong>Product:</strong> ${data.productName || "Crochet Product"}</p>
          <p>We will start preparing your order soon.</p>
          <br />
          <p>– Khushi Crochet</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Confirmation email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send confirmation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}