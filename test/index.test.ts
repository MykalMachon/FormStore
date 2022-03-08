import { assert, describe, it } from 'vitest';
import { screen } from '@testing-library/dom';

import { init } from '../src/index'

const basicHTMLForm = `
<form id="testing-umd" action="" data-cache>
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
`

describe('Basic Functionality', () => {
  it('should init without errors', () => {
    let throwsError = false;

    document.body.innerHTML = basicHTMLForm;

    init({
      onError: () => {throwsError = true;}
    }) 

    assert.equal(throwsError, false);
  })

  it('should update cache on change', () => {
    assert.equal(true, false);
  });

  it('should hydrate from cache on reload', () => {
    assert.equal(true, false);
  })
});
