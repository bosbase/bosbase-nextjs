"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import type { ImageGenerationRequest } from "@/types/generate/image";
import { useTranslations } from "next-intl";

interface ImageFormProps {
  onGenerate: (request: ImageGenerationRequest) => Promise<void>;
  isGenerating: boolean;
}

export function ImageForm({ onGenerate, isGenerating }: ImageFormProps) {
  const t = useTranslations("generate.form");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [model, setModel] = useState("dall-e-3");
  const [numImages, setNumImages] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await onGenerate({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      width,
      height,
      numImages,
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">{t("prompt_label")}</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none"
          required
          disabled={isGenerating}
        />
        <p className="text-sm text-muted-foreground">
          {t("prompt_placeholder")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="negativePrompt">{t("negative_prompt_label")}</Label>
        <Textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          rows={2}
          className="resize-none"
          disabled={isGenerating}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">{t("width_label")}</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min={256}
            max={1792}
            step={256}
            disabled={isGenerating || model === "dall-e-3"}
          />
          {model === "dall-e-3" && (
            <p className="text-xs text-muted-foreground">
              {t("dalle3_fixed_sizes")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">{t("height_label")}</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min={256}
            max={1792}
            step={256}
            disabled={isGenerating || model === "dall-e-3"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model">{t("model_label")}</Label>
          <Select value={model} onValueChange={setModel} disabled={isGenerating}>
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dall-e-3">{t("dalle3_recommended")}</SelectItem>
              <SelectItem value="dall-e-2">{t("dalle2")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {model === "dall-e-2" && (
          <div className="space-y-2">
            <Label htmlFor="numImages">{t("num_images_label")}</Label>
            <Input
              id="numImages"
              type="number"
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              min={1}
              max={4}
              disabled={isGenerating}
            />
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("generating")}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {t("generate_button")}
          </>
        )}
      </Button>
    </form>
  );
}

