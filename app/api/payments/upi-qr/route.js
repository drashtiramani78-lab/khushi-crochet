import { NextResponse } from "next/server";
import QRCode from 'qrcode';

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, orderId, upiId = "drashtiramani78@okhdfcbank" } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Amount and orderId required" },
        { status: 400 }
      );
    }

    const amountInPaisa = Math.round(amount * 100);
    const upiDeepLink = `upi://pay?pa=${upiId}&am=${amountInPaisa}&cu=INR&tn=Khushi%20Crochet%20Order%20${orderId}`;

    const qrSvg = await QRCode.toString(upiDeepLink, {
      type: 'svg',
      width: 256,
      margin: 1,
      color: {
        dark: '#2f2723',
        light: '#ffffff'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        amount,
        upiId,
        upiDeepLink,
        qrSvg,
        qrUrl: upiDeepLink
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { success: false, error: "QR generation failed" },
      { status: 500 }
    );
  }
}
