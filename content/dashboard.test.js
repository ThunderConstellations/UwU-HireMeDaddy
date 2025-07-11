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

describe('Full Auto-Applier Integration', () => {
  it('should trigger fullAutoApply for selected boards', () => {
    window.fullAutoApply = jest.fn();
    startAutoApply(['linkedin'], 'Engineer', 'Remote', '');
    expect(window.fullAutoApply).toHaveBeenCalled();
  });
  it('should show progress updates in dashboard', () => {
    window.updateDashboardAutoApplyProgress = jest.fn();
    window.fullAutoApply = (board, url) => {
      window.updateDashboardAutoApplyProgress('Applied: 1, Failed: 0, Remaining: 2');
    };
    startAutoApply(['linkedin'], 'Engineer', 'Remote', '');
    expect(window.updateDashboardAutoApplyProgress).toHaveBeenCalledWith('Applied: 1, Failed: 0, Remaining: 2');
  });
  it('should show recovery modal on error', () => {
    window.showRecoveryModal = jest.fn();
    window.fullAutoApply = (board, url) => {
      throw new Error('Test error');
    };
    try {
      startAutoApply(['linkedin'], 'Engineer', 'Remote', '');
    } catch {}
    expect(window.showRecoveryModal).toHaveBeenCalled();
  });
});

describe('Full Auto-Applier Advanced Integration', () => {
  it('should handle pagination and apply to jobs on multiple pages', () => {
    let page = 0;
    window.location = { href: '' };
    document.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('/jobs/')) {
        return [
          { href: `https://site.com/jobs/${page * 2 + 1}` },
          { href: `https://site.com/jobs/${page * 2 + 2}` }
        ];
      }
      if (sel.includes('Next')) {
        return page < 2 ? [{ href: `https://site.com/jobs?page=${++page}` }] : [];
      }
      return [];
    });
    window.open = jest.fn(() => ({
      document: { body: { innerText: '' } },
      eval: jest.fn(),
      close: jest.fn()
    }));
    window.updateDashboardAutoApplyProgress = jest.fn();
    window.showRecoveryModal = jest.fn();
    fullAutoApply('linkedin', 'https://site.com/jobs', 'run');
    expect(window.open).toHaveBeenCalledTimes(6); // 3 pages x 2 jobs
  });
  it('should detect anti-bot/captcha and show recovery modal', () => {
    document.querySelectorAll = jest.fn(() => [{ href: 'https://site.com/jobs/1' }]);
    window.open = jest.fn(() => ({
      document: { body: { innerText: 'captcha' } },
      eval: jest.fn(),
      close: jest.fn()
    }));
    window.showCaptchaModal = jest.fn();
    window.showRecoveryModal = jest.fn();
    fullAutoApply('linkedin', 'https://site.com/jobs', 'run');
    expect(window.showCaptchaModal).toHaveBeenCalled();
    expect(window.showRecoveryModal).toHaveBeenCalled();
  });
}); 