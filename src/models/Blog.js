import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true }, // SEO-friendly URL
    content: { type: String, required: true }, // blog ka main content (HTML / Markdown)
    image: { type: String }, // Cloudinary / S3 image URL
    tags: [{ type: String }], // ["nextjs", "react", "mongodb"]
    category: { type: String }, // "Development", "Design", etc.
    status: { type: String, enum: ["draft", "published"], default: "draft" }, // admin control
  },
  { timestamps: true } // createdAt, updatedAt auto add
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
