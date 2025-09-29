# AutoApplier Development Guide

## Project Structure

```
autoapplier/
├── manifest.json          # Extension configuration
├── background.js          # Service worker script
├── content.js            # Content script for form detection
├── content.css           # Styles for content script UI
├── popup.html            # Extension popup interface
├── popup.css            # Popup styles
├── popup.js             # Popup functionality
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md            # Main documentation
├── INSTALLATION.md      # Installation guide
├── LICENSE             # MIT License
└── DEVELOPMENT.md      # This file
```

## Architecture Overview

### Manifest V3 Structure
- **Service Worker** (`background.js`): Handles extension lifecycle and storage
- **Content Script** (`content.js`): Injected into Google Forms to detect and fill fields
- **Popup** (`popup.html/js/css`): User interface for profile management

### Key Components

#### 1. Background Script (`background.js`)
- Manages extension installation and updates
- Handles messages between popup and content script
- Manages Chrome storage operations
- Shows notifications to users

#### 2. Content Script (`content.js`)
- Detects Google Forms automatically
- Analyzes form fields using text matching algorithms
- Provides visual feedback (highlighting, notifications)
- Implements the autofill functionality with staggered timing

#### 3. Popup Interface (`popup.html/js/css`)
- Three-tab interface for profile management
- Real-time form validation
- Auto-save functionality
- Export/import capabilities
- Settings management

## Development Setup

### Prerequisites
- Google Chrome (latest version)
- Text editor or IDE
- Basic knowledge of JavaScript, HTML, CSS

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autoapplier
   ```

2. **Load extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

3. **Make changes**
   - Edit the source files
   - Use "Reload" button in Chrome extensions page to test changes

### Testing

#### Test Cases to Verify

1. **Profile Management**
   - Save profile with various field combinations
   - Export and import profile data
   - Test form validation (required fields)

2. **Form Detection**
   - Test on different Google Form layouts
   - Verify field type detection accuracy
   - Check edge cases (hidden fields, complex layouts)

3. **Autofill Functionality**
   - Test all supported field types
   - Verify visual feedback and notifications
   - Test with partially filled forms

## Code Style Guidelines

### JavaScript
- Use modern ES6+ features
- Implement error handling for all async operations
- Use meaningful variable and function names
- Add comments for complex logic

### CSS
- Use CSS custom properties for theming
- Follow BEM naming convention where applicable
- Ensure responsive design principles

### HTML
- Use semantic HTML elements
- Include proper accessibility attributes
- Maintain clean, indented structure

## Chrome Extension APIs Used

### Storage API
```javascript
chrome.storage.sync.set({key: value})
chrome.storage.sync.get(['key'], callback)
```

### Runtime API
```javascript
chrome.runtime.onMessage.addListener()
chrome.runtime.sendMessage()
```

### Tabs API
```javascript
chrome.tabs.query()
chrome.tabs.sendMessage()
```

## Security Considerations

### Content Security Policy
- No inline scripts or styles
- All resources loaded from extension package
- No external API calls

### Data Privacy
- All data stored locally using Chrome Storage API
- No data transmission to external servers
- User has full control over their data

### Permissions
- Minimal permissions requested
- Only access to Google Forms domains
- Storage permission for profile data

## Performance Optimizations

### Form Detection
- Debounced form analysis to prevent excessive processing
- Cached field analysis results
- Efficient DOM querying with specific selectors

### Autofill Process
- Staggered field filling for better user experience
- Progress indicators for long forms
- Non-blocking async operations

## Feature Roadmap

### Version 1.1 (Planned)
- Support for more form platforms (TypeForm, JotForm)
- Advanced field matching with machine learning
- Multiple profile support for different job types
- Form templates and custom field mapping

### Version 1.2 (Future)
- Resume/CV upload integration
- Application tracking and analytics
- Integration with job boards
- Team collaboration features

## Contributing Guidelines

### Submitting Issues
1. Use clear, descriptive titles
2. Include steps to reproduce
3. Provide browser version and extension version
4. Include relevant error messages or screenshots

### Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Update documentation if needed
5. Submit PR with clear description

### Code Review Process
- All changes require review
- Test on multiple Google Forms
- Verify no breaking changes to existing functionality
- Check performance impact

## Building for Production

### Pre-submission Checklist
- [ ] All features working correctly
- [ ] No console errors or warnings
- [ ] Icons and images optimized
- [ ] Privacy policy updated if needed
- [ ] Version number incremented in manifest.json

### Chrome Web Store Submission
1. Zip the extension files (exclude development files)
2. Create promotional images and screenshots
3. Write detailed description and changelog
4. Submit for review through Chrome Web Store Developer Dashboard

## Debugging Tips

### Common Issues

1. **Content Script Not Loading**
   - Check manifest.json matches property
   - Verify permissions for target domains
   - Look for JavaScript errors in console

2. **Storage Not Working**
   - Check Chrome storage quotas
   - Verify async/await or callback usage
   - Test with chrome.storage.local as fallback

3. **Form Fields Not Detected**
   - Inspect DOM structure of problematic forms
   - Test field analysis algorithm with console.log
   - Check for dynamic content loading

### Development Tools
- Chrome DevTools for debugging
- Extension DevTools for storage inspection
- Console logging for content script debugging

## License

This project is licensed under the MIT License. See LICENSE file for details.