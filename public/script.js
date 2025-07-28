document.getElementById('actor-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const title1 = document.getElementById('title1').value;
  const title2 = document.getElementById('title2').value;
  const type = document.getElementById('type').value;
  const resultsDiv = document.getElementById('results');

  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/find-shared-actors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title1, title2, type }),
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