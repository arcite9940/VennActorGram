document.addEventListener('DOMContentLoaded', () => {
  // Night Mode Toggle
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'night') {
    document.body.classList.add('night-mode');
  }

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    const theme = document.body.classList.contains('night-mode') ? 'night' : 'light';
    localStorage.setItem('theme', theme);
  });

  // Autocomplete Setup
  const setupAutocomplete = (inputId, suggestionsId, idInputId, typeInputId) => {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    const idInput = document.getElementById(idInputId);
    const typeInput = document.getElementById(typeInputId);

    input.addEventListener('input', async () => {
      const query = input.value.trim();
      if (query.length < 2) {
        suggestions.innerHTML = '';
        return;
      }

      try {
        const response = await fetch(`/search-media?query=${encodeURIComponent(query)}`);
        const results = await response.json();

        suggestions.innerHTML = results.map(item => `<li data-id="${item.id}" data-type="${item.type}">${item.title} (${item.release_year})</li>`).join('');

        // Handle suggestion click
        suggestions.querySelectorAll('li').forEach(li => {
          li.addEventListener('click', () => {
            // Truncate long titles for display (e.g., max 150 chars)
            //const displayText = li.textContent.length > 150 ? li.textContent.substring(0, 147) + '...' : li.textContent;
            input.value = li.textContent;
            idInput.value = li.dataset.id;
            typeInput.value = li.dataset.type;
            suggestions.innerHTML = '';
          });
        });
      } catch (error) {
        suggestions.innerHTML = '<li>Error fetching suggestions</li>';
      }
    });

    // Clear suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!suggestions.contains(e.target) && e.target !== input) {
        suggestions.innerHTML = '';
      }
    });
  };

  // Initialize autocomplete for both inputs
  setupAutocomplete('media1', 'media1-suggestions', 'media1-id', 'media1-type');
  setupAutocomplete('media2', 'media2-suggestions', 'media2-id', 'media2-type');

  // Form Submission
  document.getElementById('actor-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id1 = document.getElementById('media1-id').value;
    const type1 = document.getElementById('media1-type').value;
    const id2 = document.getElementById('media2-id').value;
    const type2 = document.getElementById('media2-type').value;
    const resultsDiv = document.getElementById('results');

    if (!id1 || !type1 || !id2 || !type2) {
      resultsDiv.innerHTML = '<p class="error">Please select both media titles from the suggestions.</p>';
      return;
    }

    resultsDiv.innerHTML = '<p>Loading...</p>';

    try {
      const response = await fetch('/find-shared-actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id1, type1, id2, type2 }),
      });

      const data = await response.json();

      if (data.error) {
        resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
        return;
      }

      if (data.actors.length === 0) {
        resultsDiv.innerHTML = `<p>${data.message}</p>`;
        return;
      }

      const actorList = data.actors.map(actor => `<li>${actor}</li>`).join('');
      resultsDiv.innerHTML = `<h2>Shared Actors:</h2><ul>${actorList}</ul>`;
    } catch (error) {
      resultsDiv.innerHTML = '<p class="error">An error occurred. Please try again.</p>';
    }
  });
});