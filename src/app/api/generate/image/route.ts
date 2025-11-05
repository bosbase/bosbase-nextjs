import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, width = 1024, height = 1024, numImages = 1, model = "dall-e-3" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: model as "dall-e-2" | "dall-e-3",
      prompt: prompt,
      n: model === "dall-e-3" ? 1 : Math.min(numImages, 4), // DALL-E 3 only supports 1 image
      size: `${width}x${height}` as "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792",
      quality: model === "dall-e-3" ? "standard" : undefined,
      style: model === "dall-e-3" ? "vivid" : undefined,
    });

    if (!response.data) {
      return NextResponse.json(
        { error: "No image data returned from OpenAI" },
        { status: 500 }
      );
    }

    const images = response.data.map((img) => img.url || "").filter(Boolean);

    // Note: API call is recorded client-side when button is clicked
    // No need to record here to avoid duplicates

    return NextResponse.json({
      images,
      prompt,
      model,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    // Note: Failed API call is recorded client-side in the error handler
    // No need to record here to avoid duplicates

    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}

