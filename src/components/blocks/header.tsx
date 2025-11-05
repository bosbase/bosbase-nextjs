"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useTranslations } from "next-intl";

export default function Header({ header }: { header: any }) {
  if (!header) return null;
  
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("auth");
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {header.logo && (
              <Link href={header.logo.href || "/"} className="text-xl font-bold">
                {header.logo.text || "Bosbase"}
              </Link>
            )}
            
            {header.nav && header.nav.length > 0 && (
              <nav className="hidden md:flex items-center gap-6">
                {header.nav.map((item: any, index: number) => (
                  <Link
                    key={index}
                    href={item.href || "#"}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname?.includes(item.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.text}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            {status === "loading" ? (
              <Button variant="outline" size="sm" disabled>
                Loading...
              </Button>
            ) : session ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  {t("sign_out")}
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/signin">{t("sign_in_title")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

