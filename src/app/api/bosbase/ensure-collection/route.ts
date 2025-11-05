import { NextRequest, NextResponse } from "next/server";
import BosBase from "bosbase";

const BOSBASE_URL = process.env.BOSBASE_URL || "http://localhost:8090/";
const BOSBASE_EMAIL = process.env.BOSBASE_EMAIL || "a@qq.com";
const BOSBASE_PASSWORD = process.env.BOSBASE_PASSWORD || "bosbasepass";

/**
 * Ensure the api_calls collection exists
 * This endpoint will try to create the collection if it doesn't exist
 */
export async function POST(request: NextRequest) {
  try {
    const pb = new BosBase(BOSBASE_URL);
    
    // Authenticate as superuser
    await pb.admins.authWithPassword(BOSBASE_EMAIL, BOSBASE_PASSWORD);

    // Try to access the collection
    try {
      const result = await pb.collection("api_calls").getList(1, 1, {
        sort: "-@rowid",
      });
      return NextResponse.json({
        success: true,
        message: "Collection 'api_calls' exists",
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
        adminUrl: `${BOSBASE_URL}_/`,
      });
    }
  } catch (error: any) {
    console.error("BosBase collection check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check collection",
      },
      { status: 500 }
    );
  }
}

