import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import DeliveryRoute from "@/models/DeliveryRoute";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// ✅ GET: All orders (Admin only)
export async function GET() {
  try {
    await connectDB();

    // Populate user aur product details
    const orders = await Order.find()
      .populate("user", "name email") // User details (sirf name aur email)
      .populate("items.product", "title price images"); // Product details

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, routeId, deliveryDate, action } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    let updateData = {};

    if (action === "add") {
      if (!routeId || !deliveryDate) {
        return NextResponse.json(
          { success: false, message: "routeId and deliveryDate are required for adding" },
          { status: 400 }
        );
      }

      const parsedDate = new Date(deliveryDate);
      if (isNaN(parsedDate)) {
        return NextResponse.json(
          { success: false, message: "Invalid deliveryDate format" },
          { status: 400 }
        );
      }

      updateData = {
        deliveryRoute: routeId,
        deliveryDate: parsedDate,
      };
    } else if (action === "remove") {
      updateData = {
        deliveryRoute: null,
        deliveryDate: null,
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate("deliveryRoute", "city deliveryDate");

    return NextResponse.json({
      success: true,
      message: `Order successfully ${action === "add" ? "updated" : "cleared"}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("PATCH /api/admin/order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
