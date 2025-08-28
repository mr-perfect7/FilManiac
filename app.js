// const omdbApiKey = '1aca20d4';
// const tmdbApiKey = '97b6330d00714ee2843dc3ca25b5c89b';

// // DOM Elements
// const searchInput = document.getElementById('search_input');
// const searchResultsContainer = document.getElementById('search-results');
// const trendingContainer = document.getElementById('trending-container');
// const allContainer = document.getElementById('all-container');
// const favoritesContainer = document.getElementById('favorites-container');
// const allPagination = document.getElementById('all-pagination');

// const heroTitle = document.getElementById('hero-title');
// const heroGen = document.getElementById('hero-gen');
// const heroFilmType = document.getElementById('hero-film-type');
// const heroDate = document.getElementById('hero-date');
// const heroPlot = document.getElementById('hero-plot');
// const heroRate = document.getElementById('hero-rate');

// // State
// let currentType = '';
// let currentPage = 1;
// let allSearchQuery = 'action';
// let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
// let cachedTrending = [];

// // Genre Mapping
// const genreMap = {
//   28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
//   99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
//   27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
//   10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
// };


// // Fetch helper
// const fetchJson = async (url) => {
//   try {
//     const res = await fetch(url);
//     return await res.json();
//   } catch (err) {
//     console.error('Fetch error:', err);
//     return null;
//   }
// };

// // Fetch full movie details to get imdbRating
// async function fetchMovieDetails(imdbID) {
//   const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
//   const data = await fetchJson(url);
//   return data?.imdbRating || "N/A";
// }

// // Toggle favorite
// function toggleFavorite(id, movie) {
//   if (favorites[id]) delete favorites[id];
//   else favorites[id] = { ...movie, imdbID: id };
//   localStorage.setItem('favorites', JSON.stringify(favorites));
//   updateHeartIconsFor(id);
//   displayFavorites();
// }

// // Update hearts everywhere
// function updateHeartIconsFor(id) {
//   [allContainer, trendingContainer, searchResultsContainer, favoritesContainer].forEach(sec => {
//     if (!sec) return;
//     const btn = sec.querySelector(`.bi-heart[data-id="${id}"], .bi-heart-fill[data-id="${id}"]`);
//     if (btn) {
//       if (favorites[id]) {
//         btn.classList.add('active');
//         btn.classList.replace('bi-heart', 'bi-heart-fill');
//       } else {
//         btn.classList.remove('active');
//         btn.classList.replace('bi-heart-fill', 'bi-heart');
//       }
//     }
//   });
// }

// // Create a movie card
// function createCard(movie, isSearchResult = false, isTrending = false) {
//   const treatAsTmdb = isTrending || (!!movie.id && !movie.imdbID);
//   const imdbID = movie.imdbID || (treatAsTmdb ? `tmdb-${movie.id}` : null);
//   const title = movie.Title || movie.title || 'Unknown Title';
//   const posterUrl = movie.Poster && movie.Poster !== 'N/A'
//     ? movie.Poster
//     : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : `https://placehold.co/200x300/1a1a1a/ffffff?text=No+Image`);
//   const year = movie.Year || movie.release_date || '';
//   const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : (movie.vote_average || "N/A");

//   const card = document.createElement(isSearchResult ? 'a' : 'div');
//   card.classList.add('card');
//   if (isSearchResult) card.href = treatAsTmdb ? `trending.html?id=${movie.id}` : `movie.html?id=${imdbID}`;

//   card.innerHTML = `
//     <img src="${posterUrl}" alt="${title}">
//     <div class="cont">
//       <h4>${title}</h4>
//       <div class="sub">
//         <p>${year}</p>
//         <h3><i class="bi bi-star-fill"></i><span>${rating}</span></h3>
//       </div>
//       <div class="actions">
//         <i class="bi bi-heart${favorites[imdbID] ? '-fill active' : ''}" data-id="${imdbID}"></i>
//       </div>
//     </div>
//   `;

//   const favoriteBtn = card.querySelector('.bi-heart, .bi-heart-fill');
//   if (favoriteBtn) {
//     favoriteBtn.addEventListener('click', e => {
//       e.preventDefault();
//       e.stopPropagation();
//       toggleFavorite(imdbID, { ...movie, Poster: posterUrl, Title: title, Year: year, imdbRating: rating });
//     });
//   }

//   if (!isSearchResult) {
//     card.addEventListener('click', () => {
//       if (treatAsTmdb) window.open(`trending.html?id=${movie.id}`, '_blank');
//       else if (imdbID) window.location.href = `movie.html?id=${imdbID}`;
//     });
//   }

//   return card;
// }

// // Display movie cards with ratings for OMDB
// async function displayMovieCards(movies, container) {
//   container.innerHTML = '';
//   if (!movies?.length) return container.innerHTML = `<p class="no-results">No results found.</p>`;

//   const frag = document.createDocumentFragment();

//   for (const movie of movies) {
//     let rating = movie.imdbRating || movie.vote_average || "N/A";

//     // Only fetch OMDB rating if not TMDB (TMDB movies already have vote_average)
//     if (!movie.vote_average && movie.imdbID) {
//       rating = await fetchMovieDetails(movie.imdbID);
//     }

//     const card = createCard({ ...movie, imdbRating: rating });
//     frag.appendChild(card);
//   }

//   container.appendChild(frag);
// }

// // Skeleton loader
// function displaySkeletonLoader(container, count = 8) {
//   container.innerHTML = '';
//   for (let i = 0; i < count; i++) {
//     const s = document.createElement('div');
//     s.classList.add('skeleton');
//     container.appendChild(s);
//   }
// }

// // Fetch movies from OMDB
// async function fetchMovies(query, type = '', page = 1) {
//   displaySkeletonLoader(allContainer);
//   const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}&page=${page}&apikey=${omdbApiKey}`;
//   const data = await fetchJson(url);

//   if (!data || data.Response === "False") {
//     console.error('OMDB Error:', data?.Error || 'Unknown');
//     allContainer.innerHTML = `<p class="no-results">${data?.Error || 'OMDB API not responding'}</p>`;
//     allPagination.innerHTML = '';
//     return;
//   }

//   await displayMovieCards(data.Search, allContainer);
//   renderPagination(parseInt(data.totalResults), page);
// }

// // Pagination
// function renderPagination(totalResults, page) {
//   allPagination.innerHTML = '';
//   const totalPages = Math.ceil(totalResults / 10);
//   if (totalPages <= 1) return;

//   const createBtn = (text, disabled, onClick) => {
//     const btn = document.createElement('button');
//     btn.innerHTML = text;
//     btn.disabled = disabled;
//     btn.classList.add('page-btn');
//     btn.addEventListener('click', onClick);
//     return btn;
//   };

//   allPagination.appendChild(createBtn('&laquo;', page === 1, () => fetchMovies(allSearchQuery, currentType, page - 1)));
//   const pageIndicator = createBtn(`Page ${page} of ${totalPages}`, true, null);
//   pageIndicator.classList.add('active');
//   allPagination.appendChild(pageIndicator);
//   allPagination.appendChild(createBtn('&raquo;', page === totalPages, () => fetchMovies(allSearchQuery, currentType, page + 1)));
// }

// // Debounced Live Search
// let searchTimeout;
// if (searchInput) {
//   searchInput.addEventListener('keyup', e => {
//     clearTimeout(searchTimeout);
//     const searchTerm = e.target.value.trim();
//     if (searchTerm.length > 2) {
//       searchTimeout = setTimeout(() => fetchLiveSearchResults(searchTerm), 500);
//     } else {
//       searchResultsContainer.classList.remove('active');
//       searchResultsContainer.innerHTML = '';
//     }
//   });
// }

// // OMDB Live Search
// async function fetchLiveSearchResults(query) {
//   const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${omdbApiKey}`;
//   const data = await fetchJson(url);
//   if (data?.Response === "True" && data.Search) {
//     searchResultsContainer.classList.add('active');
//     await displayMovieCards(data.Search, searchResultsContainer);
//   } else {
//     searchResultsContainer.classList.remove('active');
//     searchResultsContainer.innerHTML = '';
//   }
// }

// // TMDB Trending with fallback
// async function fetchTrendingMovies() {
//   try {
//     const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`;
//     const data = await fetchJson(url);
//     if (!data?.results?.length) throw new Error('No trending data');
//     cachedTrending = data.results;
//     renderTrending(cachedTrending);
//   } catch {
//     trendingContainer.innerHTML = `<p class="no-results">Trending unavailable. Showing cached results if available.</p>`;
//     if (cachedTrending.length) renderTrending(cachedTrending);
//   }
// }

// // Render trending
// function renderTrending(movies) {
//   const first = movies[0];
//   heroTitle.innerText = first.title || '';
//   heroGen.innerText = (first.genre_ids || []).map(id => genreMap[id]).filter(Boolean).join(", ");
//   heroFilmType.innerText = 'Movie';
//   heroDate.innerText = first.release_date || '';
//   heroPlot.innerText = first.overview || '';
//   heroRate.innerHTML = `<span style="background: yellow;font-size:10px;margin:0 5px;padding:1px 3.5px;color:rgba(0,0,0,0.8);font-weight:800;">IMDB</span><i class="bi bi-star-fill" style="margin-right:5px"></i>${first.vote_average || 'N/A'}`;

//   trendingContainer.innerHTML = '';
//   const frag = document.createDocumentFragment();
//   movies.forEach(movie => frag.appendChild(createCard(movie, false, true)));
//   trendingContainer.appendChild(frag);
// }

// // Display favorites
// function displayFavorites() {
//   const favMovies = Object.values(favorites);
//   if (favMovies.length) displayMovieCards(favMovies, favoritesContainer);
//   else favoritesContainer.innerHTML = '<p class="no-results">No favorites yet. Click heart to add.</p>';
// }

// // Nav links
// function setupNavLinks() {
//   const navActions = {
//     'home-link': { allQuery: 'action', type: '' },
//     'series-link': { allQuery: 'drama', type: 'series' },
//     'movies-link': { allQuery: 'adventure', type: 'movie' },
//     'kids-link': { allQuery: 'animation', type: '' }
//   };
//   Object.entries(navActions).forEach(([id, params]) => {
//     const el = document.getElementById(id);
//     if (!el) return;
//     el.addEventListener('click', e => {
//       e.preventDefault();
//       allSearchQuery = params.allQuery;
//       currentType = params.type;
//       currentPage = 1;
//       fetchMovies(allSearchQuery, currentType, currentPage);
//     });
//   });
// }


// // Initialize app
// async function initialize() {
//   await fetchTrendingMovies();
//   await fetchMovies(allSearchQuery, currentType, currentPage);
//   displayFavorites();
//   setupNavLinks();
// }
// initialize();
const omdbApiKey = '1aca20d4';
const tmdbApiKey = '97b6330d00714ee2843dc3ca25b5c89b';

// DOM Elements
const searchInput = document.getElementById('search_input');
const searchResultsContainer = document.getElementById('search-results');
const trendingContainer = document.getElementById('trending-container');
const allContainer = document.getElementById('all-container');
const favoritesContainer = document.getElementById('favorites-container');
const allPagination = document.getElementById('all-pagination');

const heroTitle = document.getElementById('hero-title');
const heroGen = document.getElementById('hero-gen');
const heroFilmType = document.getElementById('hero-film-type');
const heroDate = document.getElementById('hero-date');
const heroPlot = document.getElementById('hero-plot');
const heroRate = document.getElementById('hero-rate');

// State
let currentType = '';
let currentPage = 1;
let allSearchQuery = 'action';
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
let cachedTrending = [];

// Genre Mapping
const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// Fetch helper
const fetchJson = async (url) => {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
};

// Fetch full movie details to get imdbRating
async function fetchMovieDetails(imdbID) {
  const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
  const data = await fetchJson(url);
  return data?.imdbRating || "N/A";
}

// Toggle favorite
function toggleFavorite(id, movie) {
  if (favorites[id]) delete favorites[id];
  else favorites[id] = { ...movie, imdbID: id };
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateHeartIconsFor(id);
  displayFavorites();
}

// Update hearts everywhere
function updateHeartIconsFor(id) {
  [allContainer, trendingContainer, searchResultsContainer, favoritesContainer].forEach(sec => {
    if (!sec) return;
    const btn = sec.querySelector(`.bi-heart[data-id="${id}"], .bi-heart-fill[data-id="${id}"]`);
    if (btn) {
      if (favorites[id]) {
        btn.classList.add('active');
        btn.classList.replace('bi-heart', 'bi-heart-fill');
      } else {
        btn.classList.remove('active');
        btn.classList.replace('bi-heart-fill', 'bi-heart');
      }
    }
  });
}

// Create a movie card
function createCard(movie, isSearchResult = false, isTrending = false) {
  const treatAsTmdb = isTrending || (!!movie.id && !movie.imdbID);
  const imdbID = movie.imdbID || (treatAsTmdb ? `tmdb-${movie.id}` : null);
  const title = movie.Title || movie.title || 'Unknown Title';
  const posterUrl = movie.Poster && movie.Poster !== 'N/A'
    ? movie.Poster
    : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : `https://placehold.co/200x300/1a1a1a/ffffff?text=No+Image`);
  const year = movie.Year || movie.release_date || '';
  const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : (movie.vote_average || "N/A");

  const card = document.createElement(isSearchResult ? 'a' : 'div');
  card.classList.add('card');
  if (isSearchResult) card.href = treatAsTmdb ? `trending.html?id=${movie.id}` : `movie.html?id=${imdbID}`;

  card.innerHTML = `
    <img src="${posterUrl}" alt="${title}">
    <div class="cont">
      <h4>${title}</h4>
      <div class="sub">
        <p>${year}</p>
        <h3><i class="bi bi-star-fill"></i><span>${rating}</span></h3>
      </div>
      <div class="actions">
        <i class="bi bi-heart${favorites[imdbID] ? '-fill active' : ''}" data-id="${imdbID}"></i>
      </div>
    </div>
  `;

  const favoriteBtn = card.querySelector('.bi-heart, .bi-heart-fill');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(imdbID, { ...movie, Poster: posterUrl, Title: title, Year: year, imdbRating: rating });
    });
  }

  if (!isSearchResult) {
    card.addEventListener('click', () => {
      if (treatAsTmdb) window.open(`trending.html?id=${movie.id}`, '_blank');
      else if (imdbID) window.location.href = `movie.html?id=${imdbID}`;
    });
  }

  return card;
}

// Display movie cards with ratings for OMDB
async function displayMovieCards(movies, container) {
  container.innerHTML = '';
  if (!movies?.length) return container.innerHTML = `<p class="no-results">No results found.</p>`;

  const frag = document.createDocumentFragment();

  for (const movie of movies) {
    let rating = movie.imdbRating || movie.vote_average || "N/A";

    // Only fetch OMDB rating if not TMDB (TMDB movies already have vote_average)
    if (!movie.vote_average && movie.imdbID) {
      rating = await fetchMovieDetails(movie.imdbID);
    }

    const card = createCard({ ...movie, imdbRating: rating });
    frag.appendChild(card);
  }

  container.appendChild(frag);
}

// Skeleton loader
function displaySkeletonLoader(container, count = 8) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.classList.add('skeleton', 'card'); // match grid layout

    // Optional placeholders for image + text
    s.innerHTML = `
      <div class="skeleton-img" style="height:280px;"></div>
      <div class="cont" style="padding:10px;">
        <div class="skeleton-text" style="height:16px; width:70%; margin-bottom:5px;"></div>
        <div class="skeleton-text" style="height:14px; width:50%;"></div>
      </div>
    `;

    container.appendChild(s);
  }
}

// Fetch movies from OMDB
async function fetchMovies(query, type = '', page = 1) {
  displaySkeletonLoader(allContainer);
  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}&page=${page}&apikey=${omdbApiKey}`;
  const data = await fetchJson(url);

  if (!data || data.Response === "False") {
    console.error('OMDB Error:', data?.Error || 'Unknown');
    allContainer.innerHTML = `<p class="no-results">${data?.Error || 'OMDB API not responding'}</p>`;
    allPagination.innerHTML = '';
    return;
  }

  await displayMovieCards(data.Search, allContainer);
  renderPagination(parseInt(data.totalResults), page);
}

// Pagination
function renderPagination(totalResults, page) {
  allPagination.innerHTML = '';
  const totalPages = Math.ceil(totalResults / 10);
  if (totalPages <= 1) return;

  const createBtn = (text, disabled, onClick) => {
    const btn = document.createElement('button');
    btn.innerHTML = text;
    btn.disabled = disabled;
    btn.classList.add('page-btn');
    btn.addEventListener('click', onClick);
    return btn;
  };

  allPagination.appendChild(createBtn('&laquo;', page === 1, () => fetchMovies(allSearchQuery, currentType, page - 1)));
  const pageIndicator = createBtn(`Page ${page} of ${totalPages}`, true, null);
  pageIndicator.classList.add('active');
  allPagination.appendChild(pageIndicator);
  allPagination.appendChild(createBtn('&raquo;', page === totalPages, () => fetchMovies(allSearchQuery, currentType, page + 1)));
}

// Debounced Live Search
let searchTimeout;
if (searchInput) {
  searchInput.addEventListener('keyup', e => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();
    if (searchTerm.length > 2) {
      searchTimeout = setTimeout(() => fetchLiveSearchResults(searchTerm), 500);
    } else {
      searchResultsContainer.classList.remove('active');
      searchResultsContainer.innerHTML = '';
    }
  });
}

// OMDB Live Search
async function fetchLiveSearchResults(query) {
  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${omdbApiKey}`;
  const data = await fetchJson(url);
  if (data?.Response === "True" && data.Search) {
    searchResultsContainer.classList.add('active');
    await displayMovieCards(data.Search, searchResultsContainer);
  } else {
    searchResultsContainer.classList.remove('active');
    searchResultsContainer.innerHTML = '';
  }
}

// TMDB Trending with fallback
async function fetchTrendingMovies() {
  try {
    const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`;
    const data = await fetchJson(url);
    if (!data?.results?.length) throw new Error('No trending data');
    cachedTrending = data.results;
    renderTrending(cachedTrending);
  } catch {
    trendingContainer.innerHTML = `<p class="no-results">Trending unavailable. Showing cached results if available.</p>`;
    if (cachedTrending.length) renderTrending(cachedTrending);
  }
}

// Render trending
function renderTrending(movies) {
  const first = movies[0];
  heroTitle.innerText = first.title || '';
  heroGen.innerText = (first.genre_ids || []).map(id => genreMap[id]).filter(Boolean).join(", ");
  heroFilmType.innerText = 'Movie';
  heroDate.innerText = first.release_date || '';
  heroPlot.innerText = first.overview || '';
  heroRate.innerHTML = `<span style="background: yellow;font-size:10px;margin:0 5px;padding:1px 3.5px;color:rgba(0,0,0,0.8);font-weight:800;">IMDB</span><i class="bi bi-star-fill" style="margin-right:5px"></i>${first.vote_average || 'N/A'}`;

  trendingContainer.innerHTML = '';
  const frag = document.createDocumentFragment();
  movies.forEach(movie => frag.appendChild(createCard(movie, false, true)));
  trendingContainer.appendChild(frag);
}

// Display favorites
function displayFavorites() {
  const favMovies = Object.values(favorites);
  if (favMovies.length) displayMovieCards(favMovies, favoritesContainer);
  else favoritesContainer.innerHTML = '<p class="no-results">No favorites yet. Click heart to add.</p>';
}

// Nav links
function setupNavLinks() {
  const navActions = {
    'home-link': { allQuery: 'action', type: '' },
    'series-link': { allQuery: 'drama', type: 'series' },
    'movies-link': { allQuery: 'adventure', type: 'movie' },
    'kids-link': { allQuery: 'animation', type: '' }
  };
  Object.entries(navActions).forEach(([id, params]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      e.preventDefault();
      allSearchQuery = params.allQuery;
      currentType = params.type;
      currentPage = 1;
      fetchMovies(allSearchQuery, currentType, currentPage);
    });
  });
}

// Initialize app
async function initialize() {
  await fetchTrendingMovies();
  await fetchMovies(allSearchQuery, currentType, currentPage);
  displayFavorites();
  setupNavLinks();
}
initialize();
