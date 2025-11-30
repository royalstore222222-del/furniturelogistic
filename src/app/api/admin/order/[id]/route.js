import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// ✅ PATCH: Update order status (Admin only)
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name price image");

    if (!updatedOrder) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
