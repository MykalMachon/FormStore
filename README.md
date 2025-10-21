# FormStore

A simple, modern IndexedDB-based form caching/storage system for web applications. Automatically saves form data to prevent data loss and improves user experience.

[![npm version](https://badge.fury.io/js/@tinybox-software%2Fformstore.svg)](https://www.npmjs.com/package/@tinybox-software/formstore)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## Features

- 🚀 **Zero configuration** - Just add `data-cache` to your forms
- 💾 **Automatic persistence** - Form data is saved to IndexedDB on change
- 🔄 **Auto-hydration** - Forms are automatically restored on page load
- 🧹 **Auto-cleanup** - Cache is cleared on successful form submission
- 📦 **Lightweight** - Small bundle size with tree-shaking support
- 🎯 **TypeScript** - Full TypeScript support with exported types
- ✨ **Modern** - Built with ES2020+, works with all modern bundlers

## Installation

```bash
npm install @tinybox-software/formstore
```

## Quick Start

### Basic Usage

Add the `data-cache` attribute to any form you want to cache:

```html
<form id="contact-form" data-cache>
  <input type="text" id="name" placeholder="Name" />
  <input type="email" id="email" placeholder="Email" />
  <textarea id="message" placeholder="Message"></textarea>
  <button type="submit">Submit</button>
</form>
```

Initialize FormStore in your JavaScript:

```javascript
import { init } from '@tinybox-software/formstore';

init();
```

That's it! Your forms will now automatically save and restore data.

### TypeScript Usage

```typescript
import { init, InitOptions, FormStoreInstance } from '@tinybox-software/formstore';

const options: InitOptions = {
  beforeHydrate: () => console.log('Loading saved data...'),
  afterHydrate: () => console.log('Form restored!'),
  beforeCache: () => console.log('Saving...'),
  afterCache: () => console.log('Saved!'),
  onError: (error) => console.error('Error:', error),
};

const store: FormStoreInstance = init(options);
```

## API

### `init(options?): FormStoreInstance`

Initializes FormStore and attaches to all forms with the `data-cache` attribute.

#### Options

All options are optional and support both synchronous and asynchronous functions:

| Option | Type | Description |
|--------|------|-------------|
| `beforeHydrate` | `() => void \| Promise<void>` | Called before loading cached data into forms |
| `afterHydrate` | `() => void \| Promise<void>` | Called after cached data has been loaded |
| `beforeCache` | `() => void \| Promise<void>` | Called before saving form data to cache |
| `afterCache` | `() => void \| Promise<void>` | Called after form data has been saved |
| `onError` | `(error: unknown) => void \| Promise<void>` | Called when an error occurs |

#### Returns

A `FormStoreInstance` object with the following methods:

- `refresh()`: Re-initializes FormStore for all forms (useful for dynamically added forms)

### Example with UI Feedback

```javascript
import { init } from '@tinybox-software/formstore';

const spinner = document.getElementById('saving-spinner');

init({
  beforeCache: () => {
    spinner.style.display = 'block';
  },
  afterCache: () => {
    spinner.style.display = 'none';
  },
  onError: (error) => {
    alert('Failed to save form data');
    console.error(error);
  },
});
```

### Dynamic Forms

If you add forms dynamically after initialization, call `refresh()`:

```javascript
import { init } from '@tinybox-software/formstore';

const store = init();

// Later, after adding new forms to the DOM
document.body.innerHTML += '<form id="new-form" data-cache>...</form>';
store.refresh();
```

## Supported Form Elements

FormStore supports all standard HTML form elements:

- ✅ Text inputs (`<input type="text">`)
- ✅ Email, URL, Tel, etc. (`<input type="email">`, etc.)
- ✅ Textareas (`<textarea>`)
- ✅ Select dropdowns (`<select>`)
- ✅ Checkboxes (`<input type="checkbox">`)
- ✅ Radio buttons (`<input type="radio">`)
- ⚠️ File inputs are skipped for security reasons

**Important:** All form elements must have an `id` attribute to be cached.

## How It Works

1. **On initialization**: FormStore finds all forms with `data-cache` and attempts to restore their data from IndexedDB
2. **On change**: When any form input changes, the entire form is automatically saved to IndexedDB
3. **On submit**: When a form is submitted, its cache is automatically cleared

## Browser Support

FormStore works in all modern browsers that support:
- IndexedDB
- ES2020+ features

This includes:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+

## Attribution

This project is built on top of [idb-keyval by Jake Archibald](https://github.com/jakearchibald/idb-keyval), an excellent lightweight wrapper for IndexedDB.

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
