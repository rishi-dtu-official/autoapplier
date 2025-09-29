const fs = require('fs');

// Create a simple base64-encoded PNG for 16x16 icon
const icon16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFkSURBVDiNpZM9SwNBEIafgJ1YWFhY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY';

// Create 16x16 icon
const icon16Buffer = Buffer.from(icon16Base64, 'base64');
fs.writeFileSync('/workspaces/autoapplier/icons/icon16.png', icon16Buffer);

// For simplicity, copy the same icon for different sizes (in a real extension, you'd want proper sizes)
fs.copyFileSync('/workspaces/autoapplier/icons/icon16.png', '/workspaces/autoapplier/icons/icon48.png');
fs.copyFileSync('/workspaces/autoapplier/icons/icon16.png', '/workspaces/autoapplier/icons/icon128.png');

console.log('Icons created successfully');