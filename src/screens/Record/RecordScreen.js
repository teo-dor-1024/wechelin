import React, {createContext, useEffect, useReducer, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';
import searchReducer, {FETCH_PLACES, FOCUS_PLACE, MOVE_MAP} from '../../reducers/searchReducer';
import SearchPanel from './SearchPanel';
import Map from './Map';

export const RecordContext = createContext();
const {Provider} = RecordContext;

const initState = {
  region: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  keyword: '',
  places: [],
  selectedIndex: -1,
  addPinMode: false,
  addPinInfo: {
    name: '',
    category: '',
    address: '',
    latitude: 0,
    longitude: 0,
  },
};

function RecordScreen({route: {params}}) {
  const [state, dispatch] = useReducer(searchReducer, initState);
  const modifyInfo = params ? params.modify : null;
  const [goUserPosition, setGoUserPosition] = useState(true);
  
  useEffect(() => {
    if (goUserPosition) {
      Geolocation.getCurrentPosition(
        ({coords: {latitude, longitude}}) => dispatch([MOVE_MAP, {latitude, longitude}]),
        error => console.log(error.code, error.message),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
      setGoUserPosition(false);
    }
  }, [Geolocation, goUserPosition]);
  
  useEffect(() => {
    if (!modifyInfo) {
      return;
    }
    
    const {x, y, placeId, placeName, ...rest} = modifyInfo;
    const latitude = parseFloat(y);
    const longitude = parseFloat(x);
    
    dispatch([FETCH_PLACES, [{
      ...rest,
      id: placeId,
      name: placeName,
      latitude,
      longitude,
    }]]);
    dispatch([FOCUS_PLACE, {index: 0, latitude, longitude}]);
  }, [modifyInfo]);
  
  return (
    <Provider value={{state, dispatch}}>
      <Map setGoUserPosition={setGoUserPosition}/>
      <SearchPanel modifyInfo={modifyInfo}/>
    </Provider>
  );
}

export default RecordScreen;
