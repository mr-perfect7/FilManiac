let left_btn = document.querySelector('.bi-chevron-left');
let right_btn = document.querySelector('.bi-chevron-right');
let cards = document.querySelector('.cards');
let search = document.querySelector('.search');
let search_input = document.querySelector('#search_input');

left_btn.addEventListener('click',()=>{
    cards.scrollLeft -= 140;
})
right_btn.addEventListener('click', ()=>{
    cards.scrollLeft += 140;
})

// ------------------------working------------------
function setupScroll(sectionClass, cardsId) {
  let section = document.querySelector(sectionClass);
  if (!section) return;

  let leftBtn = section.querySelector('.bi-chevron-left');
  let rightBtn = section.querySelector('.bi-chevron-right');
  let cards = document.getElementById(cardsId);

  if (!leftBtn || !rightBtn || !cards) return;

  leftBtn.addEventListener('click', () => {
    cards.scrollLeft -= 240;
  });

  rightBtn.addEventListener('click', () => {
    cards.scrollLeft += 240;
  });
}
// use it
setupScroll('.trending', 'trending-cards');
//-------------------------working ends------------------------
//----------------------Genre----------------------------
const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};


let api_key = "dacbf658ae443d8ce2c396b74f18dcfc";
let json_url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${api_key}`
fetch(json_url)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    data.results.forEach((ele, i) => {
      let { title, vote_average, release_date, poster_path, genre_ids, url,backdrop_path,overview } = ele;
      let genres = genre_ids.map(id => genreMap[id]).join(", ");
      let card = document.createElement('a');
      card.classList.add('card');
      // card.href = url; 
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="${title}" class="poster">
        <div class="rest_card">
          <img src="https://image.tmdb.org/t/p/w500${backdrop_path}" alt="${title}">
          <div class="cont">
            <h4>${title}</h4>
            <div class="sub">
              <p>${genres}, ${release_date}</p>
              <h3><span>IMDB</span><i class="bi bi-star-fill"></i> ${vote_average}</h3>
            </div>
          </div>
        </div>
      `;

      cards.appendChild(card);
    });
let first = data.results[0];
document.getElementById('title').innerText = first.title;
document.getElementById('gen').innerText = first.genre_ids.map(id => genreMap[id]).join(", ");
document.getElementById('date').innerText = first.release_date;
document.getElementById('movie_des').innerText=first.overview;
document.getElementById('rate').innerHTML = `
  <span style="background: yellow;font-size:10px; margin: 0px 5px; padding: 1px 3.5px; color: rgba(0,0,0,0.8); font-weight: 800;">
    IMDB
  </span><i class="bi bi-star-fill" style="margin-right:5px"></i>${first.vote_average}`;


  });

    let all_movies_url_1 = "https://api.themoviedb.org/3/discover/movie?api_key=97b6330d00714ee2843dc3ca25b5c89b&page=1";
   fetch(all_movies_url_1)
   .then(response=>response.json())
   .then(data=>{
      console.log(data);
      data.results.forEach(element =>{
      let {title,vote_average,poster_path,genre_ids,url,release_date} = element;
      let genres = genre_ids.map(id => genreMap[id]).join(", ");
      let card = document.createElement('a');
      card.classList.add('card');
      // card.href = url; 
      card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="${title}">
            <div class="cont">
              <h3>${title}</h3>
              <p>${genres},${release_date}, <span>IMDB</span><i class="bi bi-star-fill"></i>${vote_average}</p>
            </div>
          
      `
      search.appendChild(card);
    });
   })
   

    // --------------search filter-----------------------
    search_input.addEventListener('keyup', () => {
      let filter = search_input.value.toUpperCase();
      let a = search.getElementsByTagName('a');

      for (let index = 0; index < a.length; index++) {
        let element = a[index].getElementsByClassName('cont')[0];
        let textValue = element.textContent || element.innerText;

        if (textValue.toUpperCase().indexOf(filter) > -1) {
          a[index].style.display = "flex";
          search.style.visibility = "visible";
          search.style.opacity = 1;
        } else {
          a[index].style.display = "none";
        }
        if (search_input.value.trim() === "") {
          search.style.visibility = "hidden";
          search.style.opacity = 0;
        }
      }
    });
    let video = document.getElementsByTagName('video')[0];
    let play = document.getElementById('play');
    play.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        play.innerHTML = `Pause <i class="bi bi-pause-fill"></i>`
      } else {
        play.innerHTML = `Play <i class="bi bi-play-fill"></i>`
        video.pause();

      }
    })
    let series = document.getElementById('series');
    let movies = document.getElementById('movies');

    series.addEventListener('click', () => {
      cards.innerHTML = ' ';
      let series_array = data.filter(ele => {
        return ele.type === "series";
      });
      series_array.forEach((ele, i) => {
        let { name, imdb, date, sposter, bposter, genre, url } = ele;

        let card = document.createElement('a');
        card.classList.add('card');
        card.href = url; // optional: make it clickable
        card.innerHTML = `
        <img src="${sposter}" alt="${name}" class="poster">
        <div class="rest_card">
          <img src="${bposter}" alt="${name}">
          <div class="cont">
            <h4>${name}</h4>
            <div class="sub">
              <p>${genre}, ${date}</p>
              <h3><span>IMDB</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
            </div>
          </div>
        </div>
      `;

        cards.appendChild(card);
      });
    })

    // ---------------------------movies----------------------------------
     movies.addEventListener('click', () => {
      cards.innerHTML = ' ';
      let movie_array = data.filter(ele => {
        return ele.type === "movie";
      });
      movie_array.forEach((ele, i) => {
        let { name, imdb, date, sposter, bposter, genre, url } = ele;

        let card = document.createElement('a');
        card.classList.add('card');
        card.href = url; // optional: make it clickable
        card.innerHTML = `
        <img src="${sposter}" alt="${name}" class="poster">
        <div class="rest_card">
          <img src="${bposter}" alt="${name}">
          <div class="cont">
            <h4>${name}</h4>
            <div class="sub">
              <p>${genre}, ${date}</p>
              <h3><span>IMDB</span><i class="bi bi-star-fill"></i> ${imdb}</h3>
            </div>
          </div>
        </div>
      `;

        cards.appendChild(card);
      });
    })
  
  


  
