# Locale Switcher Usage

The `LocaleSwitcher` component allows users to switch between available languages (English and Chinese).

## Usage

Import and use the `LocaleSwitcher` component in any client component:

```tsx
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function MyComponent() {
  return (
    <div>
      <LocaleSwitcher />
    </div>
  );
}
```

## Example: Adding to Header

To add the locale switcher to your header, you can import it in your Header component:

```tsx
import { LocaleSwitcher } from "@/components/locale-switcher";

// In your Header component:
<LocaleSwitcher />
```

## Available Locales

- `en` - English
- `zh` - Chinese (中文)

The locale switcher will automatically detect the current locale and allow switching between available languages while preserving the current route.

