import React, {useEffect, useRef, useState} from 'react';
import gql from 'graphql-tag';
import {useLazyQuery} from '@apollo/react-hooks';
import Geolocation from 'react-native-geolocation-service';
import {Button, Icon} from 'react-native-elements';
import {Modal, StyleSheet, View} from 'react-native';
import useMyInfo from '../../util/useMyInfo';
import MapView, {Marker} from 'react-native-maps';
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
  const [region, setRegion] = useState({
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
        ...region,
        latitude: (yMin + yMax) / 2,
        longitude: (xMin + xMax) / 2
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
      setPlaces(data.mapRecords.map(({_id, placeName, x, y, score}) => ({
        id: _id,
        name: placeName,
        latitude: parseFloat(y),
        longitude: parseFloat(x),
        score: score || 0,
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
      
      <Button
        containerStyle={styles.toolContainer}
        buttonStyle={{
          ...styles.btnMapToolTop,
          backgroundColor: friendId ? '#E6E6E6' : '#FAFAFA'
        }}
        icon={<Icon type='feather' name='user-plus' size={23}/>}
        onPress={() => {
          friendId ?
            setFriendId('')
            :
            setIsVisibleFriendSearchForm(true);
        }}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 86}}
        buttonStyle={styles.btnMapToolBottom}
        icon={<Icon type='feather' name='navigation' size={23}/>}
        onPress={() => setGoUserPosition(true)}
      />
      
      <Button
        containerStyle={{...styles.toolContainer, top: 200}}
        buttonStyle={{
          ...styles.btnMapToolTop,
          backgroundColor: getBackgroundColor(scoreIndexList, 0),
          paddingHorizontal: 8,
          width: 45,
        }}
        title='1점'
        titleStyle={{color: 'black'}}
        onPress={() => clickScore(0)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 240}}
        buttonStyle={{
          ...styles.btnMapToolMid,
          backgroundColor: getBackgroundColor(scoreIndexList, 1),
          paddingHorizontal: 8,
          width: 45,
        }}
        title='2점'
        titleStyle={{color: 'black'}}
        onPress={() => clickScore(1)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 280}}
        buttonStyle={{
          ...styles.btnMapToolMid,
          backgroundColor: getBackgroundColor(scoreIndexList, 2),
          paddingHorizontal: 8,
          width: 45,
        }}
        title='3점'
        titleStyle={{color: 'black'}}
        onPress={() => clickScore(2)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 320}}
        buttonStyle={{
          ...styles.btnMapToolMid,
          backgroundColor: getBackgroundColor(scoreIndexList, 3),
          paddingHorizontal: 8,
          width: 45,
        }}
        title='4점'
        titleStyle={{color: 'black'}}
        onPress={() => clickScore(3)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 360}}
        buttonStyle={{
          ...styles.btnMapToolBottom,
          backgroundColor: getBackgroundColor(scoreIndexList, 4),
          paddingHorizontal: 8,
          width: 45,
        }}
        title='5점'
        titleStyle={{color: 'black'}}
        onPress={() => clickScore(4)}
      />
      
      <MapView
        ref={mapEl}
        style={{flex: 1}}
        region={region}
        onTouchStart={() => setIsMoved(true)}
        showsUserLocation
      >
        {
          places
            .filter(({score}) => {
              const unit = Math.floor(score);
              
              return !scoreIndexList.length
                || scoreIndexList.findIndex(target => (target + 1) === unit) > -1;
            })
            .map(({id, name, latitude, longitude, score}) =>
              <Marker
                key={id}
                title={name}
                description={`평점: ${score}점`}
                coordinate={{latitude, longitude}}
                pinColor={friendId ? '#11D050' : '#FA5858'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  reFetchContainer: {
    position: 'absolute',
    zIndex: 1000,
    left: 130,
    top: 50,
    width: 120,
    height: 30,
  },
  btnReFetch: {
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
    top: 45
  },
  btnMapToolTop: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
  btnMapToolMid: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 0,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
  btnMapToolBottom: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
});

export default MapScreen;
