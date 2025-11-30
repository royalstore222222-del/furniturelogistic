import {connectDB} from "@/lib/db";
import HeroImage from "@/models/Hero";

export async function GET() {
  await connectDB();
  const images = await HeroImage.find({});
  return Response.json(images);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const newImage = await HeroImage.create(body);
  return Response.json(newImage, { status: 201 });
}
