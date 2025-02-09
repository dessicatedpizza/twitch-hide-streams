console.log("Twitch Stream Hider: Hiding streams...");

// Get stored filters
chrome.storage.sync.get(['twitchStreamFilters'], (result) => {
  const filters = result.twitchStreamFilters || [];

  // Get the current pathname
  const pathname = window.location.pathname;

  switch (pathname) {
    case "/directory/following":
      const observer = new MutationObserver((mutations, obs) => {
        // Get all stream elements and side nav cards with a single selector
        const streamElements = document.querySelectorAll(`.live-channel-card, .side-nav-card`);
        const shelfElements = document.querySelectorAll(`div[class*="shelf-card"]`);

        const allElements = [...streamElements, ...shelfElements];

        for (const element of allElements) {
          const streamText = element.textContent.toLowerCase();

          // Check if the stream contains any of the filtered strings
          if (filters.some(filter => {
            const matches = streamText.includes(filter);
            if (matches) {
              console.log("Twitch Stream Hider: Hiding stream due to filter:", filter);
            }
            return matches;
          })) {
            // If it's a shelf element, hide its parent instead
            if (element.matches('div[class*="shelf-card"]')) {
              element.parentElement.style.display = 'none';
            } else {
              element.style.display = 'none';
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    default:

      if (pathname.includes("/directory/category/")) {
        // Create an observer instance
        const observer = new MutationObserver((mutations, obs) => {
          const directoryContainer = document.querySelector('div[data-target="directory-container"]');
          if (directoryContainer) {
            obs.disconnect(); // Stop observing once we find the container

            // Process the streams
            for (const element of directoryContainer.querySelectorAll(`div[style*="order"]`)) {
              const streamText = element.textContent.toLowerCase();
              if (filters.some(filter => {
                const matches = streamText.includes(filter);
                if (matches) {
                  console.log("Twitch Stream Hider: Hiding stream due to filter:", filter);
                }
                return matches;
              })) {
                element.style.display = 'none';
              }
            }
          }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        const observer = new MutationObserver((mutations, obs) => {
          // Get all stream elements and side nav cards with a single selector
          const streamElements = document.getElementsByClassName(`side-nav-card`);

          for (const element of streamElements) {
            const streamText = element.textContent.toLowerCase();

            // Check if the stream contains any of the filtered strings
            if (filters.some(filter => {
              const matches = streamText.includes(filter);
              if (matches) {
                console.log("Twitch Stream Hider: Hiding stream due to filter:", filter);
              }
              return matches;
            })) {
              element.style.display = 'none';
            }
          }
        });

        observer.observe(document.body, {
          childList: true,
          substree: true
        });
      }
      break;
  }
});