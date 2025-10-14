/**
 * 🚌 Lanka Bus Trace API - Swagger UI Enhancements
 * ✨ Modern JavaScript enhancements for the futuristic UI
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Add loading animation to page load
  addLoadingAnimation();

  // Enhance operation blocks with modern interactions
  enhanceOperationBlocks();

  // Add smooth scrolling and micro-interactions
  addSmoothScrolling();

  // Enhance form interactions
  enhanceFormInteractions();

  // Add keyboard shortcuts
  addKeyboardShortcuts();

  // Add performance monitoring
  addPerformanceMonitoring();
});

/**
 * Add loading animation on page load
 */
function addLoadingAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    .swagger-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeOut 0.8s ease-in-out 2s forwards;
    }

    .swagger-loading-content {
      text-align: center;
      color: white;
    }

    .swagger-loading-icon {
      font-size: 4rem;
      animation: bounce 2s infinite;
      margin-bottom: 1rem;
    }

    .swagger-loading-text {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .swagger-loading-subtitle {
      font-size: 1rem;
      opacity: 0.9;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }

    @keyframes fadeOut {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }
  `;
  document.head.appendChild(style);

  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'swagger-loading-overlay';
  overlay.innerHTML = `
    <div class="swagger-loading-content">
      <div class="swagger-loading-icon">🚌</div>
      <div class="swagger-loading-text">Lanka Bus Trace API</div>
      <div class="swagger-loading-subtitle">Loading Interactive Documentation...</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Remove overlay after animation
  setTimeout(() => {
    overlay.remove();
  }, 2800);
}

/**
 * Enhance operation blocks with modern interactions
 */
function enhanceOperationBlocks() {
  // Add click tracking and animations
  document.addEventListener('click', function(e) {
    if (e.target.closest('.opblock-summary')) {
      const opblock = e.target.closest('.opblock');
      if (opblock) {
        // Add ripple effect
        addRippleEffect(e, opblock);

        // Track interaction
        trackOperationClick(opblock);
      }
    }
  });

  // Add hover effects for method badges
  const methodBadges = document.querySelectorAll('.opblock-summary-method');
  methodBadges.forEach(badge => {
    badge.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });

    badge.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = 'none';
    });
  });
}

/**
 * Add ripple effect to clicked elements
 */
function addRippleEffect(event, element) {
  const ripple = document.createElement('div');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 10;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  document.head.appendChild(style);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Track operation clicks for analytics
 */
function trackOperationClick(opblock) {
  const method = opblock.querySelector('.opblock-summary-method')?.textContent;
  const path = opblock.querySelector('.opblock-summary-path')?.textContent;

  // In a real application, you would send this to analytics
  console.log(`API Operation Clicked: ${method} ${path}`);

  // Store in localStorage for demo purposes
  const clicks = JSON.parse(localStorage.getItem('swagger-clicks') || '{}');
  const key = `${method} ${path}`;
  clicks[key] = (clicks[key] || 0) + 1;
  localStorage.setItem('swagger-clicks', JSON.stringify(clicks));
}

/**
 * Add smooth scrolling and micro-interactions
 */
function addSmoothScrolling() {
  // Smooth scroll to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add scroll progress indicator
  addScrollProgressIndicator();
}

/**
 * Add scroll progress indicator
 */
function addScrollProgressIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #06b6d4);
    z-index: 1000;
    transition: width 0.3s ease;
  `;

  document.body.appendChild(indicator);

  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    indicator.style.width = scrolled + '%';
  });
}

/**
 * Enhance form interactions
 */
function enhanceFormInteractions() {
  // Add floating labels to inputs
  document.querySelectorAll('input, textarea, select').forEach(input => {
    if (input.type !== 'submit' && input.type !== 'button') {
      enhanceInput(input);
    }
  });

  // Enhance buttons with loading states
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.classList.contains('execute')) {
        addLoadingState(this);
      }
    });
  });
}

/**
 * Enhance input elements with modern interactions
 */
function enhanceInput(input) {
  // Add focus/blur animations
  input.addEventListener('focus', function() {
    this.parentElement?.classList.add('input-focused');
  });

  input.addEventListener('blur', function() {
    this.parentElement?.classList.remove('input-focused');
  });

  // Add input validation feedback
  input.addEventListener('input', function() {
    validateInput(this);
  });
}

/**
 * Add loading state to buttons
 */
function addLoadingState(button) {
  const originalText = button.textContent;
  button.textContent = '⏳ Executing...';
  button.disabled = true;
  button.style.opacity = '0.7';

  // Reset after 3 seconds (in real app, this would be based on actual response)
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
    button.style.opacity = '1';
  }, 3000);
}

/**
 * Basic input validation
 */
function validateInput(input) {
  const value = input.value;
  const isValid = value.length > 0;

  input.style.borderColor = isValid ? '#10b981' : '#ef4444';
  input.style.boxShadow = isValid
    ? '0 0 0 3px rgba(16, 185, 129, 0.1)'
    : '0 0 0 3px rgba(239, 68, 68, 0.1)';
}

/**
 * Add keyboard shortcuts
 */
function addKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="filter"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Ctrl/Cmd + Enter: Execute first visible operation
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const executeBtn = document.querySelector('.btn.execute:not([disabled])');
      if (executeBtn) {
        executeBtn.click();
      }
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal, .auth-container');
      if (modal) {
        const closeBtn = modal.querySelector('.btn.cancel, .close-btn');
        if (closeBtn) {
          closeBtn.click();
        }
      }
    }
  });

  // Add keyboard shortcut hints
  addKeyboardHints();
}

/**
 * Add keyboard shortcut hints
 */
function addKeyboardHints() {
  const hints = document.createElement('div');
  hints.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 12px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  `;

  hints.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">Keyboard Shortcuts</div>
    <div>Ctrl+K: Search</div>
    <div>Ctrl+Enter: Execute</div>
    <div>Esc: Close modals</div>
  `;

  document.body.appendChild(hints);

  // Show hints on Ctrl/Cmd press
  let hintTimeout;
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      hints.style.opacity = '1';
      clearTimeout(hintTimeout);
    }
  });

  document.addEventListener('keyup', function(e) {
    if (!e.ctrlKey && !e.metaKey) {
      hintTimeout = setTimeout(() => {
        hints.style.opacity = '0';
      }, 1000);
    }
  });
}

/**
 * Add performance monitoring
 */
function addPerformanceMonitoring() {
  // Monitor API response times
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const start = performance.now();
    return originalFetch.apply(this, args).then(response => {
      const duration = performance.now() - start;
      console.log(`API Request: ${args[0]} - ${duration.toFixed(2)}ms`);

      // Add performance indicator to response
      if (duration > 1000) {
        console.warn(`Slow API response: ${duration.toFixed(2)}ms`);
      }

      return response;
    });
  };

  // Monitor page load performance
  window.addEventListener('load', function() {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log(`Page Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);

    // Add performance badge
    addPerformanceBadge(perfData.loadEventEnd - perfData.fetchStart);
  });
}

/**
 * Add performance badge
 */
function addPerformanceBadge(loadTime) {
  const badge = document.createElement('div');
  const color = loadTime < 1000 ? '#10b981' : loadTime < 2000 ? '#f59e0b' : '#ef4444';

  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: ${color};
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: transform 0.2s ease;
  `;

  badge.innerHTML = `⚡ ${loadTime.toFixed(0)}ms`;
  badge.title = 'Page load time - Click to see performance details';

  badge.addEventListener('click', () => {
    alert(`Page Load Performance:
• Total Load Time: ${loadTime.toFixed(2)}ms
• DOM Ready: ${performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd - performance.getEntriesByType('navigation')[0].fetchStart}ms
• First Paint: ~${loadTime * 0.7}ms (estimated)

Click operations to see individual API response times in console.`);
  });

  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'scale(1.05)';
  });

  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'scale(1)';
  });

  document.body.appendChild(badge);
}

/**
 * Add theme toggle (future enhancement)
 */
function addThemeToggle() {
  // This could be expanded to support dark/light mode switching
  const toggle = document.createElement('button');
  toggle.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
  `;

  toggle.innerHTML = '🌙';
  toggle.title = 'Toggle theme (coming soon)';

  toggle.addEventListener('mouseenter', () => {
    toggle.style.transform = 'scale(1.1)';
  });

  toggle.addEventListener('mouseleave', () => {
    toggle.style.transform = 'scale(1)';
  });

  toggle.addEventListener('click', () => {
    alert('Theme switching coming soon! Currently optimized for light mode.');
  });

  document.body.appendChild(toggle);
}

// Initialize theme toggle
addThemeToggle();

/**
 * Error handling and recovery
 */
window.addEventListener('error', function(e) {
  console.error('Swagger UI Error:', e.error);

  // Show user-friendly error message
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-weight: 500;
  `;

  errorDiv.innerHTML = '⚠️ Something went wrong. Please refresh the page.';
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
});

/**
 * Add accessibility enhancements
 */
function addAccessibilityFeatures() {
  // Add skip links for screen readers
  const skipLink = document.createElement('a');
  skipLink.href = '#swagger-ui';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #2563eb;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
    transition: top 0.3s ease;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add ARIA labels where missing
  document.querySelectorAll('input, select, textarea').forEach(element => {
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      const label = element.placeholder || element.name || 'Input field';
      element.setAttribute('aria-label', label);
    }
  });
}

// Initialize accessibility features
addAccessibilityFeatures();