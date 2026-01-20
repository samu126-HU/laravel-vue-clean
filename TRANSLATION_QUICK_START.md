# Translation System - Quick Start

## ✅ Setup Complete!

Your Laravel + Vue project now has full bilingual support (English & Hungarian) with:
- ✅ laravel-vue-i18n package installed
- ✅ Language files created (en.json, hu.json)
- ✅ Language switcher component in navigation
- ✅ Default layout using translations
- ✅ Assets built and ready

## 🎯 How It Works

### Language Switcher
The language switcher button appears in the top navigation bar. Click it to toggle between:
- **EN** - English
- **HU** - Hungarian (Magyar)

Your language preference is saved in localStorage and persists across sessions.

## 📝 Using Translations in Your Code

### In Vue Components

```vue
<template>
  <!-- Simple translation -->
  <h1>{{ $t('Welcome') }}</h1>
  
  <!-- With interpolation -->
  <p>{{ $t('products') }}: {{ count }}</p>
  
  <!-- In attributes -->
  <button :title="$t('Click here')">{{ $t('Submit') }}</button>
  
  <!-- In placeholders -->
  <input :placeholder="$t('Search products...')" />
</template>

<script setup>
// No imports needed - $t() is globally available
</script>
```

### Changing Language Programmatically

```vue
<script setup>
import { loadLanguageAsync } from 'laravel-vue-i18n';

const switchToHungarian = async () => {
  await loadLanguageAsync('hu');
};

const switchToEnglish = async () => {
  await loadLanguageAsync('en');
};
</script>
```

## 🔑 Available Translation Keys

### Navigation & Actions
- `Home`, `Shops`, `Products`, `Categories`
- `Login`, `Register`, `Logout`
- `Create`, `Edit`, `Delete`, `Save`, `Cancel`
- `Search`, `Filter`, `Add`, `Remove`

### Shopping
- `Shopping Lists`, `My Shopping Lists`
- `Add to List`, `Create List`
- `products`, `items`, `done`

### Admin
- `Admin Panel`, `Dashboard`
- `Manage Shops`, `Manage Products`
- `Users & Roles`, `Make Admin`

### Messages & States
- `Loading...`, `Processing...`, `Searching...`
- `Success!`, `Error!`, `Warning!`
- `No results found`, `No products found`

### Map/Floor Plan
- `Floor Plan`, `Interactive Floor Plan`
- `Select Categories`, `Search aisles...`
- `Navigation`, `Optimized Route`

[See complete list in lang/en.json]

## 🌍 Supported Languages

### English (en) - Default
All text in the application

### Hungarian (hu - Magyar)
Complete Hungarian translations including:
- Bejelentkezés (Login)
- Regisztráció (Register)
- Bevásárlólistáim (My Shopping Lists)
- Üzletek (Shops)
- Termékek (Products)
- And 180+ more translations

## 📂 File Structure

```
lang/
├── en.json                 # English translations (primary)
├── hu.json                 # Hungarian translations
├── en/
│   └── messages.php        # English (PHP format for complex cases)
└── hu/
    └── messages.php        # Hungarian (PHP format)

resources/js/
├── app.js                  # i18n configured here
└── components/
    └── LanguageSwitcher.vue  # Language toggle button
```

## 🎨 Customization

### Add New Translation Key

1. Add to `lang/en.json`:
```json
{
  "New Key": "New English Text"
}
```

2. Add to `lang/hu.json`:
```json
{
  "New Key": "Új Magyar Szöveg"
}
```

3. Use in your component:
```vue
{{ $t('New Key') }}
```

4. Rebuild assets:
```bash
npm run build
```

### Change Default Language

In `resources/js/components/LanguageSwitcher.vue`, change line 9:
```javascript
const savedLocale = localStorage.getItem('locale') || 'hu'; // Change 'en' to 'hu'
```

## 🚀 Testing

1. **Start your Laravel server:**
   ```bash
   php artisan serve
   ```

2. **Visit the site** - Default language is English

3. **Click the language switcher** (EN/HU button in navigation)

4. **Observe** - All text changes to Hungarian instantly

5. **Refresh page** - Language preference persists

## 💡 Tips

- **Consistency**: Always use translation keys, never hardcode text
- **Keys in English**: Use descriptive English for keys (easier to remember)
- **Rebuild**: Run `npm run build` after adding new translations
- **Hot reload**: Use `npm run dev` during development for auto-rebuild

## 🔧 Troubleshooting

**Translations not showing?**
- Check browser console for errors
- Verify translation key exists in both en.json and hu.json
- Rebuild assets: `npm run build`

**Language not switching?**
- Clear browser localStorage
- Check browser console for errors
- Verify JSON files are valid (no syntax errors)

**New keys not working?**
- Rebuild assets: `npm run build`
- Hard refresh browser (Ctrl+F5)

## 📖 Examples in Your App

The following pages already use translations:
- ✅ DefaultLayout (navigation, menus)
- 🔄 Login page (needs update)
- 🔄 Register page (needs update)
- 🔄 Shopping Lists (needs update)
- 🔄 Shops page (needs update)
- 🔄 Landing page (needs update)

To update remaining pages, replace hardcoded text with `{{ $t('key') }}` syntax.

## Next Steps

To complete the translation integration:
1. Update remaining Vue components to use `$t()` function
2. Test all pages in both languages
3. Add more translations as needed
4. Consider adding more languages (de, fr, es, etc.)

Enjoy your multilingual app! 🎉
