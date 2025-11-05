import { NextRequest, NextResponse } from "next/server";
import BosBase from "bosbase";

/**
 * Initialize BosBase collection for API call tracking
 * This endpoint can be called to ensure the collection exists
 */
export async function POST(request: NextRequest) {
  try {
    const BOSBASE_URL = process.env.BOSBASE_URL || "http://localhost:8090/";
    const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL || "a@qq.com";
    const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD || "bosbasepass";

    const pb = new BosBase(BOSBASE_URL);
    
    // Authenticate as superuser
    await pb.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);

    // Check if collection exists
    try {
      const result = await pb.collection("api_calls").getList(1, 1, {
        sort: "-@rowid",
      });
      return NextResponse.json({
        success: true,
        message: "Collection 'api_calls' already exists",
        totalItems: result.totalItems,
      });
    } catch (error: any) {
      // Collection doesn't exist - provide instructions
      return NextResponse.json({
        success: false,
        message: "Collection 'api_calls' does not exist. Please create it in BosBase admin panel.",
        instructions: {
          collectionName: "api_calls",
          fields: [
            { name: "endpoint", type: "text", required: true },
            { name: "method", type: "text", required: true },
            { name: "model", type: "text", required: false },
            { name: "prompt", type: "text", required: false },
            { name: "numImages", type: "number", required: false },
            { name: "width", type: "number", required: false },
            { name: "height", type: "number", required: false },
            { name: "success", type: "bool", required: true },
            { name: "error", type: "text", required: false },
            { name: "timestamp", type: "text", required: false },
          ],
        },
      });
    }
  } catch (error: any) {
    console.error("BosBase initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize BosBase",
      },
      { status: 500 }
    );
  }
}

