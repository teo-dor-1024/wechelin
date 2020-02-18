import React, {useEffect, useReducer} from 'react';
import Geolocation from 'react-native-geolocation-service';
import RecordReducer, {MOVE_MAP, SLIDE_BOTTOM} from '../../reducers/RecordReducer';
import SearchForm from './SearchForm';
import RecordMap from './RecordMap';

export const containerStyle = {
  zIndex: 1,
  flex: 0.9,
  backgroundColor: '#FFFFFF',
  borderRadius: 15,
  paddingTop: 5,
  paddingRight: 5,
  paddingLeft: 5,
};

const initState = {
  region: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  slidePosition: SLIDE_BOTTOM,
  places: [],
};

function RecordScreen() {
  const [state, dispatch] = useReducer(RecordReducer, initState);
  
  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({coords: {latitude, longitude}}) => dispatch([MOVE_MAP, {latitude, longitude}]),
      error => console.log(error.code, error.message),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, [Geolocation]);
  
  return (
    <>
      <RecordMap state={state} dispatch={dispatch}/>
      <SearchForm state={state} dispatch={dispatch}/>
    </>
  );
}

export default RecordScreen;
