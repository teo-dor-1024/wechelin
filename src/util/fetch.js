const getPlacesByKeywordApi = 'https://dapi.kakao.com/v2/local/search/keyword.json';

export const fetchPlacesAroundMe = async (keyword, {latitude, longitude}, rect) => {
  try {
    let queryString = `?query=${keyword}`;
    if (rect) {
      queryString += `&rect=${rect}`;
    } else if (latitude && longitude) {
      const x = longitude.toString();
      const y = latitude.toString();
      
      queryString += `&x=${x}&y=${y}&radius=20000`;
    }
    
    const response = await fetch(`${getPlacesByKeywordApi}${queryString}`, {
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
        category_group_name,
        category_name,
        x,
        y,
        distance,
      }) => ({
        placeId: id,
        placeName: place_name,
        url: place_url,
        address: road_address_name || address_name,
        categoryGroup: category_group_name,
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
