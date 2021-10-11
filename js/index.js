const API_KEY = '2c46288716a18fb7aadcc2a801f3fc6b'
const API_URL_POPULAR = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
const API_URL_PLAYING_NOW = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`
const timeout = 15000

const appState = {
    isLoading: false,
    moviesList: [],
    favorites: []
}

const ELEMENTS = {
    home: document.getElementById('home'),
    errorSection: document.getElementById('errors-section'),
    favoritesBtn: document.getElementById('favorites'),
    popularBtn: document.getElementById('popular'),
    nowPlayingBtn: document.getElementById('playingNow'),
    addToFavoriteBtn: document.querySelector('.addToFavorite'),
}

const main = async (url) => {
    appState.favorites = getFromLocalStorage()
    const data = await getDataFromApi(url)
    appState.moviesList = data
    renderMovieList(appState.moviesList)
}

main(API_URL_POPULAR)

ELEMENTS.popularBtn.addEventListener('click', onPopularClickHandler)
ELEMENTS.nowPlayingBtn.addEventListener('click', onPlayingNowClickHandler)
ELEMENTS.favoritesBtn.addEventListener('click', onFavoritesClickHandler)

async function getDataFromApi(url) {
    ELEMENTS.errorSection.innerHTML = ''
    ELEMENTS.home.innerHTML = renderSpinner()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    try {
        const response = await fetch(url, {signal: controller.signal})
        if (response.status >= 400) {
            ELEMENTS.errorSection.innerHTML = `<h3 style="color: red">Something went wrong! Error: ${response.status}</h3>`
            return []
        } else {
            clearTimeout(timeoutId)
            const json = await response.json()
            return json.results
        }
    } catch (e) {
        ELEMENTS.errorSection.innerHTML = `<h3 style="color: red">Network error! ${e.message}</h3>`
        return []
    }
}

function renderMovieList(data) {
    ELEMENTS.home.innerHTML = ''
    const ulElement = document.createElement('ul')
    data.forEach(movie => {
        const movieEl = createLiElementHTMl(movie)
        const liElement = document.createElement('li')
        liElement.innerHTML = movieEl
        ulElement.appendChild(liElement)
        liElement.addEventListener('click', () => onClickElement(movie.id))
    })

    ELEMENTS.home.appendChild(ulElement)
}

function onClickElement(id) {
    let movie = appState.moviesList.find(m => m.id === id)
    if (!movie) {
        movie = appState.favorites.find(m => m.id === id)
    }
    ELEMENTS.home.innerHTML = createMovieElementHTMl(movie)
    document.querySelector('.addToFavorite')
        .addEventListener('click', () => appState.favorites.find(m => m.id === id)
            ? onRemoveFromFavoriteHandler(id)
            : onAddToFavoriteHandler(id))
}

function onAddToFavoriteHandler(id) {
    appState.favorites.push(appState.moviesList.find(m => m.id === id))
    saveToLocalStorage()
    onClickElement(id)
}

function onRemoveFromFavoriteHandler(id) {
    appState.favorites = appState.favorites.filter(m => m.id !== id)
    saveToLocalStorage()
    renderMovieList(appState.favorites)
}

function onPopularClickHandler() {
    main(API_URL_POPULAR)
    ELEMENTS.nowPlayingBtn.classList.remove('active')
    ELEMENTS.favoritesBtn.classList.remove('active')
    ELEMENTS.popularBtn.classList.add('active')
}

function onPlayingNowClickHandler() {
    main(API_URL_PLAYING_NOW)
    ELEMENTS.nowPlayingBtn.classList.add('active')
    ELEMENTS.favoritesBtn.classList.remove('active')
    ELEMENTS.popularBtn.classList.remove('active')
}

function onFavoritesClickHandler() {
    ELEMENTS.errorSection.innerHTML = ''
    renderMovieList(appState.favorites)
    ELEMENTS.nowPlayingBtn.classList.remove('active')
    ELEMENTS.favoritesBtn.classList.add('active')
    ELEMENTS.popularBtn.classList.remove('active')
}

function saveToLocalStorage() {
    localStorage.setItem('myFavoriteMovies', JSON.stringify(appState.favorites))
}

function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem('myFavoriteMovies')) || []
}

function createLiElementHTMl(movie) {
    return `<div class="card" id="${movie.id}">
                <div class="card-title">
                    <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="moviePicture" class="movie-pic">
                    <h4>${movie.title}</h4>
                </div>
                <div class="card-overview">${movie.overview}</div>
            </div>
    `
}

function createMovieElementHTMl(movie) {
    return `<div class="movie" id="${movie.id}">
                <div class="movie-title">
                    <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="moviePicture" >
                    <div>
                        <h4>${movie.title}</h4>
                        <h6>Release date: ${movie.release_date}</h6>
                        <h6>Rating: ${Math.floor(movie.popularity)}</h6>
                        <button id="${movie.id}" class="btn btn-primary btn-sm addToFavorite">
                            ${appState.favorites.find(m => m.id === movie.id) ? 'Remove from favorites' : 'Add to favorite'}
                        </button>
                    </div>
                </div>
                <div class="card-overview"><b>Overview: </b>${movie.overview}</div>
            </div>
    `
}

function renderSpinner() {
    return `<div>
                <span>Loading...</span>
                <div class="spinner-border text-primary" role="status"></div>
            </div>`
}
