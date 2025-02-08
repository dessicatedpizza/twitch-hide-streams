document.addEventListener('DOMContentLoaded', () => {
  const filterInput = document.getElementById('filterInput');
  const addFilterButton = document.getElementById('addFilter');
  const filterList = document.getElementById('filterList');

  // Load existing filters
  chrome.storage.sync.get(['twitchStreamFilters'], (result) => {
    const filters = result.twitchStreamFilters || [];
    updateFilterList(filters);
  });

  // Add new filter
  addFilterButton.addEventListener('click', () => {
    const filterText = filterInput.value.trim().toLowerCase();
    if (!filterText) return;

    chrome.storage.sync.get(['twitchStreamFilters'], (result) => {
      const filters = result.twitchStreamFilters || [];
      if (!filters.includes(filterText)) {
        filters.push(filterText);
        chrome.storage.sync.set({ twitchStreamFilters: filters }, () => {
          updateFilterList(filters);
          filterInput.value = '';
        });
      }
    });
  });

  filterInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      document.getElementById('addFilter').click();
    }
  });

  function updateFilterList(filters) {
    filterList.innerHTML = '';
    filters.forEach(filter => {
      const filterElement = document.createElement('div');
      filterElement.className = 'filter-item';

      const filterText = document.createElement('span');
      filterText.textContent = filter;

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeFilter(filter));

      filterElement.appendChild(filterText);
      filterElement.appendChild(removeButton);
      filterList.appendChild(filterElement);
    });
  }

  function removeFilter(filterToRemove) {
    chrome.storage.sync.get(['twitchStreamFilters'], (result) => {
      const filters = result.twitchStreamFilters || [];
      const updatedFilters = filters.filter(f => f !== filterToRemove);
      chrome.storage.sync.set({ twitchStreamFilters: updatedFilters }, () => {
        updateFilterList(updatedFilters);
      });
    });
  }
});