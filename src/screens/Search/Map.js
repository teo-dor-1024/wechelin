import React, {useContext} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {Icon} from 'react-native-elements';
import {RecordContext} from './SearchScreen';
import {FOCUS_PLACE, SET_ADD_PIN_INFO} from '../../reducers/searchReducer';

function Map({setGoUserPosition}) {
  const {
    state: {
      region, places, addPinMode, addPinInfo,
    },
    dispatch,
  } = useContext(RecordContext);
  
  return (
    <>
      <Icon
        name='location-arrow'
        type='font-awesome'
        containerStyle={{
          position: 'absolute',
          top: 70,
          right: 10,
          zIndex: 1,
          backgroundColor: '#FAFAFA',
          paddingVertical: 6,
          paddingHorizontal: 9,
          borderRadius: 5,
          borderColor: '#D8D8D8',
          borderWidth: 1,
        }}
        color='#0080FF'
        size={30}
        onPress={() => setGoUserPosition(true)}
      />
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
    </>
  );
}

export default Map;
