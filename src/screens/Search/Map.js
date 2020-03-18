import React, {useContext} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {RecordContext} from './SearchScreen';
import {FOCUS_PLACE, SET_ADD_PIN_INFO} from '../../reducers/searchReducer';

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
      onPress={({nativeEvent: {coordinate}}) => addPinMode && dispatch([SET_ADD_PIN_INFO, {...coordinate}])}
      showsUserLocation
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
