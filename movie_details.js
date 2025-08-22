
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const movieId = urlParams.get('id');
            const API_KEY = '1aca20d4'; 
   
            const loader = document.getElementById('loader');
            loader.style.display = 'block';
            
        
            if (movieId) {
                fetchMovieDetails(movieId);
            } else {
               
                displayError('No movie ID provided. Please go back to the homepage and select a movie.');
                loader.style.display = 'none';
            }
            
            async function fetchMovieDetails(id) {
                try {
                    const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
                    const movie = await response.json();
                    
                    if (movie.Response === "True") {
                        displayMovieDetails(movie);
                    
                        fetchSimilarMovies(movie.Genre);
                    } else {
                        displayError('Movie not found. Please try another one.');
                    }
                } catch (error) {
                    console.error('Failed to fetch movie details:', error);
                    displayError('Failed to load movie details. Please check your connection and try again.');
                } finally {
                    loader.style.display = 'none';
                }
            }
            
            function displayMovieDetails(movie) {
        
                document.title = `Movie Details - ${movie.Title}`;
              
                document.getElementById('title').textContent = movie.Title;
                
             
                const headerMetadata = document.getElementById('header-metadata');
                headerMetadata.innerHTML = `
                    <span><i class="fas fa-star"></i> ${movie.imdbRating || 'N/A'}/10</span>
                    <span><i class="fas fa-clock"></i> ${movie.Runtime || 'N/A'}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${movie.Year || 'N/A'}</span>
                    <span><i class="fas fa-film"></i> ${movie.Type ? movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1) : 'N/A'}</span>
                `;
                
            
                const posterImg = document.getElementById('poster-img');
                if (movie.Poster && movie.Poster !== 'N/A') {
                    posterImg.src = movie.Poster;
                    posterImg.alt = `${movie.Title} Poster`;
                } else {
                    posterImg.src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster+Available';
                    posterImg.alt = 'No poster available';
                }
                
         
                const backdropImg = document.getElementById('backdrop-img');
                if (movie.Poster && movie.Poster !== 'N/A') {
                    backdropImg.src = movie.Poster;
                } else {
                    backdropImg.src = 'https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=No+Image+Available';
                }
                backdropImg.alt = `${movie.Title} Backdrop`;
                
            
                const genreList = document.getElementById('genre-list');
                if (movie.Genre && movie.Genre !== 'N/A') {
                    genreList.innerHTML = movie.Genre.split(', ').map(genre => 
                        `<span class="genre">${genre}</span>`
                    ).join('');
                } else {
                    genreList.innerHTML = '<span class="genre">Genre not available</span>';
                }
                
         
                document.getElementById('description').textContent = movie.Plot && movie.Plot !== 'N/A' ? 
                    movie.Plot : 'Plot summary not available.';
                
              
                    
                const detailsMetadata = document.getElementById('details-metadata');
                detailsMetadata.innerHTML = `
                    ${movie.Country && movie.Country !== 'N/A' ? 
                        `<span><i class="fas fa-globe"></i> ${movie.Country}</span>` : ''}
                    ${movie.Awards && movie.Awards !== 'N/A' ? 
                        `<span><i class="fas fa-award"></i> ${movie.Awards}</span>` : ''}
                    ${movie.BoxOffice && movie.BoxOffice !== 'N/A' ? 
                        `<span><i class="fas fa-ticket-alt"></i> ${movie.BoxOffice}</span>` : ''}
                `;
                
               
                document.getElementById('director').textContent = movie.Director && movie.Director !== 'N/A' ? 
                    movie.Director : 'Not available';
                
                document.getElementById('writers').textContent = movie.Writer && movie.Writer !== 'N/A' ? 
                    movie.Writer : 'Not available';
                
                document.getElementById('actors').textContent = movie.Actors && movie.Actors !== 'N/A' ? 
                    movie.Actors : 'Not available';
            }
            
            async function fetchSimilarMovies(genre) {
                if (!genre || genre === 'N/A') {
                    genre = 'action'; 
                }
                
               
                const primaryGenre = genre.split(', ')[0];
                
                try {
                    const response = await fetch(`https://www.omdbapi.com/?s=${primaryGenre}&type=movie&apikey=${API_KEY}&page=1`);
                    const data = await response.json();
                    
                    if (data.Response === "True") {
                        displaySimilarMovies(data.Search);
                    } else {
                        document.getElementById('similar-movies').innerHTML = `
                            <div class="error-message">No similar movies found</div>
                        `;
                    }
                } catch (error) {
                    console.error('Failed to fetch similar movies:', error);
                    document.getElementById('similar-movies').innerHTML = `
                        <div class="error-message">Failed to load similar movies</div>
                    `;
                }
            }
            
            function displaySimilarMovies(movies) {
                const similarMoviesContainer = document.getElementById('similar-movies');
                similarMoviesContainer.innerHTML = '';
                
                
                const moviesToShow = movies.slice(4, 9);
                
                moviesToShow.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    
                    movieCard.innerHTML = `
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x280/1a1a1a/ffffff?text=No+Poster'}" 
                             alt="${movie.Title}" class="movie-poster">
                        <div class="movie-details">
                            <div class="movie-title">${movie.Title}</div>
                            <div class="movie-meta">
                                <span>${movie.Year}</span>
                                <span>${movie.imdbID ? '--/10' : 'N/A'}</span>
                            </div>
                        </div>
                    `;
                    
                  
                    movieCard.addEventListener('click', () => {
                        window.location.href = `?id=${movie.imdbID}`;
                    });
                    
                    similarMoviesContainer.appendChild(movieCard);
                });
            }
            
            function displayError(message) {
                const container = document.querySelector('.container');
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h2>Oops! Something went wrong</h2>
                        <p>${message}</p>
                        <a href="/" style="color: #e50914; text-decoration: underline; margin-top: 20px; display: inline-block;">Go back to homepage</a>
                    </div>
                `;
            }
        });