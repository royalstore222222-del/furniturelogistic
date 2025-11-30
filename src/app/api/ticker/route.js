// app/api/ticker/route.js
import { connectDB } from "@/lib/db";
import Ticker from "@/models/Ticker";

export async function GET() {
  try {
    await connectDB();
    const data = await Ticker.find().sort({ createdAt: -1 });
    return Response.json(data || []);  // agar null hai to [] bhejo
  } catch (error) {
    console.error("Ticker fetch error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newTicker = new Ticker(body);
    await newTicker.save();
    return Response.json(newTicker, { status: 201 });
  } catch (error) {
    console.error("Ticker create error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
