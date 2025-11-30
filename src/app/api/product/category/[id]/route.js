import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query; // categoryId from URL

  if (req.method === "GET") {
    try {
      const products = await Product.find({ category: id }).populate("category");
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server Error" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
