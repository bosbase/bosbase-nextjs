"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { GeneratedImage } from "@/types/generate/image";

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDelete?: (id: string) => void;
}

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (image: GeneratedImage) => {
    try {
      setDownloading(image.id);
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No images generated yet. Create your first image above!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
          >
            <Image
              src={image.url}
              alt={image.prompt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedImage(image)}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(image)}
                disabled={downloading === image.id}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading === image.id ? "Downloading..." : "Download"}
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm truncate">{image.prompt}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.prompt}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedImage)}
                  disabled={downloading === selectedImage.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <div className="text-sm text-muted-foreground flex-1">
                  <p>Model: {selectedImage.model}</p>
                  <p>Size: {selectedImage.width} × {selectedImage.height}</p>
                  {selectedImage.seed && <p>Seed: {selectedImage.seed}</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

