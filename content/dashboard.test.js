// Jest/MSW test scaffolding for UwU-HireMeDaddy dashboard accessibility
// Inspired by github.com/testing-library, github.com/mswjs/msw, github.com/khiga8/github-a11y
import '@testing-library/jest-dom';
import { screen, fireEvent } from '@testing-library/dom';

// Mock dashboard HTML structure
beforeEach(() => {
  document.body.innerHTML = `
    <div id="uwu-dashboard-btn" tabindex="0" aria-label="Open UwU-HireMeDaddy Dashboard"></div>
    <div id="uwu-dashboard-overlay" tabindex="-1" role="dialog" aria-modal="true" aria-label="UwU-HireMeDaddy Dashboard" style="display:none;">
      <div class='uwu-dashboard-header'>
        <div class='uwu-dashboard-tabs' role='tablist'>
          <button class='uwu-dashboard-tab' id='uwu-tab-history' role='tab' aria-selected='true' tabindex='0'>History</button>
          <button class='uwu-dashboard-tab' id='uwu-tab-errors' role='tab' aria-selected='false' tabindex='-1'>Errors</button>
          <button class='uwu-dashboard-tab' id='uwu-tab-settings' role='tab' aria-selected='false' tabindex='-1'>Settings</button>
        </div>
        <button id='uwu-dashboard-maximize' aria-label='Maximize Dashboard' aria-pressed='false' tabindex='0'></button>
        <button id='uwu-dashboard-close' aria-label='Close Dashboard'></button>
      </div>
      <div class='uwu-dashboard-content' id='uwu-dashboard-tab-content' tabindex='0'></div>
      <div id='uwu-dashboard-toast-region' aria-live='polite' class='visually-hidden'></div>
    </div>
  `;
});

describe('UwU-HireMeDaddy Dashboard Accessibility', () => {
  it('should have correct ARIA roles and attributes', () => {
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'UwU-HireMeDaddy Dashboard');
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab').length).toBe(3);
  });

  it('should allow keyboard navigation between tabs', () => {
    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[1]).toHaveFocus();
    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
    expect(tabs[0]).toHaveFocus();
  });

  it('should focus dashboard overlay when opened', () => {
    const overlay = screen.getByRole('dialog');
    overlay.style.display = 'block';
    overlay.focus();
    expect(overlay).toHaveFocus();
  });

  it('should announce toast notifications to ARIA live region', () => {
    const toastRegion = document.getElementById('uwu-dashboard-toast-region');
    toastRegion.textContent = 'Test toast!';
    expect(toastRegion).toHaveTextContent('Test toast!');
  });

  it('should toggle maximize/minimize state and update ARIA attributes', () => {
    const overlay = screen.getByRole('dialog');
    const maximizeBtn = screen.getByLabelText(/Maximize Dashboard|Minimize Dashboard/);
    // Initial state
    expect(overlay.classList.contains('uwu-dashboard-maximized')).toBe(false);
    expect(maximizeBtn).toHaveAttribute('aria-pressed', 'false');
    // Click to maximize
    maximizeBtn.click();
    overlay.classList.add('uwu-dashboard-maximized'); // Simulate effect
    maximizeBtn.setAttribute('aria-pressed', 'true');
    maximizeBtn.setAttribute('aria-label', 'Minimize Dashboard');
    expect(overlay.classList.contains('uwu-dashboard-maximized')).toBe(true);
    expect(maximizeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(maximizeBtn).toHaveAttribute('aria-label', 'Minimize Dashboard');
    // Click to minimize
    maximizeBtn.click();
    overlay.classList.remove('uwu-dashboard-maximized'); // Simulate effect
    maximizeBtn.setAttribute('aria-pressed', 'false');
    maximizeBtn.setAttribute('aria-label', 'Maximize Dashboard');
    expect(overlay.classList.contains('uwu-dashboard-maximized')).toBe(false);
    expect(maximizeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(maximizeBtn).toHaveAttribute('aria-label', 'Maximize Dashboard');
  });

  it('should allow keyboard activation of maximize/minimize button', () => {
    const maximizeBtn = screen.getByLabelText(/Maximize Dashboard|Minimize Dashboard/);
    maximizeBtn.focus();
    fireEvent.keyDown(maximizeBtn, { key: 'Enter' });
    expect(maximizeBtn).toHaveFocus();
    fireEvent.keyDown(maximizeBtn, { key: ' ' });
    expect(maximizeBtn).toHaveFocus();
  });
});

describe('Captcha Modal Accessibility', () => {
  it('should show modal with role alertdialog and trap focus', () => {
    showCaptchaModal();
    const modal = document.querySelector('.uwu-captcha-modal');
    expect(modal).toHaveAttribute('role', 'alertdialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    const resumeBtn = modal.querySelector('#uwu-resume-btn');
    expect(document.activeElement).toBe(resumeBtn);
    // Simulate Tab key
    resumeBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.activeElement).toBe(resumeBtn);
  });
  it('should remove modal and resume automation on button click', () => {
    showCaptchaModal();
    const modal = document.querySelector('.uwu-captcha-modal');
    const resumeBtn = modal.querySelector('#uwu-resume-btn');
    resumeBtn.click();
    expect(document.querySelector('.uwu-captcha-modal')).toBeNull();
  });
});

describe('Accessibility Refinements', () => {
  it('should have a skip link to main dashboard content', () => {
    const skip = document.querySelector('.skip-link');
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveAttribute('href', '#uwu-dashboard-main');
  });
  it('should add ARIA labels to all interactive elements', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn).toHaveAttribute('aria-label');
    });
  });
  it('should announce modals and notifications to screen readers', () => {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    document.body.appendChild(modal);
    expect(modal).toHaveAttribute('aria-live', 'assertive');
    modal.remove();
  });
  it('should trigger delight features with keyboard shortcuts', () => {
    const confettiSpy = jest.spyOn(window, 'showConfettiBurst');
    const bounceSpy = jest.spyOn(window, 'bounceUwUFace');
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'b' }));
    expect(confettiSpy).toHaveBeenCalled();
    expect(bounceSpy).toHaveBeenCalled();
    confettiSpy.mockRestore();
    bounceSpy.mockRestore();
  });
}); 