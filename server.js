const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Environment variable

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json());

// Explicit route for root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to find shared actors
app.post('/find-shared-actors', async (req, res) => {
  const { title1, title2, type } = req.body;

  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const search1 = await axios.get(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title1)}`);
    if (search1.data.results.length === 0) {
      return res.status(404).json({ error: `No results found for ${title1}` });
    }
    const id1 = search1.data.results[0].id;

    const search2 = await axios.get(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title2)}`);
    if (search2.data.results.length === 0) {
      return res.status(404).json({ error: `No results found for ${title2}` });
    }
    const id2 = search2.data.results[0].id;

    const credits1 = await axios.get(`https://api.themoviedb.org/3/${type}/${id1}/credits?api_key=${TMDB_API_KEY}`);
    const credits2 = await axios.get(`https://api.themoviedb.org/3/${type}/${id2}/credits?api_key=${TMDB_API_KEY}`);

    const actors1 = credits1.data.cast.map(actor => actor.name);
    const actors2 = credits2.data.cast.map(actor => actor.name);

    const sharedActors = actors1.filter(actor => actors2.includes(actor));

    if (sharedActors.length === 0) {
      return res.json({ message: 'No shared actors found.', actors: [] });
    }

    res.json({ actors: sharedActors });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});