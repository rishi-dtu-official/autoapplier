// Content script for AutoApplier Chrome Extension
console.log('AutoApplier content script loaded on:', window.location.href);

let userProfile = null;
let isFormDetected = false;

// Initialize when page loads
window.addEventListener('load', initialize);
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
  console.log('Initializing AutoApplier...');
  
  // Get user profile from background script
  chrome.runtime.sendMessage({ action: 'getProfile' }, (response) => {
    if (response && response.profile) {
      userProfile = response.profile;
      console.log('User profile loaded');
      detectForms();
    } else {
      console.log('No user profile found');
    }
  });
}

function detectForms() {
  // Check if we're on a Google Form
  if (window.location.href.includes('docs.google.com/forms') || 
      window.location.href.includes('forms.google.com')) {
    
    console.log('Google Form detected');
    isFormDetected = true;
    
    // Wait for form to fully load
    setTimeout(() => {
      addAutoFillButton();
      highlightFillableFields();
    }, 2000);
  }
}

function addAutoFillButton() {
  // Remove existing button if present
  const existingButton = document.querySelector('.autoapplier-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create autofill button
  const button = document.createElement('button');
  button.className = 'autoapplier-button';
  button.textContent = '🚀 AutoFill Form';
  button.title = 'Click to automatically fill this form with your saved information';
  
  button.addEventListener('click', () => {
    if (userProfile) {
      autoFillForm();
    } else {
      showNotification('Please set up your profile first by clicking the extension icon', 'warning');
    }
  });
  
  document.body.appendChild(button);
}

function highlightFillableFields() {
  const fillableFields = findFillableFields();
  console.log(`Found ${fillableFields.length} fillable fields`);
  
  fillableFields.forEach(field => {
    field.element.style.border = '2px dashed #667eea';
    field.element.title = `AutoApplier can fill this field: ${field.type}`;
  });
}

function findFillableFields() {
  const fields = [];
  
  // Find all input fields, textareas, and select elements
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const fieldInfo = analyzeField(input);
    if (fieldInfo) {
      fields.push({
        element: input,
        type: fieldInfo.type,
        label: fieldInfo.label
      });
    }
  });
  
  return fields;
}

function analyzeField(element) {
  // Get surrounding text to understand what this field is for
  const label = getFieldLabel(element);
  const placeholder = element.placeholder || '';
  const name = element.name || '';
  const type = element.type || '';
  
  const combinedText = `${label} ${placeholder} ${name} ${type}`.toLowerCase();
  
  // Determine field type based on text content
  if (combinedText.includes('name') && !combinedText.includes('company') && !combinedText.includes('file')) {
    return { type: 'name', label: label };
  }
  if (combinedText.includes('email')) {
    return { type: 'email', label: label };
  }
  if (combinedText.includes('phone') || combinedText.includes('mobile') || combinedText.includes('contact')) {
    return { type: 'phone', label: label };
  }
  if (combinedText.includes('college') || combinedText.includes('university') || combinedText.includes('school')) {
    return { type: 'college', label: label };
  }
  if (combinedText.includes('degree') || combinedText.includes('graduation')) {
    return { type: 'degree', label: label };
  }
  if (combinedText.includes('linkedin')) {
    return { type: 'linkedin', label: label };
  }
  if (combinedText.includes('github')) {
    return { type: 'github', label: label };
  }
  if (combinedText.includes('experience') || combinedText.includes('internship') || combinedText.includes('work')) {
    return { type: 'experience', label: label };
  }
  if (combinedText.includes('skill')) {
    return { type: 'skills', label: label };
  }
  if (combinedText.includes('gender')) {
    return { type: 'gender', label: label };
  }
  if (combinedText.includes('address') || combinedText.includes('location') || combinedText.includes('city')) {
    return { type: 'address', label: label };
  }
  if (combinedText.includes('resume') || combinedText.includes('cv')) {
    return { type: 'resume', label: label };
  }
  
  return null;
}

function getFieldLabel(element) {
  // Try to find associated label
  let label = '';
  
  // Check for label element
  const labelElement = document.querySelector(`label[for="${element.id}"]`);
  if (labelElement) {
    label = labelElement.textContent.trim();
  }
  
  // Check parent elements for text
  if (!label) {
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      const text = parent.textContent.trim();
      if (text && text.length < 200) {
        label = text;
        break;
      }
      parent = parent.parentElement;
    }
  }
  
  return label;
}

function autoFillForm() {
  if (!userProfile) {
    showNotification('No profile data available. Please set up your profile first.', 'error');
    return;
  }
  
  showProgress('Starting autofill...');
  
  const fillableFields = findFillableFields();
  let filledCount = 0;
  
  fillableFields.forEach((field, index) => {
    setTimeout(() => {
      const filled = fillField(field);
      if (filled) {
        filledCount++;
        field.element.classList.add('autoapplier-filled');
      }
      
      // Update progress
      const progress = Math.round(((index + 1) / fillableFields.length) * 100);
      showProgress(`Filling fields... ${progress}% (${filledCount}/${fillableFields.length})`);
      
      // Complete
      if (index === fillableFields.length - 1) {
        setTimeout(() => {
          hideProgress();
          showNotification(`Successfully filled ${filledCount} fields!`, 'success');
        }, 500);
      }
    }, index * 300); // Stagger the filling for better UX
  });
}

function fillField(field) {
  const { element, type } = field;
  let value = '';
  
  switch (type) {
    case 'name':
      value = userProfile.name || '';
      break;
    case 'email':
      value = userProfile.email || '';
      break;
    case 'phone':
      value = userProfile.phone || '';
      break;
    case 'college':
      value = userProfile.college || '';
      break;
    case 'degree':
      value = userProfile.degree || '';
      break;
    case 'linkedin':
      value = userProfile.linkedin || '';
      break;
    case 'github':
      value = userProfile.github || '';
      break;
    case 'experience':
      value = userProfile.experience || '';
      break;
    case 'skills':
      value = userProfile.skills || '';
      break;
    case 'gender':
      value = userProfile.gender || '';
      break;
    case 'address':
      value = userProfile.address || '';
      break;
    default:
      return false;
  }
  
  if (!value) return false;
  
  // Fill the field based on its type
  if (element.tagName === 'SELECT') {
    // Handle select dropdown
    const option = Array.from(element.options).find(opt => 
      opt.text.toLowerCase().includes(value.toLowerCase()) || 
      opt.value.toLowerCase().includes(value.toLowerCase())
    );
    if (option) {
      element.value = option.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (element.type === 'radio') {
    // Handle radio buttons
    const radioGroup = document.querySelectorAll(`input[name="${element.name}"]`);
    const matchingRadio = Array.from(radioGroup).find(radio => {
      const radioLabel = getFieldLabel(radio);
      return radioLabel.toLowerCase().includes(value.toLowerCase());
    });
    if (matchingRadio) {
      matchingRadio.checked = true;
      matchingRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (element.type === 'checkbox') {
    // Handle checkboxes (for skills, etc.)
    if (type === 'skills' && value.includes(',')) {
      const skills = value.split(',').map(s => s.trim().toLowerCase());
      const label = getFieldLabel(element).toLowerCase();
      if (skills.some(skill => label.includes(skill))) {
        element.checked = true;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  } else {
    // Handle text inputs and textareas
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  return true;
}

function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.autoapplier-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'autoapplier-notification';
  notification.textContent = message;
  
  // Set color based on type
  switch (type) {
    case 'success':
      notification.style.background = '#4CAF50';
      break;
    case 'warning':
      notification.style.background = '#FF9800';
      break;
    case 'error':
      notification.style.background = '#F44336';
      break;
    default:
      notification.style.background = '#2196F3';
  }
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function showProgress(message) {
  let progress = document.querySelector('.autoapplier-progress');
  
  if (!progress) {
    progress = document.createElement('div');
    progress.className = 'autoapplier-progress';
    document.body.appendChild(progress);
  }
  
  progress.textContent = message;
}

function hideProgress() {
  const progress = document.querySelector('.autoapplier-progress');
  if (progress) {
    setTimeout(() => progress.remove(), 1000);
  }
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    autoFillForm();
    sendResponse({ success: true });
  }
  
  if (request.action === 'checkFormStatus') {
    sendResponse({ 
      isFormDetected: isFormDetected,
      fieldsCount: findFillableFields().length
    });
  }
});