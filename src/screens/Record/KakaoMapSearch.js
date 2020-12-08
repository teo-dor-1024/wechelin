import React, {useEffect, useRef, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {debounce} from 'lodash';
import {Modal, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {fetchPlacesAroundMe} from '../../util/fetch';
import ModalHeader from '../components/ModalHeader';
import SearchBackground from './SearchBackground';
import SearchResults from './SearchResults';

const INIT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function KakaoMapSearch({setIsMapOpen, initKeyword, setPlace}) {
  // 검색어
  const [text, setText] = useState(initKeyword);
  // 현재 위치
  const [region, setRegion] = useState(INIT_REGION);
  const [goUser, setGoUser] = useState(false);
  // 현재 반경
  const [rect, setRect] = useState('');
  // 상세 팝업
  const [url, setUrl] = useState('');
  // 검색한 카카오맵 장소 목록
  const [places, setPlaces] = useState([]);
  // 검색 API
  const fetchPlaces = useRef(debounce(async (keyword, region) => {
    setPlaces(keyword ? await fetchPlacesAroundMe(keyword, region) : []);
  }, 500));
  
  
  // 현재 위치 입력
  useEffect(() => {
    if (goUser) {
      Geolocation.getCurrentPosition(
        ({coords: {latitude, longitude}}) => setRegion({...region, latitude, longitude}),
        error => console.log(error.code, error.message),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
      
      setGoUser(false);
    }
  }, [Geolocation, goUser]);
  
  // 카카오맵 검색 API 호출
  useEffect(() => {
    // 검색어가 바뀌거나, 지도의 반경이 바뀔 때만 새로 호출
    fetchPlaces.current(text, region, rect);
  }, [text, rect]);
  
  const close = () => setIsMapOpen(false);
  
  return (
    <>
      <SafeAreaView>
        <ModalHeader title='카카오맵으로 검색' close={close}/>
        <SearchBackground
          region={region}
          setRegion={setRegion}
          setGoUser={setGoUser}
          places={places}
          setUrl={setUrl}
          setRect={setRect}
        />
        
        <Modal animationType="slide" visible={!!url}>
          <SafeAreaView style={{flex: 1}}>
            <ModalHeader title='상세 정보' close={() => setUrl('')}/>
            <WebView source={{uri: url}}/>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
      
      <SearchResults
        text={text}
        setText={setText}
        places={places}
        setPlace={setPlace}
        close={close}
      />
    </>
  );
}

export default KakaoMapSearch;
