import { getAllMovies, posterUrl, getAllKeywords } from './movies-api';

export function createMovieElt(movieData) {
  const article = document.createElement('article');
  article.className = 'movie-item';

  const imgPoster = document.createElement('img');
  imgPoster.className = 'movie-item__poster';
  imgPoster.src = posterUrl(movieData.poster, 'medium');
  imgPoster.alt = `poster of '${movieData.title}'`;

  article.appendChild(imgPoster);

  const divItemInfo = document.createElement('div');
  divItemInfo.className = 'movie-item__info';

  const divItemTitle = document.createElement('div');
  divItemTitle.className = 'movie-item__title';
  divItemTitle.innerHTML = movieData.title;
  divItemInfo.appendChild(divItemTitle);

  article.appendChild(divItemInfo);
  return article;
}

export function updateMoviesElt(page = 1) {
  const abortController = new AbortController();

  // eslint-disable-next-line no-use-before-define
  setLoading();
  const params = new URLSearchParams();
  params.set('page', page);
  // eslint-disable-next-line no-use-before-define
  appendSortToQuery(params);
  // eslint-disable-next-line no-use-before-define
  appendFiltersToQuery(params);
  const article = document.querySelector('.movies-list');
  // eslint-disable-next-line no-use-before-define
  getAllMovies(params, abortController).then((movies) => {
    abortController.abort();
    // eslint-disable-next-line no-use-before-define
    emptyElt(article);
    // eslint-disable-next-line no-use-before-define
    updatePaginationElt(movies.pagination);
    movies.collection.forEach((movie) => {
      const res = createMovieElt(movie);
      article.appendChild(res);
    });
    // eslint-disable-next-line no-use-before-define
  });
}

export function createPaginationButtonElt(materialIcon, isDisabled, page) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button';
  button.disabled = isDisabled;
  const span = document.createElement('span');
  span.className = 'material-symbols-outlined';
  span.innerHTML = materialIcon;
  button.appendChild(span);
  button.addEventListener('click', () => updateMoviesElt(page));
  return button;
}

export function emptyElt(elt) {
  while (elt.firstChild) {
    elt.removeChild(elt.firstChild);
  }
}

// eslint-disable-next-line consistent-return
export function updatePaginationElt(pagination) {
  const nav = document.querySelector('.pagination');
  nav.className = 'pagination';

  const buttonFirstPage = createPaginationButtonElt(
    'first_page',
    pagination.current === 1,
    1,
  );
  const buttonPreviousPage = createPaginationButtonElt(
    'navigate_before',
    pagination.current === 1,
    pagination.current - 1,
  );

  const paginationCurrent = document.createElement('span');
  paginationCurrent.className = 'pagination__info';
  paginationCurrent.innerHTML = `${pagination.current}/${pagination.last}`;

  const buttonNextPage = createPaginationButtonElt(
    'navigate_next',
    pagination.current === pagination.last,
    pagination.current + 1,
  );
  const buttonLastPage = createPaginationButtonElt(
    'last_page',
    pagination.current === pagination.last,
    pagination.last,
  );
  nav.appendChild(buttonFirstPage);
  nav.appendChild(buttonPreviousPage);
  nav.appendChild(paginationCurrent);
  nav.appendChild(buttonNextPage);
  nav.appendChild(buttonLastPage);

  if (pagination.last === 1) {
    emptyElt(nav);
  }

  return nav;
}

export function setLoading() {
  const navPagination = document.querySelector('.pagination');
  emptyElt(navPagination);
  const moviesList = document.querySelector('.movies-list');
  moviesList.innerHTML = '<article class="loading"></article>';
}

export function appendSortToQuery(urlSearchParams) {
  const selectedSort = document.querySelector('input[name="sort"]:checked').value;
  if (selectedSort) {
    urlSearchParams.set(selectedSort, 'asc');
  }
}

export function setSortButtonsEltsEvents() {
  const allSortButtons = document.querySelectorAll("input[name='sort']");
  allSortButtons.forEach((sortButton) => {
    sortButton.addEventListener('change', () => {
      updateMoviesElt();
    });
  });
}

export function setFiltersDisplay(filtersElt, isSelectionMode) {
  const buttonFilters = filtersElt.querySelector('.filters__add');
  const keywordsList = filtersElt.querySelector('.filters__list');
  const searchLabel = filtersElt.querySelector('.search');
  const searchInput = filtersElt.querySelector('.input-search');
  const propositionsFilters = filtersElt.querySelector('.filters__propositions');

  if (isSelectionMode) {
    filtersElt.classList.toggle('filters--selection-mode');
    buttonFilters.classList.toggle('hidden');
    keywordsList.classList.toggle('hidden');
    searchLabel.classList.toggle('hidden');
    propositionsFilters.classList.toggle('hidden');
    searchInput.select();
  } else {
    filtersElt.classList.toggle('filters--selection-mode');
    buttonFilters.classList.toggle('hidden');
    keywordsList.classList.toggle('hidden');
    searchLabel.classList.toggle('hidden');
    propositionsFilters.classList.toggle('hidden');
  }
}

export function setFiltersEltsEvents() {
  const filtersElt = document.querySelector('.filters');
  const buttonFilters = filtersElt.querySelector('.filters__add');
  const searchInput = filtersElt.querySelector('.input-search');

  buttonFilters.addEventListener('click', () => {
    setFiltersDisplay(filtersElt, true);
  });

  document.addEventListener('click', (e) => {
    if (filtersElt.classList.contains('filters--selection-mode')) {
      if (!filtersElt.contains(e.target)) {
        setFiltersDisplay(filtersElt, false);
      }
    }
  });

  // keyup

  searchInput.addEventListener('keyup', () => {
    const text = searchInput.value;
    // eslint-disable-next-line no-use-before-define
    handleKeywordsSearch(filtersElt, text);
  });
}

export function handleKeywordsSearch(filtersElt, text) {
  const abortController = new AbortController();

  getAllKeywords(text, abortController).then((keywords) => {
    abortController.abort();
    // eslint-disable-next-line no-use-before-define
    updatePropositionsList(filtersElt, keywords);
  });
}

export function createPropositionButtonDom(filtersElt, keyword) {
  const filtersList = filtersElt.querySelector('.filters__list');
  const button = document.createElement('button');
  button.className = 'proposition';
  button.innerHTML = keyword.name;
  button.addEventListener('click', () => {
    button.remove();
    // eslint-disable-next-line no-use-before-define
    const res = createFilterButtonDom(keyword);
    filtersList.appendChild(res);
    updateMoviesElt();
    res.addEventListener('click', () => {
      res.remove();
      updateMoviesElt();
    });
  });
  return button;
}

export function updatePropositionsList(filtersElt, data) {
  const propositionsList = filtersElt.querySelector('.filters__propositions');
  emptyElt(propositionsList);

  data.collection.forEach((keyword) => {
    const res = createPropositionButtonDom(filtersElt, keyword);
    propositionsList.appendChild(res);
  });
  // eslint-disable-next-line max-len
  if (data.pagination.current < data.pagination.last || data.pagination.current !== data.pagination.last) {
    const textNode = document.createTextNode('...');
    propositionsList.appendChild(textNode);
  }
}

export function createFilterButtonDom(keyword) {
  const btn = document.createElement('button');
  btn.className = 'filter';
  btn.value = keyword.uuid;
  btn.innerHTML = `<span class="material-symbols-outlined">close</span>${keyword.name}`;
  return btn;
}

export function appendFiltersToQuery(urlSearchParams) {
  const allFilters = document.querySelectorAll('.filters__list button.filter');
  allFilters.forEach((filter) => {
    // urlSearchParams.set('keywords.uuid[]', filter.value);
    urlSearchParams.append('keywords.uuid[]', filter.value);
  });
}
