# FormStore

a really simple indexedDB based form caching/storage system.

> 🔥🐉 **_Warning!_** This isn't very stable yet. I would wait to use it in production.

## Todos

- [x] write v1 of the code based on [this codepen](https://codepen.io/mykalmachon/pen/b72458af7d9548a7d69021811ea695ed?editors=0011)
- [ ] write tests for the code
- [ ] write a build script to compile a UMD module

## Installation

You can install this package via npm with

```bash
npm install formstore
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
