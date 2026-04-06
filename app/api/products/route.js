import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import { sanitizeRequestBodyAuto, checkXSSThreats } from "@/lib/sanitization";

const validateProduct = (body) => {
  const errors = [];

  if (!body.name || !body.name.trim()) {
    errors.push("Product name is required");
  }

  if (!body.price && body.price !== 0) {
    errors.push("Price is required");
  } else if (typeof body.price === "string") {
    // Try to convert string to number
    const numPrice = parseFloat(body.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push("Price must be a valid positive number");
    }
  } else if (typeof body.price === "number" && body.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (body.inventory === undefined || body.inventory === null) {
    errors.push("Inventory is required");
  } else if (Number(body.inventory) < 0) {
    errors.push("Inventory cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Product creation attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["name", "category", "slug"],
      textFields: ["description", "image"],
      numberFields: {
        price: { min: 0, max: 10000000 },
        inventory: { min: 0, max: 1000000 }
      }
    });

    // Validate product data
    const validation = validateProduct(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // Normalize price to number
    const price = typeof body.price === "string"
      ? parseFloat(body.price)
      : Number(body.price);

    const productData = {
      name: body.name.trim(),
      price: price,
      image: body.image || "",
      description: body.description || "",
      inventory: Number(body.inventory) || 0,
      category: body.category || "",
      slug:
        body.slug ||
        body.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-"),
    };

    const product = await Product.create(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}