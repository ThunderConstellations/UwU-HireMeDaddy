# UwU-HireMeDaddy

UwU-HireMeDaddy is a browser extension/userscript that automatically fills out job application forms and applies for you on major job boards like LinkedIn, Indeed, Monster, and Glassdoor. It uses your resume, AI-generated cover letters, and your personal info to streamline the job application process.

## Features
- Auto-fills forms on LinkedIn, Indeed, Monster, and Glassdoor
- Uploads your resume automatically
- Generates custom cover letters using OpenRouter AI
- Logs every application and notifies you
- Popup UI for API key management and (soon) multi-resume selection
- Modular, easily extensible for more job boards

## Setup
1. **Clone or download this repo.**
2. **Add your resume:**
   - Place your resume as `resume.pdf` in the `assets/` folder.
   - (Planned) You can add multiple resumes and select which to use in the popup.
3. **Configure your info:**
   - Edit `utils/config.js` with your name, email, phone, experience, etc.
4. **Get an OpenRouter API key:**
   - Sign up at [OpenRouter](https://openrouter.ai/) and get your API key.
   - Enter your API key in the popup UI.
5. **Load the extension/userscript:**
   - For Safari: Use a userscript manager or load as an unpacked extension.
   - For Chrome/Firefox: Load as an unpacked extension via the browser's extension page.

## Usage
- Visit a supported job board (LinkedIn, Indeed, Monster, Glassdoor).
- Click the extension popup to:
  - Enter or update your OpenRouter API key
  - (Planned) Select which resume/cover letter to use
  - (Planned) Enable/disable job boards
- Click "Start Auto Apply" or let the script run automatically on matching pages.
- The script will:
  - Fill out all relevant fields
  - Upload your resume
  - Generate and insert a cover letter
  - Submit the application
  - Log the application and notify you

## Troubleshooting
- **Resume not uploading?** Make sure `resume.pdf` is in the `assets/` folder and is a valid PDF.
- **API key issues?** Double-check your OpenRouter API key and re-enter it in the popup.
- **Form not filled?** Some job boards update their forms frequently. Check for updates or report an issue.
- **Want to use a different resume or cover letter?** (Planned) Add more files to `assets/` and select them in the popup.

## Extending/Contributing
- To add a new job board, create a new handler in `content/sites/` following the existing pattern.
- PRs and suggestions are welcome!

## Accessibility & ARIA
- All UI (dashboard, popup) is fully keyboard accessible and screen reader friendly
- ARIA roles, live regions, and focus management for all controls and notifications
- Skip links, focus trap, and reduced motion support

## Logging & Error Handling
- Winston-style rotating logs: errors include timestamps, severity, stack traces, and are purged after 7 days
- Application and error logs are accessible and filterable in the dashboard

## Testing
- Jest/MSW test suite for dashboard, popup, and logger accessibility, ARIA, and error handling
- Uses @testing-library/dom, @testing-library/jest-dom, and msw for robust, modern browser extension testing

## Credits & References
- Inspired by and referencing best practices from:
  - [Easy-Apply-Automater](https://github.com/davidwarshawsky/Easy-Apply-Automater)
  - [LinkedIn-Auto-Job-Apply-or-Save](https://github.com/EienMosu/LinkedIn-Auto-Job-Apply-or-Save)
  - Chrome Web Store: LinkedIn Auto Apply Pro
  - And other open-source job automation tools
- Accessibility/ARIA patterns: [Visual ARIA](https://github.com/WhatSock/visual-aria), [github-a11y](https://github.com/khiga8/github-a11y)
- Animated UI: [DraculaHub](https://github.com/AriTheElk/DraculaHub), [Daztab](https://github.com/ZigaoWang/daztab-old)
- Logging: [winstonjs/winston](https://github.com/winstonjs/winston)
- Testing: [Testing Library](https://github.com/testing-library), [MSW](https://github.com/mswjs/msw)

---

For help or questions, visit [your portfolio](https://rainfury4u.github.io/).
