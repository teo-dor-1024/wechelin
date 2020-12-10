import React, {useEffect, useRef, useState} from 'react';
import gql from 'graphql-tag';
import {useLazyQuery} from '@apollo/react-hooks';
import Geolocation from 'react-native-geolocation-service';
import {Button, Icon} from 'react-native-elements';
import {Dimensions, Modal, Platform, SafeAreaView, StyleSheet, View} from 'react-native';
import useMyInfo from '../../util/useMyInfo';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import WebView from 'react-native-webview';

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

const isInArray = (array, target) => array.findIndex(val => val === target) > -1;
const getBackgroundColor = (array, target) =>
  isInArray(array, target) ?
    '#E6E6E6'
    :
    '#FAFAFA';

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
  
  const [isOpenStartFilter, setIsOpenStarFilter] = useState(false);
  const [scoreIndexList, setScoreIndexList] = useState([]);
  
  const clickScore = selectedIndex => {
    const newScoreIndexList = isInArray(scoreIndexList, selectedIndex) ?
      scoreIndexList.filter(scoreIndex => scoreIndex !== selectedIndex)
      :
      scoreIndexList.concat(selectedIndex);
    
    setScoreIndexList(newScoreIndexList);
  };
  
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
    onPressReFetch();
  }, [userId]);
  
  useEffect(() => {
    if (data && data.mapRecords) {
      setPlaces(data.mapRecords.map(({_id, placeName, x, y, score, url, count}) => ({
        id: _id,
        name: placeName,
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
      
      {
        isOpenStartFilter &&
        <View style={{...styles.toolContainer, bottom: 140, flexDirection: 'row'}}>
          <Button
            buttonStyle={{
              ...styles.btnMapToolLeft,
              backgroundColor: getBackgroundColor(scoreIndexList, 0),
            }}
            icon={<Icon type="material-community" name="numeric-1" size={30} color="black"/>}
            onPress={() => clickScore(0)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 1),
            }}
            icon={<Icon type="material-community" name="numeric-2" size={30} color="black"/>}
            onPress={() => clickScore(1)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 2),
            }}
            icon={<Icon type="material-community" name="numeric-3" size={30} color="black"/>}
            onPress={() => clickScore(2)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 3),
            }}
            icon={<Icon type="material-community" name="numeric-4" size={30} color="black"/>}
            onPress={() => clickScore(3)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolRight,
              backgroundColor: getBackgroundColor(scoreIndexList, 4),
            }}
            icon={<Icon type="material-community" name="numeric-5" size={30} color="black"/>}
            onPress={() => clickScore(4)}
          />
        </View>
      }
      <Button
        containerStyle={{
          ...styles.toolContainer,
          bottom: 95,
        }}
        buttonStyle={{
          ...styles.btnMapToolAlone,
          backgroundColor: scoreIndexList.length ? '#E6E6E6' : '#FAFAFA',
        }}
        icon={<Icon type='feather' name='star' size={20}/>}
        title={'별점 필터 걸기'}
        titleStyle={{color: '#000', marginLeft: 8, fontSize: 16, fontWeight: 'bold'}}
        onPress={() => setIsOpenStarFilter(!isOpenStartFilter)}
      />
      
      <MapView
        ref={mapEl}
        style={{flex: 1}}
        region={region}
        onRegionChangeComplete={region => currentRegion.current = region}
        onTouchStart={() => setIsMoved(true)}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : null}
        showsUserLocation
      >
        {
          places.map(({id, name, latitude, longitude, score, url, count}) =>
            <Marker
              key={id}
              title={name}
              description={score ? `평점: ${parseFloat(score).toFixed(1)}점  /  방문 횟수: ${count}회` : `방문 횟수: ${count}회`}
              coordinate={{latitude, longitude}}
              pinColor={'#FA5858'}
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
  
  toolContainer: {
    position: 'absolute',
    zIndex: 99,
    right: 15,
  },
  btnMapToolAlone: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
  btnMapToolLeft: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderRightWidth: 0,
    borderColor: '#D8D8D8',
    borderWidth: 1,
    width: 40,
  },
  btnMapToolMid: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    borderRightWidth: 0,
    borderColor: '#D8D8D8',
    borderWidth: 1,
    width: 40,
  },
  btnMapToolRight: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderColor: '#D8D8D8',
    borderWidth: 1,
    width: 40,
  },
});

export default MapScreen;
