import { assert, describe, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { init } from '../src/index';
import { get, createStore, clear } from 'idb-keyval';

const basicHTMLForm = `
<form id="testing-umd" action="" data-cache="">
  <fieldset>
    <legend>personal info</legend>
    <div class="form-control">
      <label for="name">name</label>
      <input type="text" id="name">
    </div>
    <div class="form-control">
      <label for="email">email</label>
      <input type="email" id="email">
    </div>
    <div class="form-control">
      <label for="fav_food">Favourite Food</label>
      <select name="fav_food" id="fav_food">
        <option value="pizza">Pizza 🍕</option>
        <option value="spaghetti">Spaghetti 🍝</option>
        <option value="burgers">Burgers 🍔</option>
      </select>
    </div>
    <div class="form-control">
      <label for="about">about</label>
      <textarea name="about" id="about" cols="30" rows="3"></textarea>
    </div>
  </fieldset>
  <button type="submit">submit form</button>
</form>

<div class="toast-wrapper">
  <div id="toast" class="toast hidden"></div>
</div>
`;

describe('Basic Functionality', () => {
  beforeEach(async () => {
    // Clear the DOM
    document.body.innerHTML = '';

    // Clear IndexedDB
    const customStore = createStore('fs-db', 'formstore');
    await clear(customStore);
  });

  it('can init without errors', () => {
    let throwsError = false;

    document.body.innerHTML = basicHTMLForm;

    init({
      onError: () => {
        throwsError = true;
      },
    });

    assert.equal(throwsError, false);
  });

  it('can create an indexedDB database', async () => {
    document.body.innerHTML = basicHTMLForm;
    let didErrorOut = false;

    init({ onError: () => (didErrorOut = true) });

    const database = indexedDB.open('fs-db');
    database.onsuccess = () => {
      expect(database.result.objectStoreNames[0]).toBe('formstore');
    };
    database.onerror = () => (didErrorOut = true);
    database.onblocked = () => (didErrorOut = true);

    assert.equal(didErrorOut, false);
  });

  it('can update cache on change', async () => {
    document.body.innerHTML = basicHTMLForm;
    let didErrorOut = false;

    init({ onError: () => (didErrorOut = true) });

    const user = userEvent.setup();

    // make a form change
    await user.click(screen.getByLabelText('name'));
    await user.keyboard('John Doe');
    await user.tab();
    await user.keyboard('johndoe@gmail.com');
    await user.tab();

    // make sure it is visible in the cache
    assert.equal(false, didErrorOut);
  });

  it('should hydrate from cache on reload', async () => {
    document.body.innerHTML = basicHTMLForm;
    let didErrorOut = false;

    // Initialize FormStore
    const store = init({ onError: () => (didErrorOut = true) });

    const user = userEvent.setup();

    // Fill in form data
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const selectInput = document.getElementById(
      'fav_food'
    ) as HTMLSelectElement;
    const textareaInput = document.getElementById(
      'about'
    ) as HTMLTextAreaElement;

    // Clear any previous values first
    nameInput.value = '';
    emailInput.value = '';

    // Fill in the form
    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'jane@example.com');
    await user.selectOptions(selectInput, 'spaghetti');
    await user.type(textareaInput, 'Test bio');

    // Manually trigger change event on textarea since userEvent.type doesn't always trigger it
    textareaInput.dispatchEvent(new Event('change', { bubbles: true }));

    // Wait for cache to update
    await waitFor(
      async () => {
        const customStore = createStore('fs-db', 'formstore');
        const cached = await get('form#testing-umd', customStore);
        assert.ok(cached, 'Cache should exist');
      },
      { timeout: 2000 }
    );

    // Clear the form to simulate reload
    nameInput.value = '';
    emailInput.value = '';
    selectInput.value = 'pizza';
    textareaInput.value = '';

    // Verify form is empty
    assert.equal(nameInput.value, '');
    assert.equal(emailInput.value, '');

    // Re-initialize FormStore to trigger hydration
    store.refresh();

    // Wait for hydration to complete
    await waitFor(
      () => {
        assert.equal(nameInput.value, 'Jane Doe');
        assert.equal(emailInput.value, 'jane@example.com');
        assert.equal(selectInput.value, 'spaghetti');
        assert.equal(textareaInput.value, 'Test bio');
      },
      { timeout: 2000 }
    );

    assert.equal(didErrorOut, false);
  });

  it('should delete on form submission', async () => {
    document.body.innerHTML = basicHTMLForm;
    let didErrorOut = false;
    let submitHandled = false;

    // Initialize FormStore
    init({ onError: () => (didErrorOut = true) });

    const user = userEvent.setup();

    // Fill in form data
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const form = document.getElementById('testing-umd') as HTMLFormElement;

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');

    // Wait for cache to be saved
    const customStore = createStore('fs-db', 'formstore');
    await waitFor(
      async () => {
        const cached = await get('form#testing-umd', customStore);
        assert.ok(cached, 'Cache should exist before submission');
      },
      { timeout: 2000 }
    );

    // Prevent actual form submission but still let the submit event fire
    form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        submitHandled = true;
      },
      { once: true }
    );

    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Verify submit was triggered
    assert.equal(submitHandled, true, 'Submit event should have fired');

    // Wait for cache to be cleared (with longer timeout to account for async deletion)
    await waitFor(
      async () => {
        const cached = await get('form#testing-umd', customStore);
        assert.equal(
          cached,
          undefined,
          'Cache should be cleared after submission'
        );
      },
      { timeout: 3000 }
    );

    assert.equal(didErrorOut, false);
  });
});
