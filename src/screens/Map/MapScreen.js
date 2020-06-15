import React, {useEffect, useRef, useState} from 'react';
import gql from 'graphql-tag';
import {useLazyQuery} from '@apollo/react-hooks';
import Geolocation from 'react-native-geolocation-service';
import {Button, Icon} from 'react-native-elements';
import {Dimensions, Modal, Platform, SafeAreaView, StyleSheet, View} from 'react-native';
import useMyInfo from '../../util/useMyInfo';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import WebView from "react-native-webview";
import SearchFriends from "./SearchFriends";

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
  
  const [isVisibleFriendSearchForm, setIsVisibleFriendSearchForm] = useState(false);
  const [friendId, setFriendId] = useState('');
  
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
          userId: friendId || userId,
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
  }, [userId, friendId]);
  
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
      <View style={styles.reFetchContainer}>
        {
          isMoved && (
            <Button
              title='이지역 재검색'
              titleStyle={{fontSize: 13, color: '#2E64FE'}}
              buttonStyle={styles.btnReFetch}
              icon={{
                type: 'material-community',
                name: 'reload',
                size: 17,
                color: '#2E64FE'
              }}
              onPress={onPressReFetch}
            />
          )
        }
      </View>
      
      {
        isOpenStartFilter &&
        <View style={{...styles.toolContainer, bottom: 140, flexDirection: 'row'}}>
          <Button
            buttonStyle={{
              ...styles.btnMapToolLeft,
              backgroundColor: getBackgroundColor(scoreIndexList, 0),
            }}
            icon={<Icon type="material-community" name="numeric-1" size={30} color="black" />}
            onPress={() => clickScore(0)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 1),
            }}
            icon={<Icon type="material-community" name="numeric-2" size={30} color="black" />}
            onPress={() => clickScore(1)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 2),
            }}
            icon={<Icon type="material-community" name="numeric-3" size={30} color="black" />}
            onPress={() => clickScore(2)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolMid,
              backgroundColor: getBackgroundColor(scoreIndexList, 3),
            }}
            icon={<Icon type="material-community" name="numeric-4" size={30} color="black" />}
            onPress={() => clickScore(3)}
          />
          <Button
            buttonStyle={{
              ...styles.btnMapToolRight,
              backgroundColor: getBackgroundColor(scoreIndexList, 4),
            }}
            icon={<Icon type="material-community" name="numeric-5" size={30} color="black" />}
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
          backgroundColor: scoreIndexList.length ? '#E6E6E6' : '#FAFAFA'
        }}
        icon={<Icon type='feather' name='star' size={20}/>}
        title={'별점 필터 걸기'}
        titleStyle={{color: '#000', marginLeft: 8, fontSize: 16, fontWeight: 'bold'}}
        onPress={() => setIsOpenStarFilter(!isOpenStartFilter)}
      />
      
      <Button
        containerStyle={{
          ...styles.toolContainer,
          bottom: 45,
        }}
        buttonStyle={{
          ...styles.btnMapToolAlone,
          backgroundColor: friendId ? '#E6E6E6' : '#FAFAFA'
        }}
        icon={<Icon type='feather' name={friendId ? 'user-minus' : 'user-plus'} size={20}/>}
        title={friendId ? '내 기록 보기' : '친구 기록 보기'}
        titleStyle={{color: '#000', marginLeft: 8, fontSize: 16, fontWeight: 'bold'}}
        onPress={() => {
          friendId ?
            setFriendId('')
            :
            setIsVisibleFriendSearchForm(true);
        }}
      />
      
      <Button
        containerStyle={{...styles.toolContainer, top: 86}}
        buttonStyle={styles.btnMapToolAlone}
        icon={<Icon type='feather' name='navigation' size={23}/>}
        onPress={() => setGoUserPosition(true)}
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
          places
            .filter(({score}) => {
              const grade = Math.floor(score);
              
              // 친구기록이면 평가 한 것만 + 점수 체크 한 것만
              return (!friendId || score) && (
                !scoreIndexList.length
                || scoreIndexList.findIndex(target => (target + 1) === grade) > -1
              );
            })
            .map(({id, name, latitude, longitude, score, url, count}) =>
              <Marker
                key={id}
                title={name}
                description={score ? `평점: ${parseFloat(score).toFixed(1)}점  /  방문 횟수: ${count}회` : `방문 횟수: ${count}회`}
                coordinate={{latitude, longitude}}
                pinColor={friendId ? '#11D050' : '#FA5858'}
                onCalloutPress={() => {
                  setPlaceUrl(url);
                  setIsVisiblePlaceDetail(true);
                }}
              />
            )
        }
      </MapView>
      
      <Modal
        animationType="slide"
        visible={isVisibleFriendSearchForm}
      >
        <SearchFriends
          userId={userId}
          setFriendId={setFriendId}
          close={() => setIsVisibleFriendSearchForm(false)}
        />
      </Modal>
      
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
  reFetchContainer: {
    position: 'absolute',
    zIndex: 1000,
    left: (Dimensions.get('window').width - 120) / 2,
    top: 50,
    width: 120,
    height: 30,
  },
  btnReFetch: {
    width: 120,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E6E6',
    borderWidth: 0.3,
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
