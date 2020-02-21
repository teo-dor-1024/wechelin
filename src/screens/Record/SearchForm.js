import React, {useContext, useEffect, useState} from 'react';
import {RecordContext} from './RecordScreen';
import {ListItem, SearchBar} from 'react-native-elements';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native';
import {convertDistance} from '../../util/StringUtils';
import {fetchPlacesAroundMe} from '../../util/fetch';
import {CLEAR_SEARCH_LIST, FETCH_PLACES, FOCUS_PLACE, WRITE_KEYWORD} from '../../reducers/RecordReducer';

function SearchForm({setAllowDrag, setTab}) {
  const {state: {region, keyword, places}, dispatch} = useContext(RecordContext);
  
  const [shouldFetch, setShouldFetch] = useState(false);
  
  useEffect(() => {
    if (!shouldFetch) {
      return;
    }
    
    const fetchPlaces = async (keyword, region) => {
      const fetchResult = keyword ?
        await fetchPlacesAroundMe(keyword, region)
        :
        [];
      
      dispatch([FETCH_PLACES, fetchResult]);
      setShouldFetch(false);
    };
    
    fetchPlaces(keyword, region);
  }, [shouldFetch, keyword, region]);
  
  return (
    <>
      {
        !places.length ?
          <SearchBar
            platform='ios'
            placeholder='장소 또는 주소 검색'
            cancelButtonTitle='취소'
            showCancel={false}
            containerStyle={{backgroundColor: '#FFFFFF', borderRadius: 20, paddingRight: 5, paddingTop: 25}}
            inputContainerStyle={{backgroundColor: '#F2F2F2', height: 10}}
            inputStyle={{fontSize: 15}}
            cancelButtonProps={{buttonTextStyle: {fontSize: 15, paddingTop: 20}}}
            value={keyword}
            onChangeText={text => dispatch([WRITE_KEYWORD, text])}
            onSubmitEditing={() => setShouldFetch(true)}
          />
          :
          <>
            <ListItem
              title={`"${keyword}"`}
              titleStyle={{fontSize: 22, fontWeight: 'bold'}}
              subtitle={`근처 ${places.length} 개의 검색결과`}
              subtitleStyle={{color: '#424242'}}
              onPress={({nativeEvent}) => nativeEvent.stopImmediatePropagation()}
              rightIcon={
                <IonIcons
                  name='ios-close-circle-outline'
                  size={30}
                  color='#848484'
                  onPress={() => dispatch([CLEAR_SEARCH_LIST])}
                />
              }
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
