"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localeNames } from "@/i18n/locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(value: string) {
    router.replace(pathname, { locale: value });
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={localeNames[locale as keyof typeof localeNames] || locale} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeNames).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {String(name)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

