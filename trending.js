document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = 'dacbf658ae443d8ce2c396b74f18dcfc'; 

  const params = new URLSearchParams(window.location.search);
  let movieId = params.get('id');

  if (!movieId) return alert("No movie ID provided!");

  async function fetchMovieDetails(id) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,similar`);
    const movie = await res.json();

    // Update header
    document.getElementById('title').textContent = movie.title;
    document.getElementById('header-metadata').innerHTML = `
      <span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}/10</span>
      <span><i class="fas fa-clock"></i> ${movie.runtime || 'N/A'} mins</span>
      <span><i class="fas fa-calendar-alt"></i> ${movie.release_date}</span>
    `;
    document.getElementById('poster-img').src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
    document.getElementById('backdrop-img').src = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
    document.getElementById('description').textContent = movie.overview;
    document.getElementById('genre-list').innerHTML = movie.genres.map(g => `<span class="genre">${g.name}</span>`).join('');

    // Crew
    const director = movie.credits.crew.find(c => c.job === 'Director')?.name || 'N/A';
    const writers = movie.credits.crew.filter(c => c.department === 'Writing').map(w => w.name).join(', ') || 'N/A';
    const actors = movie.credits.cast.slice(0,5).map(a => a.name).join(', ') || 'N/A';
    document.getElementById('director').textContent = director;
    document.getElementById('writers').textContent = writers;
    document.getElementById('actors').textContent = actors;

    // Similar movies
    const similarContainer = document.getElementById('similar-movies');
    similarContainer.innerHTML = '';
    movie.similar.results.slice(0,6).forEach(m => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.setAttribute('data-id', m.id);
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${m.poster_path}" alt="${m.title}" class="movie-poster">
        <div class="movie-details">
          <div class="movie-title">${m.title}</div>
          <div class="movie-meta">${m.release_date} | ${m.vote_average.toFixed(1)}/10</div>
        </div>
      `;
      similarContainer.appendChild(card);
    });
  }

  fetchMovieDetails(movieId);

  // Click handler for similar movies
  document.getElementById('similar-movies').addEventListener('click', e => {
    const card = e.target.closest('.movie-card');
    if (!card) return;
    movieId = card.getAttribute('data-id');
    fetchMovieDetails(movieId);
    window.history.pushState({}, '', `?id=${movieId}`);
    window.scrollTo(0,0);
  });

  // Handle back/forward navigation
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      movieId = id;
      fetchMovieDetails(movieId);
    }
  });
});
