import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Modal, SafeAreaView, StyleSheet, View} from 'react-native';
import {Button, ButtonGroup, Icon} from 'react-native-elements';
import MapView, {Marker} from 'react-native-maps';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import {useLazyQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import useMyInfo from '../../util/useMyInfo';

const GET_RECORDS_BY_MAP = gql`
  query ($userId: String!, $xMin: String!, $xMax: String!, $yMin: String!, $yMax: String!) {
    mapRecords(userId: $userId, xMin: $xMin, xMax: $xMax, yMin: $yMin, yMax: $yMax) {
      _id
      placeName
      count
      url
      x
      y
      score
    }
  }
`;

function MapScreen() {
  const {id: userId} = useMyInfo();
  
  const mapEl = useRef();
  // 지도에 셋팅할 좌표
  const [region, setRegion] = useState({
    latitude: 37.288701,
    longitude: 127.051681,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // 지도가 이동된 좌표
  const currentRegion = useRef({
    latitude: 37.288701,
    longitude: 127.051681,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMoved, setIsMoved] = useState(true);
  const [places, setPlaces] = useState([]);
  
  const [goUserPosition, setGoUserPosition] = useState(true);
  
  const [placeUrl, setPlaceUrl] = useState('');
  const [isVisiblePlaceDetail, setIsVisiblePlaceDetail] = useState(false);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {
    if (goUserPosition) {
      Geolocation.getCurrentPosition(
        ({coords: {latitude, longitude}}) => setRegion({...region, latitude, longitude}),
        error => console.log(error.code, error.message),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
      setGoUserPosition(false);
    }
  }, [goUserPosition]);
  
  const [getRecords, {data}] = useLazyQuery(GET_RECORDS_BY_MAP);
  
  const onPressReFetch = () => {
    const reFetch = async () => {
      const {northEast, southWest} = await mapEl.current.getMapBoundaries();
      const xMin = southWest.longitude;
      const xMax = northEast.longitude;
      const yMin = southWest.latitude;
      const yMax = northEast.latitude;
      
      getRecords({
        variables: {
          userId: userId,
          xMin: xMin.toString(),
          xMax: xMax.toString(),
          yMin: yMin.toString(),
          yMax: yMax.toString(),
        },
      });
      setRegion({
        ...currentRegion.current,
        latitude: (yMin + yMax) / 2,
        longitude: (xMin + xMax) / 2,
      });
      setIsMoved(false);
    };
    
    reFetch();
  };
  
  useEffect(() => {
    if (data && data.mapRecords) {
      setPlaces(data.mapRecords.map(({_id, placeName, x, y, score, url, count}) => ({
        _id,
        placeName,
        latitude: parseFloat(y),
        longitude: parseFloat(x),
        score,
        url,
        count,
      })));
    }
  }, [data]);
  
  return (
    <View style={{flex: 1}}>
      {
        isMoved && (
          <Button
            title='여기 검색'
            containerStyle={styles.reSearchHereContainer}
            buttonStyle={styles.reSearchHereButton}
            titleStyle={styles.reSearchTitle}
            onPress={onPressReFetch}
          />
        )
      }
      <Button
        containerStyle={styles.goToUserContainer}
        buttonStyle={styles.userButton}
        icon={<Icon type='font-awesome-5' name='location-arrow' size={18} color='#d23669'/>}
        onPress={() => setGoUserPosition(true)}
      />
      
      <View style={styles.scoreContainer}>
        <ButtonGroup
          containerStyle={styles.scoreButtonGroup}
          buttonStyle={{borderRadius: 15}}
          selectedButtonStyle={{backgroundColor: '#d23669'}}
          selectedTextStyle={{color: '#FFF', fontWeight: 'bold', fontSize: 14}}
          innerBorderStyle={{width: 0}}
          textStyle={{color: '#A4A4A4', fontWeight: 'bold', fontSize: 14}}
          buttons={['전체', '1점', '2점', '3점', '4점', '5점']}
          selectedIndex={selectedIndex}
          onPress={index => setSelectedIndex(index)}
        />
      </View>
      
      <MapView
        ref={mapEl}
        style={{flex: 1}}
        region={region}
        onRegionChangeComplete={region => currentRegion.current = region}
        onTouchStart={() => setIsMoved(true)}
        showsUserLocation
      >
        {
          places.filter(({score}) => selectedIndex > 0 ? selectedIndex === score : true)
            .map(({_id, placeName, latitude, longitude, score, url, count}) =>
              <Marker
                key={_id}
                title={placeName}
                description={score ?
                  `평점: ${parseFloat(score).toFixed(1)}점  /  방문 횟수: ${count}회`
                  :
                  `방문 횟수: ${count}회`
                }
                coordinate={{latitude, longitude}}
                pinColor={'#d23669'}
                onCalloutPress={() => {
                  setPlaceUrl(url);
                  setIsVisiblePlaceDetail(true);
                }}
              />,
            )
        }
      </MapView>
      
      <Modal animationType='slide' visible={isVisiblePlaceDetail}>
        <SafeAreaView>
          <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
            <View style={{alignItems: 'flex-end', marginHorizontal: 10}}>
              <Icon
                type='antdesign'
                name='close'
                size={25}
                onPress={() => setIsVisiblePlaceDetail(false)}
              />
            </View>
            <View style={{width: '100%', height: '100%'}}>
              <WebView
                source={{uri: placeUrl}}
                style={{marginTop: -35, marginBottom: 30}}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  reSearchHereContainer: {
    position: 'absolute',
    zIndex: 99,
    top: 50,
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
    top: 90,
  },
  userButton: {
    backgroundColor: '#FFF',
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 0,
  },
  scoreContainer: {position: 'absolute', bottom: 25, zIndex: 99, width: '100%'},
  scoreButtonGroup: {
    backgroundColor: '#FFF',
    borderWidth: 0,
    borderRadius: 20,
    height: 40,
    padding: 5,
  },
});

export default MapScreen;
