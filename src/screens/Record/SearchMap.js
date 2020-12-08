import React, {memo} from 'react';
import MapView, {Callout, Marker} from 'react-native-maps';
import {Dimensions, StyleSheet, Text, TouchableOpacity} from 'react-native';

const {height, width} = Dimensions.get('window');

function SearchMap({map, region, handleMove, places, setUrl}) {
  return (
    <MapView
      ref={map}
      style={{height, width}}
      region={region}
      onTouchEnd={handleMove}
      showsUserLocation
    >
      {
        places.map(({placeId, placeName, latitude, longitude, url}) => (
          <Marker
            key={placeId}
            identifier={placeId}
            coordinate={{latitude, longitude}}
          >
            <Callout tooltip={false}>
              <Text style={styles.markerTitle}>{placeName}</Text>
              <TouchableOpacity onPress={() => setUrl(url)}>
                <Text style={styles.markerLink}>상세보기</Text>
              </TouchableOpacity>
            </Callout>
          </Marker>
        ))
      }
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerTitle: {marginRight: 5, fontSize: 16, marginBottom: 3},
  markerLink: {color: '#0080FF'},
});

export default memo(SearchMap);
