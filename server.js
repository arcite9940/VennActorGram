const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json());

// Explicit route for root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Search media endpoint for autocomplete
app.get('/search-media', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.json([]);
  }

  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Search both movies and TV shows
    const [movieResponse, tvResponse] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
      axios.get(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
    ]);

    const movies = movieResponse.data.results.map(item => ({
      id: item.id,
      title: item.title,
      release_year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
      type: 'movie',
    }));

    const tvShows = tvResponse.data.results.map(item => ({
      id: item.id,
      title: item.name,
      release_year: item.first_air_date ? item.first_air_date.split('-')[0] : 'N/A',
      type: 'tv',
    }));

    // Combine and limit results
    const results = [...movies, ...tvShows].slice(0, 10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching search results' });
  }
});

// Endpoint to find shared actors
app.post('/find-shared-actors', async (req, res) => {
  const { id1, type1, id2, type2 } = req.body;

  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Fetch credits for both media
    const [credits1, credits2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/${type1}/${id1}/credits?api_key=${TMDB_API_KEY}`),
      axios.get(`https://api.themoviedb.org/3/${type2}/${id2}/credits?api_key=${TMDB_API_KEY}`),
    ]);

    const actors1 = credits1.data.cast.map(actor => actor.name);
    console.log(JSON.stringify(actors1));

    const actors2 = credits2.data.cast.map(actor => actor.name);
    console.log(JSON.stringify(actors2));


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