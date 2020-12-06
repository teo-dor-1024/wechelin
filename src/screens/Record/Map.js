import React, {useEffect, useRef, useState} from 'react';
import MapView, {Callout, Marker} from 'react-native-maps';
import {Button, Icon} from 'react-native-elements';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {debounce} from 'lodash';

function Map({region, setRegion, setGoUser, places, setUrl}) {
  const map = useRef();
  const fitToMarkers = useRef(debounce(ids => {
    map.current.fitToSuppliedMarkers(ids);
  }, 1000));
  
  // 지도 위치 변경 여부
  const [isMoved, setIsMoved] = useState(false);
  
  const handleMove = () => {
    console.log('touch end');
    if (!isMoved) {
      setIsMoved(true)
    }
  };
  
  const handleClickHere = async () => {
    const {} = await map.current.getMapBoundaries();
    setRegion();
  };
  
  useEffect(() => {
    if (!places?.length) {
      return;
    }
    
    setRegion({
      ...region,
      latitude: places[0].latitude,
      longitude: places[0].longitude,
    });
  }, [places]);
  
  useEffect(() => {
    if (!places.length) {
      return;
    }
    
    fitToMarkers.current(places.map(({placeId}) => placeId));
  });
  
  return (
    <View style={styles.container}>
      {
        isMoved && (
          <Button
            title='여기 검색'
            containerStyle={styles.reSearchHereContainer}
            buttonStyle={styles.reSearchHereButton}
            titleStyle={styles.reSearchTitle}
            onPress={handleClickHere}
          />
        )
      }
      <Button
        containerStyle={styles.goToUserContainer}
        buttonStyle={styles.userButton}
        icon={<Icon type='font-awesome-5' name='location-arrow' size={18} color='#d23669'/>}
        onPress={() => setGoUser(true)}
      />
      <MapView
        ref={map}
        style={{...Dimensions.get('window')}}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  reSearchHereContainer: {
    position: 'absolute',
    zIndex: 99,
    top: 10,
    left: (Dimensions.get('window').width - 100) / 2
  },
  reSearchHereButton: {
    backgroundColor: '#FFF',
    width: 100,
    borderRadius: 20,
    padding: 5,
  },
  reSearchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d23669'
  },
  goToUserContainer: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    position: 'absolute',
    zIndex: 99,
    right: 10,
    top: 60,
  },
  userButton: {
    backgroundColor: '#FFF',
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 0,
  },
  markerTitle: {marginRight: 5, fontSize: 16, marginBottom: 3},
  markerLink: {color: '#0080FF'}
});

export default Map;
