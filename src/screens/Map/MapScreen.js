import React, {useEffect, useRef, useState} from 'react';
import gql from 'graphql-tag';
import {useLazyQuery} from '@apollo/react-hooks';
import Geolocation from 'react-native-geolocation-service';
import {Button, Icon} from 'react-native-elements';
import {Modal, StyleSheet, View, Dimensions} from 'react-native';
import useMyInfo from '../../util/useMyInfo';
import MapView, {Marker} from 'react-native-maps';
import SearchFriends from "./SearchFriends";
import ScorePicker from "../components/ScorePicker";

const GET_RECORDS_BY_MAP = gql`
  query ($userId: String!, $xMin: String!, $xMax: String!, $yMin: String!, $yMax: String!, $keyword: String) {
    mapRecords(userId: $userId, xMin: $xMin, xMax: $xMax, yMin: $yMin, yMax: $yMax, keyword: $keyword) {
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
  const [region, setRegion] = useState({
    latitude: 37.288701,
    longitude: 127.051681,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMoved, setIsMoved] = useState(true);
  const [places, setPlaces] = useState([]);
  const [keyword, setKeyword] = useState('');
  
  const [goUserPosition, setGoUserPosition] = useState(true);
  
  const [isVisibleFriendSearchForm, setIsVisibleFriendSearchForm] = useState(false);
  const [isVisibleScore, setIsVisibleScore] = useState(false);
  const [score, setScore] = useState(0);
  
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
          userId,
          xMin: xMin.toString(),
          xMax: xMax.toString(),
          yMin: yMin.toString(),
          yMax: yMax.toString(),
          keyword,
        },
      });
      setRegion({...region, latitude: (yMin + yMax) / 2, longitude: (xMin + xMax) / 2});
      setIsMoved(false);
    };
    
    reFetch();
  };
  
  useEffect(() => {
    data && data.mapRecords && setPlaces(data.mapRecords.map(({_id, placeName, x, y}) => ({
      id: _id,
      name: placeName,
      latitude: parseFloat(y),
      longitude: parseFloat(x),
    })));
  }, [data]);
  
  return (
    <View style={{flex: 1}}>
      <View style={{position: 'absolute', zIndex: 1000, left: 130, top: 50, width: 120, height: 30}}>
        {
          isMoved && (
            <Button
              title='이지역 재검색'
              titleStyle={{fontSize: 13, color: '#2E64FE'}}
              buttonStyle={styles.btnReFetch}
              icon={<Icon type='material-community' name='reload' size={17} color='#2E64FE'/>}
              onPress={onPressReFetch}
            />
          )
        }
      </View>
      <Button
        containerStyle={styles.toolContainer}
        buttonStyle={styles.btnMapToolTop}
        icon={<Icon type='feather' name='user-plus' size={23}/>}
        onPress={() => setIsVisibleFriendSearchForm(true)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 86}}
        buttonStyle={styles.btnMapToolMid}
        icon={<Icon type='feather' name='star' size={23}/>}
        onPress={() => setIsVisibleScore(!isVisibleScore)}
      />
      <Button
        containerStyle={{...styles.toolContainer, top: 130}}
        buttonStyle={styles.btnMapToolBottom}
        icon={<Icon type='feather' name='navigation' size={23}/>}
        onPress={() => setGoUserPosition(true)}
      />
      <MapView
        ref={mapEl}
        style={{flex: 1}}
        region={region}
        onTouchStart={() => setIsMoved(true)}
        showsUserLocation
      >
        {
          places.map(({id, name, latitude, longitude}) =>
            <Marker
              key={id}
              title={name}
              coordinate={{latitude, longitude}}
            />,
          )
        }
      </MapView>
      
      <Modal
        animationType="slide"
        visible={isVisibleFriendSearchForm}
      >
        <SearchFriends
          userId={userId}
          setIsVisibleModal={setIsVisibleFriendSearchForm}
        />
      </Modal>
      
      <ScorePicker
        score={score}
        onChange={value => setScore(value)}
        isVisible={isVisibleScore}
        close={() => setIsVisibleScore(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#FAFAFA',
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
    borderTopWidth: 0,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
});

export default MapScreen;
