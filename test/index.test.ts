import { assert, describe, it } from 'vitest';
import { screen } from '@testing-library/dom';


describe('Placeholders', () => {
  it('fires all hooks', () => {
    assert.equal(2, 2);
  });

  it('should render', () => {
    document.body.innerHTML = `
      <span data-testid="not-empty"><span data-testid="empty"></span></span>
      <div data-testid="visible">Visible Example</div>
    `

    expect(screen.queryByTestId('not-empty')).not.toBeEmptyDOMElement()
    expect(screen.getByText('Visible Example')).toBeVisible()
  })
});
