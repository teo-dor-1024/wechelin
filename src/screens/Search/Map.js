import React, {useContext} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {RecordContext} from './SearchScreen';
import {
  FOCUS_PLACE,
  MOVE_MAP,
  SET_ADD_PIN_INFO,
  SET_SLIDE_POSITION,
  SLIDE_BOTTOM,
  SLIDE_MIDDLE,
} from '../../reducers/searchReducer';

function Map() {
  const {
    state: {
      region, places, addPinMode, addPinInfo,
    },
    dispatch,
  } = useContext(RecordContext);
  
  return (
    <MapView
      style={{flex: 1}}
      region={region}
      onRegionChangeComplete={region => dispatch([MOVE_MAP, region])}
      onPress={
        ({nativeEvent: {coordinate}}) => {
          if (addPinMode) {
            dispatch([SET_ADD_PIN_INFO, {...coordinate}]);
            dispatch([SET_SLIDE_POSITION, SLIDE_MIDDLE]);
          } else {
            dispatch([SET_SLIDE_POSITION, SLIDE_BOTTOM]);
          }
        }
      }
      showsUserLocation
      followsUserLocation
      showsMyLocationButton
    >
      {
        places.map(({id, name, latitude, longitude}, index) =>
          <Marker
            key={id}
            title={name}
            coordinate={{latitude, longitude}}
            onPress={
              ({
                 nativeEvent: {
                   coordinate: {latitude, longitude},
                 },
               }) => dispatch([FOCUS_PLACE, {
                index,
                latitude,
                longitude,
              }])
            }
          />,
        )
      }
      {
        addPinInfo.latitude ?
          <Marker coordinate={{...addPinInfo}}/>
          :
          null
      }
    </MapView>
  );
}

export default Map;
