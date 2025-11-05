import Link from "next/link";

export default function Footer({ footer }: { footer: any }) {
  if (!footer) return null;
  
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bosbase</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered image generation platform
            </p>
          </div>
          
          {footer.links && footer.links.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Links</h4>
              <ul className="space-y-2">
                {footer.links.map((link: any, index: number) => (
                  <li key={index}>
                    <Link
                      href={link.href || "#"}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/generate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Generate
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Showcase
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {footer.copyright && (
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            {footer.copyright}
          </div>
        )}
      </div>
    </footer>
  );
}

