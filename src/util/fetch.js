const getPlacesByKeywordApi = 'https://dapi.kakao.com/v2/local/search/keyword.json';

export const fetchPlacesAroundMe = async (keyword, {latitude, longitude}) => {
  try {
    const x = longitude.toString();
    const y = latitude.toString();
    const response = await fetch(`${getPlacesByKeywordApi}?query=${keyword}&x=${x}&y=${y}&sort=distance`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'KakaoAK 35dcb35a6239f6ec6c7f7384061ff8d1',
        'Content-Type': 'application/json',
      },
    });
    const {documents} = await response.json();
    
    return documents.map((
      {
        id,
        place_name,
        place_url,
        road_address_name,
        address_name,
        category_name,
        x,
        y,
        distance,
      }) => ({
        id,
        name: place_name,
        url: place_url,
        address: road_address_name || address_name,
        category: category_name,
        latitude: parseFloat(y),
        longitude: parseFloat(x),
        distance,
      }),
    );
  } catch (err) {
    console.error(JSON.stringify(err));
    return [];
  }
};
