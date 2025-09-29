// Background script for AutoApplier Chrome Extension
console.log('AutoApplier background script loaded');

// Listen for extension installation or updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AutoApplier extension installed');
    // Initialize default settings
    chrome.storage.sync.set({
      autoFillEnabled: true,
      showNotifications: true
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfile') {
    // Get user profile from storage
    chrome.storage.sync.get(['userProfile'], (result) => {
      sendResponse({ profile: result.userProfile || null });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'saveProfile') {
    // Save user profile to storage
    chrome.storage.sync.set({ userProfile: request.profile }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'showNotification') {
    // Show notification to user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'AutoApplier',
      message: request.message
    });
  }
});

// Optional: Handle when user clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, but we can also add logic here if needed
  console.log('Extension icon clicked on tab:', tab.url);
});