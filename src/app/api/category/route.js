import Category from "@/models/Category";
import { connectDB } from "@/lib/db";

// Get All Categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }); // latest first

    return Response.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// ✅ Add Category
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Ensure subcategories are included if present
    const categoryData = {
      name: body.name,
      image: body.image,
      subcategories: body.subcategories || []
    };

    const category = new Category(categoryData);
    await category.save();
    return Response.json(category, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
