import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { sanitizeRequestBodyAuto, checkXSSThreats } from "@/lib/sanitization";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check admin auth
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === "true";
}

// ✅ GET ALL PRODUCTS
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

// ✅ CREATE PRODUCT
export async function POST(req) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();

    let name = formData.get("name");
    let price = formData.get("price");
    let description = formData.get("description");
    const imageFile = formData.get("image");

    // Build object for sanitization
    const body = { name, price, description };

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Product creation attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    const sanitized = sanitizeRequestBodyAuto(body, {
      strictFields: ["name"],
      textFields: ["description"],
      numberFields: { price: { min: 0.01, max: 10000000 } },
    });

    name = sanitized.name;
    price = sanitized.price;
    description = sanitized.description;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { message: "Product name and price are required" },
        { status: 400 }
      );
    }

    let imageUrl = "";

    // Upload image to Cloudinary
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = uploadRes.secure_url;
    }

    const newProduct = await Product.create({
      name,
      price,
      description,
      image: imageUrl,
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}