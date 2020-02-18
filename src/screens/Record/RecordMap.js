import React from 'react';
import MapView, {Marker} from 'react-native-maps';
import {FOCUS_PLACE, MOVE_MAP} from '../../reducers/RecordReducer';

function RecordMap({state: {region, places}, dispatch}) {
  return (
    <MapView
      style={{flex: 1}}
      region={region}
      onRegionChange={region => dispatch([MOVE_MAP, region])}
    >
      {
        places.map(({id, name, latitude, longitude}) =>
          <Marker
            key={id}
            title={name}
            coordinate={{latitude, longitude}}
            onPress={({nativeEvent: {coordinate: {latitude, longitude}}}) => {
              dispatch([FOCUS_PLACE, {
                latitude,
                longitude,
              }]);
            }}
          />,
        )
      }
    </MapView>
  );
}

export default RecordMap;
