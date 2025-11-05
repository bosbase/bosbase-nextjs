export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  model?: string;
  style?: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  images: string[];
  prompt: string;
  model?: string;
  seed?: number;
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  model: string;
  seed?: number;
  createdAt: string;
}

