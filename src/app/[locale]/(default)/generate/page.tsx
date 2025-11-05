"use client";

import { useState } from "react";
import { ImageForm } from "@/components/generate/image-form";
import { ImageGallery } from "@/components/generate/image-gallery";
import { ApiStatsDisplay } from "@/components/bosbase/api-stats";
import type { ImageGenerationRequest, GeneratedImage } from "@/types/generate/image";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GeneratePage() {
  const t = useTranslations("generate");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastClickRecordId, setLastClickRecordId] = useState<string | null>(null);

  const handleGenerate = async (request: ImageGenerationRequest) => {
    // Prevent duplicate submissions
    if (isGenerating) {
      return;
    }
    
    setIsGenerating(true);
    let clickRecordId: string | null = null;
    
    // Record the API call click immediately with Image Prompt using BosBase SDK
    // Initially set success to false - will be updated based on actual API call result
    try {
      const clickResponse = await fetch("/api/bosbase/record-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/api/generate/image",
          method: "POST",
          metadata: {
            model: request.model || "dall-e-3",
            prompt: request.prompt, // Record the full Image Prompt
            numImages: request.numImages || 1,
            width: request.width || 1024,
            height: request.height || 1024,
            success: false, // Start as false, will be updated based on actual result
          },
        }),
      });
      
      if (clickResponse.ok) {
        const clickData = await clickResponse.json();
        clickRecordId = clickData.id;
        setLastClickRecordId(clickData.id);
      }
    } catch (error) {
      console.warn("Failed to record click (non-blocking):", error);
    }
    
    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const data = await response.json();
      
      // Update the click record to mark it as successful since API call succeeded
      if (clickRecordId) {
        try {
          await fetch("/api/bosbase/update-click", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: clickRecordId,
              metadata: {
                success: true,
                numImages: data.images.length,
              },
            }),
          }).catch((err) => {
            console.warn("Failed to update click record (non-blocking):", err);
          });
        } catch (updateError) {
          console.warn("Failed to update click record (non-blocking):", updateError);
        }
      }
      
      // Refresh stats after a short delay to ensure the record is saved
      setTimeout(() => {
        window.dispatchEvent(new Event("bosbase-stats-refresh"));
      }, 1000);
      
      const newImages: GeneratedImage[] = data.images.map((url: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: data.prompt,
        negativePrompt: request.negativePrompt,
        width: request.width || 1024,
        height: request.height || 1024,
        model: data.model || request.model || "dall-e-3",
        seed: data.seed,
        createdAt: data.createdAt,
      }));

      setImages((prev) => [...newImages, ...prev]);
      toast.success(t("success_message", { count: newImages.length }));
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || t("error_message"));
      
      // Update the existing click record to mark it as failed (only if we have the record ID)
      // If we don't have the record ID, create a new one for tracking
      try {
        if (clickRecordId) {
          // Try to update the existing record
          await fetch("/api/bosbase/update-click", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: clickRecordId,
              metadata: {
                success: false,
                error: error.message || "Unknown error",
              },
            }),
          }).catch((err) => {
            console.warn("Failed to update click record, creating new one:", err);
            // Fallback: create a new record for the failure
            fetch("/api/bosbase/record-click", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                endpoint: "/api/generate/image",
                method: "POST",
                metadata: {
                  model: request.model,
                  prompt: request.prompt,
                  success: false,
                  error: error.message || "Unknown error",
                },
              }),
            });
          });
        } else {
          // No record ID, create a new one for tracking the failure
          await fetch("/api/bosbase/record-click", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              endpoint: "/api/generate/image",
              method: "POST",
              metadata: {
                model: request.model,
                prompt: request.prompt,
                success: false,
                error: error.message || "Unknown error",
              },
            }),
          }).catch((err) => {
            console.warn("Failed to record failed click (non-blocking):", err);
          });
        }
      } catch (updateError) {
        console.warn("Failed to update/record click (non-blocking):", updateError);
      }
      
      // Refresh stats after error as well
      setTimeout(() => {
        window.dispatchEvent(new Event("bosbase-stats-refresh"));
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success(t("image_removed"));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wand2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t("api_stats_title")}</h2>
        <ApiStatsDisplay />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">{t("generate_image_title")}</h2>
            <ImageForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">{t("tips_title")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t("tips.tip1")}</li>
              <li>• {t("tips.tip2")}</li>
              <li>• {t("tips.tip3")}</li>
              <li>• {t("tips.tip4")}</li>
              <li>• {t("tips.tip5")}</li>
              <li>• {t("tips.tip6")}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("generated_images_title")}</h2>
        <ImageGallery images={images} onDelete={handleDelete} />
      </div>
    </div>
  );
}

