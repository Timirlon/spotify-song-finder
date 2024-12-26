require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = 3030;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
})

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 

// index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/search', async (req, res) => {
  const query = req.body.query;

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);

    const result = await spotifyApi.searchTracks(query);
    const tracks = result.body.tracks.items.map(track => ({
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      link: track.external_urls.spotify,
      image: track.album.images[0]?.url || '',
      release_date: track.album.release_date,
      duration: (track.duration_ms / 60000).toFixed(2),
    }));

    res.json({ success: true, tracks });
  } catch (err) {
    console.error('Error fetching tracks:', err);
    res.status(500).json({ success: false, error: 'Error fetching tracks' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
