// --- DOM Elements ---
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
// --- API Keys ---
const omdbApiKey = '1aca20d4'; 
const tmdbApiKey = "dacbf658ae443d8ce2c396b74f18dcfc";

// --- Global Variables ---
let trendingSearchQuery = 'avenger';
let allSearchQuery = 'action';
let currentType = '';
let currentPage = 1;
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};

// --- Genre Map (for TMDB) ---
const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// --- Helper Functions ---
async function fetchAndDisplayMovie(id) {
  const url = `https://www.omdbapi.com/?i=${id}&plot=full&&apikey=${omdbApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

function createCard(movie, isSearchResult = false) {
  const card = document.createElement(isSearchResult ? 'a' : 'div');
  card.classList.add('card');

  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : `https://placehold.co/200x300/1a1a1a/ffffff?text=No+Image`;

  if (isSearchResult) {
    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.Title}">
      <div class="cont">
        <h3>${movie.Title}</h3>
        <p>${movie.Type || 'Movie'}, ${movie.Year}</p>
      </div>
    `;
  } else {
    const isFavorite = favorites[movie.imdbID];
    const imdbRating = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "N/A";
    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.Title}">
      <div class="cont">
        <h4>${movie.Title}</h4>
        <div class="sub">
          <p>${movie.Type || 'Movie'}, ${movie.Year}</p>
          <h3><i class="bi bi-star-fill"></i><span>${imdbRating}</span></h3>
        </div>
        <div class="actions">
          <i class="bi bi-heart${isFavorite ? '-fill active' : ''}" data-id="${movie.imdbID}"></i>
        </div>
      </div>
    `;
  }

  card.addEventListener('click', (e) => {
    if (!e.target.classList.contains('bi-heart') && !e.target.classList.contains('bi-heart-fill')) {
      window.location.href = `movie.html?id=${movie.imdbID}`;
    }
  });

  const favoriteBtn = card.querySelector('.bi-heart, .bi-heart-fill');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(favoriteBtn.dataset.id, movie);
      refreshSection(card.closest('.cards-container').id);
    });
  }

  return card;
}

function displayMovieCards(movies, container, isSearchResult = false) {
  container.innerHTML = '';
  if (!movies || movies.length === 0) {
    container.innerHTML = `<p class="no-results">No results found.</p>`;
    return;
  }
  movies.forEach(movie => container.appendChild(createCard(movie, isSearchResult)));
}

function displaySkeletonLoader(container, count = 10) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeletonCard = document.createElement('div');
    skeletonCard.classList.add('skeleton');
    container.appendChild(skeletonCard);
  }
}

async function fetchMovies(query, type = '', page = 1, container, paginationContainer = null) {
  displaySkeletonLoader(container);
  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${type}&page=${page}&apikey=${omdbApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === "True" && data.Search) {
      const detailedMovies = await Promise.all(
        data.Search.map(async (movie) => {
          const detailUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${omdbApiKey}`;
          try {
            const res = await fetch(detailUrl);
            const detailData = await res.json();
            return detailData.Response === "True" ? detailData : movie;
          } catch {
            return movie;
          }
        })
      );
      displayMovieCards(detailedMovies, container);
      if (paginationContainer) renderPagination(data.totalResults, page, paginationContainer, type);
    } else {
      container.innerHTML = `<p class="no-results">${data.Error || 'No results found.'}</p>`;
      if (paginationContainer) paginationContainer.innerHTML = '';
    }
  } catch (error) {
    container.innerHTML = `<p class="no-results">Failed to fetch movies. Please try again.</p>`;
    if (paginationContainer) paginationContainer.innerHTML = '';
  }
}

function renderPagination(totalResults, page, container, type) {
  container.innerHTML = '';
  const totalPages = Math.ceil(totalResults / 10);
  if (totalPages <= 1) return;

  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.classList.add('page-btn');
  prevButton.disabled = page === 1;
  prevButton.addEventListener('click', () => fetchMovies(allSearchQuery, type, page - 1, allContainer, allPagination));
  container.appendChild(prevButton);

  const pageIndicator = document.createElement('button');
  pageIndicator.innerText = `Page ${page} of ${totalPages}`;
  pageIndicator.classList.add('page-btn', 'active');
  container.appendChild(pageIndicator);

  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.classList.add('page-btn');
  nextButton.disabled = page === totalPages;
  nextButton.addEventListener('click', () => fetchMovies(allSearchQuery, type, page + 1, allContainer, allPagination));
  container.appendChild(nextButton);
}

async function fetchLiveSearchResults(query) {
  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${omdbApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === "True" && data.Search) {
      displayMovieCards(data.Search, searchResultsContainer, true);
      searchResultsContainer.classList.add('active');
    } else {
      searchResultsContainer.classList.remove('active');
    }
  } catch (error) {
    console.error("Error fetching live search:", error);
  }
}



function toggleFavorite(id, movie) {
  if (favorites[id]) delete favorites[id];
  else favorites[id] = movie;
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function refreshSection(containerId) {
  switch (containerId) {
    case 'trending-container': fetchTrendingMovies(); break;
    case 'all-container': fetchMovies(allSearchQuery, currentType, currentPage, allContainer, allPagination); break;
    case 'favorites-container': displayFavorites(); break;
  }
}

function displayFavorites() {
  const favoriteMovies = Object.values(favorites);
  if (favoriteMovies.length) displayMovieCards(favoriteMovies, favoritesContainer);
  else favoritesContainer.innerHTML = '<p class="no-results">You have no favorites yet. Click the heart icon to add one.</p>';
}

function setupNavLinks() {
  const navActions = {
    'home-link': { trendingQuery: 'avengers', allQuery: 'action', type: '' },
    'series-link': { trendingQuery: 'popular', allQuery: 'drama', type: 'series' },
    'movies-link': { trendingQuery: 'blockbuster', allQuery: 'adventure', type: 'movie' },
    'kids-link': { trendingQuery: 'disney', allQuery: 'animation', type: '' }
  };

  for (const [id, params] of Object.entries(navActions)) {
    document.getElementById(id).addEventListener('click', (e) => {
      e.preventDefault();
      trendingSearchQuery = params.trendingQuery;
      allSearchQuery = params.allQuery;
      currentType = params.type;
      currentPage = 1;
      fetchTrendingMovies();
      fetchMovies(allSearchQuery, currentType, currentPage, allContainer, allPagination);
    });
  }
}

searchInput.addEventListener('keyup', (e) => {
  const searchTerm = e.target.value.trim();
  if (searchTerm.length > 2) fetchLiveSearchResults(searchTerm);
  else searchResultsContainer.classList.remove('active');
});

document.addEventListener('click', (e) => {
  if (!searchResultsContainer.contains(e.target) && e.target !== searchInput) searchResultsContainer.classList.remove('active');
});

document.getElementById('hero-play').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Playback functionality is a demo.');
});


// --- TMDB Trending Fetch ---
async function fetchTrendingMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) return;

    const first = data.results[0];
    heroTitle.innerText = first.title;
    heroGen.innerText = first.genre_ids.map(id => genreMap[id]).join(", ");
    heroFilmType.innerText = first.genres || '';
    heroDate.innerText = first.release_date;
    heroPlot.innerText = first.overview;
    heroRate.innerHTML = `<span style="background: yellow;font-size:10px; margin: 0px 5px; padding: 1px 3.5px; color: rgba(0,0,0,0.8); font-weight: 800;">IMDB</span><i class="bi bi-star-fill" style="margin-right:5px"></i>${first.vote_average}`;

    trendingContainer.innerHTML = '';
    data.results.forEach(movie => {
      const card = document.createElement('a');
      card.classList.add('card');
      // card.href = `trending.html?id=${movie.id}`;
      card.href = `trending.html?id=${movie.id}`;
      card.target = "_blank";

      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="poster">
        <div class="rest_card">
          <div class="cont">
            <h4>${movie.title}</h4>
            <div class="sub">
              <p>${movie.release_date}</p>
              <h3><span>IMDB</span><i class="bi bi-star-fill"></i> ${movie.vote_average}</h3>
            </div>
          </div>
        </div>
      `;
      trendingContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
  }
}

// --- Initialize ---
function initialize() {
  fetchAndDisplayMovie('tt6468322');
  fetchTrendingMovies();
  fetchMovies(allSearchQuery, currentType, currentPage, allContainer, allPagination);
  displayFavorites();
  setupNavLinks();
}

initialize();

// --- Lenis Scroll ---
const lenis = new Lenis({ autoRaf: true });
lenis.on('scroll', e => console.log(e));
