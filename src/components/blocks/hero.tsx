import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowRight } from "lucide-react";

export default function Hero({ hero }: { hero: any }) {
  if (!hero) return null;
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Wand2 className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            {hero.title || "AI Image Generator"}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {hero.description || "Create stunning images from text descriptions using advanced AI technology"}
          </p>
          
          {hero.cta && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {hero.cta.primary && (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href={hero.cta.primary.href || "/generate"}>
                    {hero.cta.primary.text || "Start Generating"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              {hero.cta.secondary && (
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href={hero.cta.secondary.href || "/showcase"}>
                    {hero.cta.secondary.text || "Learn More"}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

