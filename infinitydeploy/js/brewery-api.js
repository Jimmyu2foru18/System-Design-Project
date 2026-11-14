const BASE_URL = 'https://api.openbrewerydb.org/v1/breweries';

async function getBreweries(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const url = query.toString() ? `${BASE_URL}?${query}` : BASE_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Brewery API error ${response.status}`);
  return response.json();
}

async function getBreweryById(id) {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error(`Brewery API error ${response.status}`);
  return response.json();
}

async function searchBreweries(query) {
  const params = { by_name: query };
  return getBreweries(params);
}

window.breweryApi = { getBreweries, getBreweryById, searchBreweries };
