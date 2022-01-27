import { get, set, del, createStore, UseStore } from 'idb-keyval';

// * CUSTOM TYPES

type InitOptions = {
  beforeHydrate?: Function;
  afterHydrate?: Function;
  beforeCache?: Function;
  afterCache?: Function;
  onError?: Function;
};

type CachedInput = HTMLInputElement | HTMLTextAreaElement;

// * INTERNAL PRIVATE FUNCTIONS

/**
 * gets the form from cache and hydrates the page
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<Void>
 */
const getFormFromCache = async (form: HTMLFormElement, store: UseStore) => {
  const formId = form.id || 'unknown';
  const formKey = `form#${formId}`;

  // attempt to get the form from cache
  const formInCache = await get(formKey, store);

  // hydrate the HTML form
  formInCache?.values.forEach((value) => {
    const id = Object.keys(value)[0];
    const el = form.querySelector(`input#${id}, textarea#${id}`) as CachedInput;

    el.value = value[id];
  });
};

/**
 * updates the form in cache when changes occur
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<Void>
 */
const updateFormInCache = async (form: HTMLFormElement, store: UseStore) => {
  const formId = form.id || 'unknown';
  const inputs = [...form.querySelectorAll('input, textarea')] as CachedInput[];

  const formKey = `form#${formId}`;
  const formValues = inputs.map((input) => ({ [input.id]: input.value }));

  return set(formKey, { values: formValues }, store);
};

/**
 * deletes a form from the cache
 *
 * @param form the form to update in cache
 * @param store the custom store used by formstore
 * @returns Promise<Void>
 */
const deleteFormFromCache = (form: HTMLFormElement, store: UseStore) => {
  const formId = form.id || 'unknown';
  const formKey = `form#${formId}`;

  return del(formKey, store);
};

/**
 * attaches to all forms present in the page
 *
 * @param store<UseStore>: the form store
 * @returns void
 */
const attachToForms = (store: UseStore, options: InitOptions) => {
  const formEls = [
    ...document.querySelectorAll('form[data-cache]'),
  ] as HTMLFormElement[];

  formEls.forEach(async (form: HTMLFormElement) => {
    // for each form, setup appropraite listeners
    try {
      // load in data from the cache & hydrate the page
      if (options.beforeHydrate) options.beforeHydrate();
      await getFormFromCache(form, store);
      if (options.afterHydrate) options.afterHydrate();

      // attach listeners to update the cache on change
      form.addEventListener('change', async () => {
        if (options.beforeCache) options.beforeCache();
        await updateFormInCache(form, store);
        if (options.afterCache) options.afterCache();
      });

      // attach listeners to empty the cache on submit
      form.addEventListener(
        'submit',
        async () => await deleteFormFromCache(form, store)
      );
    } catch (err) {
      // if an options listener was provided, run it
      if (options.onError) options.onError(err);
    }
  });
};

// * EXPORTED FUNCTIONS

/**
 * attaches FormStore to the current page
 * 1. hydrates form if there is any existing data in the cache
 * 2. updates the cache on any form changes
 * 3. deletes any cached form data on form submission
 *
 * @param options a set of callbacks to be used for UI side effects
 * @returns an object containing a refresh method for updating the cache on external changes
 */
export const init = (options: InitOptions) => {
  const customStore = createStore('fs-db', 'formstore');
  attachToForms(customStore, options);

  const formStore = {
    refresh: () => {
      attachToForms(customStore, options);
    }, // if an external change occurs, use this to refresh the forms from cache
  };

  return formStore;
};
