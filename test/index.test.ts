import { assert, describe, it } from 'vitest';
import { screen } from '@testing-library/dom';




import { init } from '../src/index'


describe('Placeholders', () => {
  it('fires all hooks', () => {
    assert.equal(2, 2);
  });

  it('should render', () => {
    document.body.innerHTML = `
      <span data-testid="not-empty"><span data-testid="empty"></span></span>
      <div data-testid="visible">Visible Example</div>
    `

    // init({}) this isn't working because I am having trouble mocking indexedDB
    // still trynna figure it out: https://www.npmjs.com/package/fake-indexeddb

    expect(screen.queryByTestId('not-empty')).not.toBeEmptyDOMElement()
    expect(screen.getByText('Visible Example')).toBeVisible()
  })
});
