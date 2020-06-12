import React, {useContext, useEffect, useState} from 'react';
import {RecordContext} from './RecordScreen';
import {Icon, ListItem} from 'react-native-elements';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {convertDistance} from '../../util/StringUtils';
import {fetchPlacesAroundMe} from '../../util/fetch';
import {
  CLEAR_SEARCH_LIST,
  FETCH_PLACES,
  FOCUS_PLACE,
  SET_ADD_PIN_MODE,
  WRITE_KEYWORD,
} from '../../reducers/searchReducer';
import {SLIDE_BOTTOM, SLIDE_MIDDLE} from './SearchPanel';

function SearchForm({setAllowDrag, setTab, slideRef}) {
  const {state: {region, keyword, places}, dispatch} = useContext(RecordContext);
  const [text, setText] = useState('');
  
  useEffect(() => {
    const fetchPlaces = async (keyword, region) => {
      const fetchResult = keyword ?
        await fetchPlacesAroundMe(keyword, region)
        :
        [];
      
      dispatch([FETCH_PLACES, fetchResult]);
    };
    
    !places.length && fetchPlaces(keyword, region);
  }, [keyword]);
  
  const onClickManual = () => {
    setTab('ManualAddForm');
    dispatch([CLEAR_SEARCH_LIST]);
    dispatch([SET_ADD_PIN_MODE, true]);
    setAllowDrag(false);
    slideRef.current.show(SLIDE_BOTTOM);
  };
  
  return (
    <>
      {
        !keyword ?
          <View style={{padding: 20}}>
            <View style={{marginVertical: 15}}>
              <Text style={{fontSize: 22, fontWeight: 'bold'}}>등록할 장소는</Text>
              <Text style={{fontSize: 22, fontWeight: 'bold', marginTop: 3}}>어디인가요?</Text>
            </View>
            <TextInput
              style={{height: 40, borderBottomColor: '#E6E6E6', borderBottomWidth: 2, fontSize: 18, marginTop: 10}}
              value={text}
              onChangeText={text => setText(text)}
              onSubmitEditing={() => {
                dispatch([WRITE_KEYWORD, text]);
                slideRef.current.show(SLIDE_MIDDLE);
              }}
              placeholder="가게 이름 또는 주소"
            />
          </View>
          :
          <>
            <ListItem
              title={`"${keyword}"`}
              titleStyle={{fontSize: 22, fontWeight: 'bold'}}
              subtitle={`근처 ${places.length} 개의 검색결과`}
              subtitleStyle={{color: '#424242'}}
              onPress={
                ({nativeEvent}) =>
                  nativeEvent.stopImmediatePropagation && nativeEvent.stopImmediatePropagation()
              }
              rightIcon={
                <Icon
                  type='ionicon'
                  name='ios-close-circle-outline'
                  size={30}
                  color='#848484'
                  onPress={() => {
                    dispatch([CLEAR_SEARCH_LIST]);
                    setText('');
                    slideRef.current.show(SLIDE_MIDDLE);
                  }}
                />
              }
            />
            <ListItem
              title='찾으시는 장소가 없으신가요?'
              titleStyle={{fontWeight: 'bold', fontSize: 16}}
              subtitle='직접 등록하러 가기'
              subtitleStyle={{color: '#0174DF', fontSize: 14}}
              rightIcon={<Icon type='ionicon' name='ios-add-circle-outline' size={30} color='#58ACFA'/>}
              onPress={onClickManual}
              bottomDivider
            />
            <ScrollView
              onTouchStart={() => setAllowDrag(false)}
              onTouchEnd={() => setAllowDrag(true)}
              onTouchCancel={() => setAllowDrag(true)}
              style={{marginBottom: 65}}
            >
              {
                places.map((place, index) => {
                  const {id, name, address, distance, latitude, longitude} = place;
                  
                  return (
                    <ListItem
                      key={id}
                      title={name}
                      titleStyle={{fontWeight: 'bold'}}
                      subtitle={`${address.split(' ').slice(1).join(' ')} · ${convertDistance(distance)}`}
                      bottomDivider={index !== places.length - 1}
                      onPress={() => {
                        setTab('PlaceDetail');
                        dispatch([FOCUS_PLACE, {index, latitude, longitude}]);
                      }}
                    />
                  );
                })
              }
            </ScrollView>
          </>
      }
    </>
  );
}

export default SearchForm;
