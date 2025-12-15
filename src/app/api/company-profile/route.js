import { connectDB } from "@/lib/db";
import CompanyProfile from "@/models/CompanyProfile";
import { NextResponse } from "next/server";

// GET: Fetch company profile
export async function GET() {
    try {
        await connectDB();
        // Fetch the single document. Since there's only one profile, findOne() works.
        const profile = await CompanyProfile.findOne();
        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Error fetching company profile:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch company profile" },
            { status: 500 }
        );
    }
}

// POST: Create or Update company profile (Upsert)
export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        // Check if a profile already exists
        let profile = await CompanyProfile.findOne();

        if (profile) {
            // Update existing profile
            profile = await CompanyProfile.findByIdAndUpdate(profile._id, data, {
                new: true,
                runValidators: true,
            });
        } else {
            // Create new profile
            profile = await CompanyProfile.create(data);
        }

        return NextResponse.json({
            success: true,
            message: "Company profile updated successfully",
            profile
        }, { status: 201 });

    } catch (error) {
        console.error("Error saving company profile:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to save company profile" },
            { status: 500 }
        );
    }
}
