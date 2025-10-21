import { get, set, del, createStore, UseStore } from 'idb-keyval';

// * CUSTOM TYPES

export type InitOptions = {
  beforeHydrate?: () => void | Promise<void>;
  afterHydrate?: () => void | Promise<void>;
  beforeCache?: () => void | Promise<void>;
  afterCache?: () => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
};

type CachedInput = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type FormValue = {
  [key: string]: string | boolean;
};

type CachedFormData = {
  values: FormValue[];
};

// * INTERNAL PRIVATE FUNCTIONS

/**
 * gets the form from cache and hydrates the page
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<void>
 */
const getFormFromCache = async (
  form: HTMLFormElement,
  store: UseStore
): Promise<void> => {
  const formId = form.id || 'unknown';
  const formKey = `form#${formId}`;

  // attempt to get the form from cache
  const formInCache = (await get<CachedFormData>(formKey, store)) ?? null;

  if (!formInCache) return;

  // hydrate the HTML form
  formInCache.values.forEach((value) => {
    const id = Object.keys(value)[0];
    if (!id || id.length === 0) return; // ignore cases with no id

    const el = form.querySelector(
      `input#${id}, textarea#${id}, select#${id}`
    ) as CachedInput | null;

    if (!el) return;

    const cachedValue = value[id];

    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = Boolean(cachedValue);
      } else if (el.type !== 'file') {
        // Don't set file input values for security reasons
        el.value = String(cachedValue);
      }
    } else {
      el.value = String(cachedValue);
    }
  });
};

/**
 * updates the form in cache when changes occur
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<void>
 */
const updateFormInCache = async (
  form: HTMLFormElement,
  store: UseStore
): Promise<void> => {
  const formId = form.id || 'unknown';
  const inputs = [
    ...form.querySelectorAll('input, textarea, select'),
  ] as CachedInput[];

  const formKey = `form#${formId}`;
  const formValues: FormValue[] = inputs
    .filter((input) => input.id) // Only cache inputs with IDs
    .map((input) => {
      if (input instanceof HTMLInputElement) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          return { [input.id]: input.checked };
        } else if (input.type === 'file') {
          // Don't cache file inputs
          return { [input.id]: '' };
        } else {
          return { [input.id]: input.value };
        }
      } else {
        return { [input.id]: input.value };
      }
    });

  await set(formKey, { values: formValues }, store);
};

/**
 * deletes a form from the cache
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<void>
 */
const deleteFormFromCache = async (
  form: HTMLFormElement,
  store: UseStore
): Promise<void> => {
  const formId = form.id || 'unknown';
  const formKey = `form#${formId}`;

  await del(formKey, store);
};

/**
 * attaches to all forms present in the page
 *
 * @param store the form store
 * @param options initialization options with lifecycle hooks
 * @returns void
 */
const attachToForms = (store: UseStore, options: InitOptions): void => {
  const formEls = [
    ...document.querySelectorAll('form[data-cache]'),
  ] as HTMLFormElement[];

  formEls.forEach((form: HTMLFormElement) => {
    // for each form, setup appropriate listeners
    // Use IIFE to handle async operations properly
    (async () => {
      try {
        // load in data from the cache & hydrate the page
        if (options.beforeHydrate) await options.beforeHydrate();
        await getFormFromCache(form, store);
        if (options.afterHydrate) await options.afterHydrate();

        // attach listeners to update the cache on change
        form.addEventListener('change', async () => {
          try {
            if (options.beforeCache) await options.beforeCache();
            await updateFormInCache(form, store);
            if (options.afterCache) await options.afterCache();
          } catch (err) {
            if (options.onError) await options.onError(err);
          }
        });

        // attach listeners to empty the cache on submit
        form.addEventListener('submit', async () => {
          try {
            await deleteFormFromCache(form, store);
          } catch (err) {
            if (options.onError) await options.onError(err);
          }
        });
      } catch (err) {
        // if an error listener was provided, run it
        if (options.onError) await options.onError(err);
      }
    })();
  });
};

// * EXPORTED FUNCTIONS

export interface FormStoreInstance {
  /**
   * Re-attaches FormStore to all forms on the page.
   * Useful when forms are dynamically added or modified.
   */
  refresh: () => void;
}

/**
 * Attaches FormStore to the current page
 * 1. Hydrates forms if there is any existing data in the cache
 * 2. Updates the cache on any form changes
 * 3. Deletes any cached form data on form submission
 *
 * @param options A set of callbacks to be used for UI side effects and error handling
 * @returns An object containing a refresh method for re-initializing forms
 *
 * @example
 * ```typescript
 * import { init } from '@tinybox-software/formstore';
 *
 * const store = init({
 *   beforeHydrate: () => console.log('Loading...'),
 *   afterHydrate: () => console.log('Loaded!'),
 *   beforeCache: () => console.log('Saving...'),
 *   afterCache: () => console.log('Saved!'),
 *   onError: (err) => console.error('Error:', err)
 * });
 * ```
 */
export const init = (options: InitOptions = {}): FormStoreInstance => {
  const customStore = createStore('fs-db', 'formstore');
  attachToForms(customStore, options);

  const formStore: FormStoreInstance = {
    refresh: () => {
      attachToForms(customStore, options);
    },
  };

  return formStore;
};
