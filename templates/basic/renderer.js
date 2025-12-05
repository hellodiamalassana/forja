// Renderer process code

function handleAction() {
  console.log('Action déclenchée!');

  // Show notification
  showNotification('Action réussie!', 'Votre application fonctionne correctement.');
}

function showNotification(title, message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b00, #ff8c00);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  notification.innerHTML = `
    <strong style="display: block; margin-bottom: 5px; font-size: 16px;">${title}</strong>
    <span style="font-size: 14px; opacity: 0.9;">${message}</span>
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✅ Renderer process initialized');
