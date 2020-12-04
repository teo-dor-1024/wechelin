import React, {useContext, useEffect, useState} from 'react';
import {Button, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Icon, SearchBar} from 'react-native-elements';
import {fetchPlacesAroundMe} from '../../util/fetch';
import {FETCH_PLACES} from '../../reducers/searchReducer';
import {RecordContext} from './RecordScreen';

function KakaoMapSearch({setIsMapOpen, placeName}) {
  const {state: {region, places}, dispatch} = useContext(RecordContext);
  const [text, setText] = useState(placeName);
  const [isFetch, setIsFetch] = useState(false);
  
  useEffect(() => {
    if (!text) {
      console.log(text);
      dispatch(FETCH_PLACES, []);
      setIsFetch(false);
      return;
    }
    
    const fetchPlaces = async (keyword, region) => {
      dispatch([FETCH_PLACES, await fetchPlacesAroundMe(keyword, region)]);
      setIsFetch(false);
    };
    
    fetchPlaces(text, region);
  }, [isFetch]);
  
  return (
    <SafeAreaView>
      <View style={styles.searchModalHeader}>
        <Icon type='font-awesome-5' name='chevron-left' size={20} onPress={() => setIsMapOpen(false)}/>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>카카오맵으로 검색</Text>
        <View style={{width: 20}}/>
      </View>
      <SearchBar
        platform="ios"
        containerStyle={{backgroundColor: '#FFFFFF', paddingHorizontal: 10}}
        inputContainerStyle={{backgroundColor: '#F2F2F2'}}
        inputStyle={{fontSize: 16}}
        leftIconContainerStyle={{marginRight: 5}}
        cancelButtonTitle='취소'
        cancelButtonProps={{
          buttonStyle: {marginRight: 10},
          buttonTextStyle: {fontSize: 16},
        }}
        placeholder="검색"
        value={text}
        onChangeText={text => setText(text)}
        onSubmitEditing={() => setIsFetch(true)}
      />
      <ScrollView>
        {
          places.length ?
            places.map(({id, name, category, address, latitude, longitude, url}) => {
              
              return (
                <View key={id}>
                  <Text>{name}</Text>
                  <Text>{address}</Text>
                </View>
              );
            })
            :
            <View style={styles.manualAdd}>
              <Text style={styles.manualInfo}>카카오맵에 등록된 장소가 없습니다.</Text>
            </View>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchModalHeader: {
    paddingHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manualAdd: {marginTop: 20, paddingHorizontal: 20},
  manualInfo: {fontSize: 16},
});

export default KakaoMapSearch;
