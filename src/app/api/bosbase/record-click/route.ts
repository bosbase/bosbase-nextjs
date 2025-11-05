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
    const { endpoint, method, metadata } = body;

    const pb = await getBosBaseClient();
    if (!pb) {
      return NextResponse.json(
        { success: false, error: "BosBase client not available" },
        { status: 500 }
      );
    }

    // Verify collection exists and check its fields
    let collectionFields: any[] = [];
    let hasSuccessField = false;
    try {
      const collections = await pb.collections.getFullList();
      const collection = collections.find((c: any) => c.name === "api_calls");
      if (collection) {
        collectionFields = collection.fields || [];
        hasSuccessField = collectionFields.some((f: any) => f.name === "success");
        console.log("Collection fields:", collectionFields.map((f: any) => ({ name: f.name, type: f.type, required: f.required })));
        console.log("Has success field:", hasSuccessField);
        
        // If success field doesn't exist, the collection needs to be updated
        if (!hasSuccessField) {
          console.error("ERROR: Collection 'api_calls' does not have 'success' field! Attempting to add it...");
          try {
            // Try to ensure the collection has the success field
            await ensureApiCallsCollection(pb);
            // Re-check
            const updatedCollections = await pb.collections.getFullList();
            const updatedCollection = updatedCollections.find((c: any) => c.name === "api_calls");
            if (updatedCollection) {
              collectionFields = updatedCollection.fields || [];
              hasSuccessField = collectionFields.some((f: any) => f.name === "success");
              console.log("After ensuring collection, hasSuccessField:", hasSuccessField);
            }
          } catch (ensureError) {
            console.error("Failed to ensure collection has success field:", ensureError);
          }
        }
      }
    } catch (schemaCheckError) {
      console.warn("Could not check collection schema:", schemaCheckError);
    }

    // Record the click/API call with Image Prompt using BosBase SDK
    // Ensure success is explicitly a boolean (not a string or number)
    // BosBase requires boolean values to be true/false, not 0/1 or "true"/"false"
    // Convert to boolean and ensure it's never null/undefined
    let successValue: boolean = false; // Default to false
    if (metadata?.success !== undefined && metadata?.success !== null) {
      if (metadata.success === true || metadata.success === "true" || metadata.success === 1) {
        successValue = true;
      } else if (metadata.success === false || metadata.success === "false" || metadata.success === 0) {
        successValue = false;
      } else {
        successValue = Boolean(metadata.success); // Fallback conversion
      }
    }
    
    // Build record data - CRITICAL: success MUST be set as a boolean in the object literal
    // Never set it conditionally or after object creation to avoid it being missing
    const recordData: any = {
      endpoint: String(endpoint || "/api/generate/image"),
      method: String(method || "POST"),
      success: successValue, // MUST be boolean true or false - set directly in object literal
    };
    
    // Verify success was set correctly immediately after object creation
    if (typeof recordData.success !== "boolean") {
      console.error("ERROR: success is not boolean after object creation! Type:", typeof recordData.success, "Value:", recordData.success);
      recordData.success = false; // Force to boolean
    }
    if (recordData.success === null || recordData.success === undefined) {
      console.error("ERROR: success is null/undefined after object creation!");
      recordData.success = false; // Force to boolean
    }
    
    console.log("Success field check:", {
      value: recordData.success,
      type: typeof recordData.success,
      isBoolean: typeof recordData.success === "boolean",
      isNull: recordData.success === null,
      isUndefined: recordData.success === undefined,
    });

    // Helper function to check if field exists in collection
    const hasField = (fieldName: string) => {
      if (collectionFields.length === 0) return true; // If we couldn't check, assume it exists
      return collectionFields.some((f: any) => f.name === fieldName);
    };

    // Only add optional fields if they exist in the collection schema
    // IMPORTANT: Don't modify success field - it's already set correctly above
    if (hasField("model") && metadata?.model && metadata.model.trim() !== "") {
      recordData.model = String(metadata.model);
    }
    if (hasField("prompt") && metadata?.prompt && metadata.prompt.trim() !== "") {
      recordData.prompt = String(metadata.prompt).substring(0, 1000);
    }
    if (hasField("numImages") && metadata?.numImages !== undefined && metadata.numImages !== null) {
      recordData.numImages = Number(metadata.numImages);
    }
    if (hasField("width") && metadata?.width !== undefined && metadata.width !== null) {
      recordData.width = Number(metadata.width);
    }
    if (hasField("height") && metadata?.height !== undefined && metadata.height !== null) {
      recordData.height = Number(metadata.height);
    }
    if (hasField("error") && metadata?.error && metadata.error.trim() !== "") {
      recordData.error = String(metadata.error);
    }
    if (hasField("timestamp")) {
      recordData.timestamp = new Date().toISOString();
    }
    
    // CRITICAL: Re-verify success field after all modifications
    // Ensure it's still a boolean and hasn't been accidentally modified
    if (typeof recordData.success !== "boolean") {
      console.error("ERROR: success field was modified! Type:", typeof recordData.success);
      recordData.success = false;
    }
    if (recordData.success === null || recordData.success === undefined) {
      console.error("ERROR: success field became null/undefined! Setting to false.");
      recordData.success = false;
    }

    console.log("Recording Image Prompt via BosBase SDK:", {
      prompt: recordData.prompt ? (recordData.prompt.substring(0, 100) + (recordData.prompt.length > 100 ? "..." : "")) : "(no prompt)",
      model: recordData.model || "(no model)",
      endpoint: recordData.endpoint,
      success: recordData.success,
      successType: typeof recordData.success,
      allFields: Object.keys(recordData),
    });
    console.log("Full record data:", JSON.stringify(recordData, null, 2));
    
    // Final validation: ensure success field is present and is a boolean
    // This is CRITICAL - BosBase requires success to be a boolean, never null/undefined
    if (!("success" in recordData)) {
      console.error("CRITICAL: success field is missing from recordData!");
      recordData.success = false;
    }
    if (recordData.success === null || recordData.success === undefined) {
      console.error("CRITICAL: success is null or undefined! Setting to false.");
      recordData.success = false;
    }
    if (typeof recordData.success !== "boolean") {
      console.error("CRITICAL: success is not boolean! Type:", typeof recordData.success, "Value:", recordData.success);
      recordData.success = false; // Force to boolean
    }
    
    // Final check: ensure success is exactly true or false
    if (recordData.success !== true && recordData.success !== false) {
      console.error("CRITICAL: success is not true or false! Value:", recordData.success);
      recordData.success = false;
    }
    
    console.log("Final record data before API call:", {
      endpoint: recordData.endpoint,
      method: recordData.method,
      success: recordData.success,
      successType: typeof recordData.success,
      successIsBoolean: typeof recordData.success === "boolean",
      successIsTrue: recordData.success === true,
      successIsFalse: recordData.success === false,
      hasSuccess: "success" in recordData,
      recordDataKeys: Object.keys(recordData),
    });

    try {
      // Create record - ensure success is a boolean
      const created = await pb.collection("api_calls").create(recordData);
    
      console.log("Successfully recorded Image Prompt in BosBase:", created.id);

      return NextResponse.json({
        success: true,
        id: created.id,
      });
    } catch (createError: any) {
      console.error("Failed to create record in BosBase:", createError);
      console.error("Record data that failed:", JSON.stringify(recordData, null, 2));
      console.error("Error details:", {
        message: createError.message,
        status: createError.status,
        response: createError.response,
      });
      // Log the full error response to see validation details
      if (createError.response?.data) {
        console.error("Validation errors:", JSON.stringify(createError.response.data, null, 2));
      }
      // Try to get more detailed error info
      if (createError.originalError) {
        console.error("Original error:", createError.originalError);
      }
      
      return NextResponse.json(
        {
          success: false,
          error: createError.message || "Failed to record click",
          details: createError.response || {},
        },
        { status: createError.status || 500 }
      );
    }
  } catch (error: any) {
    console.error("Failed to record click in BosBase:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to record click",
      },
      { status: 500 }
    );
  }
}

