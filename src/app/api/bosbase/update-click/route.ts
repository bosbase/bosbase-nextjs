import { NextRequest, NextResponse } from "next/server";
import BosBase from "bosbase";
import { ensureApiCallsCollection } from "@/lib/bosbase/init-collection";

const BOSBASE_URL = process.env.BOSBASE_URL || "http://localhost:8090/";
const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL || "a@qq.com";
const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD || "bosbasepass";

async function getBosBaseClient(): Promise<BosBase | null> {
  try {
    const pb = new BosBase(BOSBASE_URL);
    await pb.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);
    await ensureApiCallsCollection(pb);
    return pb;
  } catch (error) {
    console.error("Failed to initialize BosBase client:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, metadata } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Record ID is required" },
        { status: 400 }
      );
    }

    const pb = await getBosBaseClient();
    if (!pb) {
      return NextResponse.json(
        { success: false, error: "BosBase client not available" },
        { status: 500 }
      );
    }

    // Update the existing record
    const updateData: any = {};
    if (metadata?.success !== undefined) {
      updateData.success = Boolean(metadata.success); // Explicitly convert to boolean
    }
    if (metadata?.error !== undefined && metadata.error !== null && metadata.error !== "") {
      updateData.error = String(metadata.error);
    }

    const updated = await pb.collection("api_calls").update(id, updateData);

    return NextResponse.json({
      success: true,
      id: updated.id,
    });
  } catch (error: any) {
    console.error("Failed to update click in BosBase:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update click",
      },
      { status: 500 }
    );
  }
}

