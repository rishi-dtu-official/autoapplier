// Popup script for AutoApplier Chrome Extension
document.addEventListener('DOMContentLoaded', function() {
  console.log('AutoApplier popup loaded');
  
  // Initialize popup
  initializeTabs();
  loadUserProfile();
  setupEventListeners();
  checkCurrentFormStatus();
});

let userProfile = {};

// Tab functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// Load user profile from storage
function loadUserProfile() {
  chrome.storage.sync.get(['userProfile'], (result) => {
    if (result.userProfile) {
      userProfile = result.userProfile;
      populateForm(userProfile);
      showStatusMessage('Profile loaded successfully', 'success');
    } else {
      showStatusMessage('No saved profile found. Please fill in your information.', 'info');
    }
  });
}

// Populate form with saved data
function populateForm(profile) {
  // Personal information
  document.getElementById('name').value = profile.name || '';
  document.getElementById('email').value = profile.email || '';
  document.getElementById('phone').value = profile.phone || '';
  document.getElementById('gender').value = profile.gender || '';
  document.getElementById('address').value = profile.address || '';
  
  // Professional information
  document.getElementById('college').value = profile.college || '';
  document.getElementById('degree').value = profile.degree || '';
  document.getElementById('graduation').value = profile.graduation || '';
  document.getElementById('linkedin').value = profile.linkedin || '';
  document.getElementById('github').value = profile.github || '';
  document.getElementById('skills').value = profile.skills || '';
  document.getElementById('experience').value = profile.experience || '';
  document.getElementById('projects').value = profile.projects || '';
  
  // Settings
  document.getElementById('auto-fill-enabled').checked = profile.autoFillEnabled !== false;
  document.getElementById('show-notifications').checked = profile.showNotifications !== false;
  document.getElementById('highlight-fields').checked = profile.highlightFields !== false;
}

// Setup event listeners
function setupEventListeners() {
  // Save profile button
  document.getElementById('save-profile').addEventListener('click', saveProfile);
  
  // Reset form button
  document.getElementById('reset-form').addEventListener('click', resetForm);
  
  // Settings buttons
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importData);
  document.getElementById('clear-data').addEventListener('click', clearData);
  
  // Quick actions
  document.getElementById('fill-current-form').addEventListener('click', fillCurrentForm);
  
  // Auto-save on input change (debounced)
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('input', debounce(autoSave, 1000));
  });
}

// Save profile to storage
function saveProfile() {
  const profile = collectFormData();
  
  // Validate required fields
  if (!profile.name || !profile.email) {
    showStatusMessage('Please fill in at least your name and email address', 'error');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profile.email)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return;
  }
  
  chrome.storage.sync.set({ userProfile: profile }, () => {
    if (chrome.runtime.lastError) {
      showStatusMessage('Error saving profile: ' + chrome.runtime.lastError.message, 'error');
    } else {
      userProfile = profile;
      showStatusMessage('Profile saved successfully!', 'success');
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'saveProfile',
        profile: profile
      });
    }
  });
}

// Auto-save function (for convenience)
function autoSave() {
  const profile = collectFormData();
  if (profile.name || profile.email) { // Only auto-save if basic info exists
    chrome.storage.sync.set({ userProfile: profile });
    userProfile = profile;
  }
}

// Collect form data
function collectFormData() {
  return {
    // Personal information
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    gender: document.getElementById('gender').value,
    address: document.getElementById('address').value.trim(),
    
    // Professional information
    college: document.getElementById('college').value.trim(),
    degree: document.getElementById('degree').value.trim(),
    graduation: document.getElementById('graduation').value.trim(),
    linkedin: document.getElementById('linkedin').value.trim(),
    github: document.getElementById('github').value.trim(),
    skills: document.getElementById('skills').value.trim(),
    experience: document.getElementById('experience').value.trim(),
    projects: document.getElementById('projects').value.trim(),
    
    // Settings
    autoFillEnabled: document.getElementById('auto-fill-enabled').checked,
    showNotifications: document.getElementById('show-notifications').checked,
    highlightFields: document.getElementById('highlight-fields').checked,
    
    // Metadata
    lastUpdated: new Date().toISOString()
  };
}

// Reset form
function resetForm() {
  if (confirm('Are you sure you want to reset the form? This will clear all unsaved changes.')) {
    populateForm(userProfile);
    showStatusMessage('Form reset to last saved state', 'info');
  }
}

// Export profile data
function exportData() {
  const profile = userProfile;
  if (!profile || !profile.name) {
    showStatusMessage('No profile data to export. Please save your profile first.', 'error');
    return;
  }
  
  const dataStr = JSON.stringify(profile, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `autoapplier-profile-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showStatusMessage('Profile data exported successfully', 'success');
}

// Import profile data
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedProfile = JSON.parse(e.target.result);
      
      // Validate imported data
      if (!importedProfile.name || !importedProfile.email) {
        throw new Error('Invalid profile data: missing required fields');
      }
      
      // Populate form with imported data
      populateForm(importedProfile);
      showStatusMessage('Profile data imported successfully. Click Save to store it.', 'success');
      
    } catch (error) {
      showStatusMessage('Error importing data: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to delete all saved data? This action cannot be undone.')) {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        showStatusMessage('Error clearing data: ' + chrome.runtime.lastError.message, 'error');
      } else {
        userProfile = {};
        
        // Clear form
        document.querySelectorAll('input, textarea, select').forEach(element => {
          if (element.type === 'checkbox') {
            element.checked = true; // Default settings to enabled
          } else {
            element.value = '';
          }
        });
        
        showStatusMessage('All data cleared successfully', 'success');
      }
    });
  }
}

// Fill current form
function fillCurrentForm() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // Check if it's a Google Form
    if (!activeTab.url.includes('docs.google.com/forms') && 
        !activeTab.url.includes('forms.google.com')) {
      showStatusMessage('Please navigate to a Google Form first', 'error');
      return;
    }
    
    // Check if profile exists
    if (!userProfile || !userProfile.name) {
      showStatusMessage('Please save your profile information first', 'error');
      return;
    }
    
    // Send message to content script
    chrome.tabs.sendMessage(activeTab.id, { action: 'fillForm' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatusMessage('Error: ' + chrome.runtime.lastError.message, 'error');
      } else if (response && response.success) {
        showStatusMessage('Form filling initiated!', 'success');
        window.close(); // Close popup after successful action
      }
    });
  });
}

// Check current form status
function checkCurrentFormStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const statusDiv = document.getElementById('form-status');
    
    if (activeTab.url.includes('docs.google.com/forms') || 
        activeTab.url.includes('forms.google.com')) {
      
      // Try to get form status from content script
      chrome.tabs.sendMessage(activeTab.id, { action: 'checkFormStatus' }, (response) => {
        if (response) {
          statusDiv.innerHTML = `
            <strong>Google Form Detected</strong><br>
            Fillable fields found: ${response.fieldsCount || 'Analyzing...'}
          `;
          statusDiv.style.borderLeftColor = '#28a745';
        } else {
          statusDiv.innerHTML = `
            <strong>Google Form Detected</strong><br>
            Loading form analysis...
          `;
          statusDiv.style.borderLeftColor = '#ffc107';
        }
      });
    } else {
      statusDiv.innerHTML = `
        <strong>No Google Form Detected</strong><br>
        Navigate to a Google Form to use autofill
      `;
      statusDiv.style.borderLeftColor = '#6c757d';
      document.getElementById('fill-current-form').disabled = true;
    }
  });
}

// Utility functions
function showStatusMessage(message, type) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide after 4 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 4000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}