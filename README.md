# FormStore

a really simple indexedDB based form caching/storage system.

## Installation

You can install this package via npm with

```bash
npm install @tinybox-software/formstore
```

## Usage

### init

To get started with FormStore, you just have to initialize it.

```js
import { init } from formstore;

const store = init({});
```

Once initialized, FormStore will find any form with the `data-cache` attribute on it and:

1. Attempt to load existing form data from cache, and "hydrate" the form
2. Update the forms cache on save
3. Clear the forms cache on submission

### options

FormStore provides a few options via the init object:

1. **beforeHydrate:** Function
2. **afterHydrate:** Function
3. **beforeCache:** Function
4. **afterCache:** Function
5. **onError:** Function

here's an example of init using those hooks

```js
import { init } from formstore;

const store = init({
  beforeHydrate: () => {console.log('loading form...')},
  afterHydrate: () => {console.log('loaded form')},
  beforeCache: () => {console.log('saving form...')},
  afterCache: () => {console.log('saved form')},
  onError: (err) => {console.log(`something went wrong ${err}`)}
})
```

These hooks can be useful for UI side effects (i.e showing a "saving form" indicator, showing an error when no form exists...)

## Attribution

This is heavily based on [idb-keyval by Jake Archibald](https://github.com/jakearchibald/idb-keyval)

## Testing
Because of  the heavily async nature of the code I use, and considering I want to do more integration that unit tests,
I'm going to be migrating from JS-DOM to something like puppeteer. Tests wont run as fast, but we'll be able to validate that FormStore works in a real world environment.
