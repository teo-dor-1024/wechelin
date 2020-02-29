import React, {useContext} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {RecordContext} from './SearchScreen';
import {FOCUS_PLACE, MOVE_MAP} from '../../reducers/searchReducer';

function Map() {
  const {state: {region, places}, dispatch} = useContext(RecordContext);
  
  return (
    <MapView
      style={{flex: 1}}
      region={region}
      onRegionChange={region => dispatch([MOVE_MAP, region])}
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
    </MapView>
  );
}

export default Map;
