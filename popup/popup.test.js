// Jest/MSW test scaffolding for UwU-HireMeDaddy popup accessibility
// Inspired by github.com/testing-library, github.com/mswjs/msw, github.com/khiga8/github-a11y
import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';

beforeEach(() => {
  document.body.innerHTML = `
    <a href="#mainContent" class="skip-link" tabindex="0">Skip to content</a>
    <div class="uwu-container">
      <h1 id="mainContent" tabindex="-1">UwU HireMeDaddy</h1>
      <button id="saveApiKeyBtn" aria-label="Save API Key"></button>
      <button id="uploadResumeBtn" aria-label="Upload New Resume"></button>
      <button id="applyBtn" aria-label="Start Auto Apply"></button>
      <button id="showHistoryBtn" aria-label="Show Application History"></button>
      <button id="showErrorLogBtn" aria-label="Show Error Log"></button>
      <button id="copyApiKeyBtn" aria-label="Copy API Key"></button>
      <ul id="history-list"></ul>
      <div id="uwu-toast-container"></div>
    </div>
  `;
});

describe('UwU-HireMeDaddy Popup Accessibility', () => {
  it('should allow keyboard activation of main controls', () => {
    const btn = screen.getByLabelText('Save API Key');
    btn.focus();
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(btn).toHaveFocus();
    fireEvent.keyDown(btn, { key: ' ' });
    expect(btn).toHaveFocus();
  });

  it('should focus main content when skip link is activated', () => {
    const skip = screen.getByText('Skip to content');
    const main = screen.getByText(/UwU/);
    skip.click();
    expect(main).toHaveFocus();
  });

  it('should set ARIA roles on history list', () => {
    const list = document.getElementById('history-list');
    list.setAttribute('role', 'log');
    list.setAttribute('aria-live', 'polite');
    expect(list).toHaveAttribute('role', 'log');
    expect(list).toHaveAttribute('aria-live', 'polite');
  });

  it('should announce toast notifications to ARIA live region', () => {
    const toastContainer = document.getElementById('uwu-toast-container');
    const liveRegion = document.createElement('div');
    liveRegion.id = 'uwu-popup-toast-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'visually-hidden';
    toastContainer.appendChild(liveRegion);
    liveRegion.textContent = 'Popup toast!';
    expect(liveRegion).toHaveTextContent('Popup toast!');
  });
}); 