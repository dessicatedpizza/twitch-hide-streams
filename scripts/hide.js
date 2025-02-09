console.log("Twitch Stream Hider: Hiding streams...");

// Get stored filters
chrome.storage.sync.get(['twitchStreamFilters'], (result) => {
  const filters = result.twitchStreamFilters || [];

  // Helper function to check and hide elements based on filters
  const hideFilteredElements = (elements, getParent = false) => {
    for (const element of elements) {
      const streamText = element.textContent.toLowerCase();

      if (filters.some(filter => {
        const matches = streamText.includes(filter);
        if (matches) {
          console.log("Twitch Stream Hider: Hiding stream due to filter:", filter);
        }
        return matches;
      })) {
        const targetElement = getParent ? element.parentElement : element;
        targetElement.style.display = 'none';
      }
    }
  };

  // Create a single observer function that handles different page types
  const createObserver = (selector, options = {}) => {
    return new MutationObserver((mutations, obs) => {
      if (options.container) {
        const container = document.querySelector(options.container);
        if (container) {
          obs.disconnect();
          hideFilteredElements(container.querySelectorAll(selector));
        }
        return;
      }

      const elements = document.querySelectorAll(selector);
      hideFilteredElements(elements, options.useParent);
    });
  };

  // Get the current pathname
  const pathname = window.location.pathname;

  let observer;

  switch (pathname) {
    case "/directory/following":
      observer = createObserver('.live-channel-card, .side-nav-card, div[class*="shelf-card"]', { useParent: true });
      break;
    default:
      if (pathname.includes("/directory/category/")) {
        observer = createObserver('div[style*="order"]', {
          container: 'div[data-target="directory-container"]'
        });
      } else {
        observer = createObserver('.side-nav-card');
      }
      break;
  }

  // Start observing
  if (observer) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});