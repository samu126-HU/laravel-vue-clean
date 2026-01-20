# Translation System

This project uses Laravel's built-in localization system with both English and Hungarian translations.

## Files Structure

```
lang/
├── en.json           # English translations (JSON format - simplest)
├── hu.json           # Hungarian translations (JSON format)
├── en/
│   └── messages.php  # English translations (PHP format - for complex cases)
└── hu/
    └── messages.php  # Hungarian translations (PHP format)
```

## Usage

### In PHP/Blade Templates

**Simple translation (JSON files):**
```php
__('Welcome')
__('Login')
__('Shopping Lists')
```

**Using PHP array format:**
```php
__('messages.welcome')
__('messages.login')
__('messages.shopping_lists')
```

**With parameters:**
```php
__('messages.created_successfully', ['item' => 'Product'])
```

### In Vue/Inertia Components

**Option 1: Install laravel-vue-i18n (Recommended)**

1. Install the package:
```bash
npm install laravel-vue-i18n
```

2. Configure in your `app.js`:
```javascript
import { i18nVue } from 'laravel-vue-i18n';

app.use(i18nVue, {
    resolve: async lang => {
        const langs = import.meta.glob('../../lang/*.json');
        return await langs[`../../lang/${lang}.json`]();
    }
});
```

3. Use in components:
```vue
<template>
  <h1>{{ $t('Welcome') }}</h1>
  <button>{{ $t('Login') }}</button>
  <p>{{ $t('Shopping Lists') }}</p>
</template>
```

**Option 2: Pass translations through Inertia**

In your controller, share translations:
```php
return Inertia::render('Page', [
    'translations' => [
        'welcome' => __('Welcome'),
        'login' => __('Login'),
    ]
]);
```

Then use in Vue:
```vue
<template>
  <h1>{{ translations.welcome }}</h1>
</template>

<script setup>
defineProps({
    translations: Object
});
</script>
```

## Switching Languages

### Server-side (Laravel)

Set the locale in your application:

```php
// In a middleware or controller
App::setLocale('hu'); // Hungarian
App::setLocale('en'); // English
```

Or set it per user in a middleware:
```php
public function handle($request, Closure $next)
{
    if (auth()->check()) {
        App::setLocale(auth()->user()->locale ?? 'en');
    }
    
    return $next($request);
}
```

### Client-side (with laravel-vue-i18n)

```javascript
import { loadLanguageAsync } from 'laravel-vue-i18n';

// Change language
await loadLanguageAsync('hu');
```

## Available Translations

### English & Hungarian translations include:

- **Authentication**: Login, Register, Password, Email, etc.
- **Navigation**: Home, Dashboard, Profile, Settings
- **Shopping**: Shops, Products, Categories, Shopping Lists
- **Actions**: Create, Edit, Delete, Save, Cancel, Search
- **Admin**: Admin Panel, Users & Roles, Manage Products/Shops
- **Messages**: Success, Error, Loading states
- **Forms**: All form labels and placeholders
- **Empty States**: "No items found" messages
- **Map/Floor Plan**: Interactive map controls and labels
- **Confirmations**: Delete confirmations, alerts

## Adding New Translations

1. **For simple key-value translations**, add to JSON files:
   - `lang/en.json` for English
   - `lang/hu.json` for Hungarian

2. **For complex translations with parameters**, add to PHP files:
   - `lang/en/messages.php` for English
   - `lang/hu/messages.php` for Hungarian

Example:
```json
{
    "New Key": "New Translation"
}
```

## Current Text in the App

The following text is currently in the application:

**Hungarian text (needs translation keys):**
- "Bejelentkezés" → Use `{{ $t('Login') }}`
- "Regisztráció" → Use `{{ $t('Register') }}`
- "Bevásárlólistáim" → Use `{{ $t('My Shopping Lists') }}`
- "Üzletek" → Use `{{ $t('Shops') }}`
- "Termékek" → Use `{{ $t('Products') }}`
- etc.

**English text (already has keys):**
- Most UI text is already in English and has translation keys

## Configuration

Laravel's locale configuration is in `config/app.php`:

```php
'locale' => 'en',           // Default locale
'fallback_locale' => 'en',  // Fallback if translation missing
```

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Use JSON format** for simple translations (easier and faster)
3. **Use PHP format** when you need:
   - Pluralization
   - Parameter substitution
   - Complex logic
4. **Keep keys descriptive** but concise
5. **Organize by context** (auth, admin, shopping, etc.)
6. **Test in both languages** to ensure proper display

## Example Refactoring

**Before:**
```vue
<h1>Bevásárlólistáim</h1>
```

**After:**
```vue
<h1>{{ $t('My Shopping Lists') }}</h1>
```

This ensures the text displays correctly in both English and Hungarian based on the user's language preference.
