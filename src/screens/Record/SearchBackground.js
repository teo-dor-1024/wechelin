import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Icon} from 'react-native-elements';
import {Dimensions, StyleSheet, View} from 'react-native';
import {debounce} from 'lodash';
import SearchMap from './SearchMap';

function SearchBackground({region, setRegion, setGoUser, places, setUrl, setRect}) {
  const map = useRef();
  const fitToMarkers = useRef(debounce(ids => {
    map.current.fitToSuppliedMarkers(ids);
  }, 1000));
  
  // 지도 위치 변경 여부
  const [isMoved, setIsMoved] = useState(false);
  const handleMove = useCallback(() => {
    setIsMoved(true);
  }, []);
  
  const handleClickHere = async () => {
    const {northEast, southWest} = await map.current.getMapBoundaries();
    const {center: {latitude, longitude}} = await map.current.getCamera();
    
    setRegion({...region, latitude, longitude});
    setRect(`${southWest.longitude},${southWest.latitude},${northEast.longitude},${southWest.latitude}`);
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
    
    fitToMarkers.current(places.map(({placeId}) => placeId));
  }, [places]);
  
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
      <SearchMap
        map={map}
        region={region}
        handleMove={handleMove}
        places={places}
        setUrl={setUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  reSearchHereContainer: {
    position: 'absolute',
    zIndex: 99,
    top: 10,
    left: (Dimensions.get('window').width - 100) / 2,
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
    color: '#d23669',
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
});

export default SearchBackground;
