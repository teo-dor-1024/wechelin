import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, ScrollView, View} from 'react-native';
import {ListItem, SearchBar} from 'react-native-elements';
import IonIcons from 'react-native-vector-icons/Ionicons';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {FETCH_PLACES, FOCUS_PLACE, SLIDE_BOTTOM, SLIDE_MIDDLE} from '../../reducers/RecordReducer';
import {fetchPlacesAroundMe} from '../../util/fetch';
import {convertDistance} from '../../util/StringUtils';
import {containerStyle} from './RecordScreen';

function SearchForm({state: {slidePosition, places, region}, dispatch}) {
  const slidePanel = useRef();
  
  const {height} = Dimensions.get('window');
  const SLIDE_TOP = height - 150;
  
  const [keyword, setKeyword] = useState('');
  const [allowDrag, setAllowDrag] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  
  useEffect(() => {
    slidePanel.current.show(slidePosition);
  }, [slidePosition]);
  
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
    <SlidingUpPanel
      ref={slidePanel}
      draggableRange={{bottom: SLIDE_BOTTOM, top: SLIDE_TOP}}
      snappingPoints={[SLIDE_BOTTOM, SLIDE_MIDDLE, SLIDE_TOP]}
      allowDragging={allowDrag}
    >
      <View style={containerStyle}>
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
              onChangeText={text => setKeyword(text)}
              onBlur={() => setShouldFetch(true)}
            />
            :
            <>
              <ListItem
                title={`"${keyword}"`}
                titleStyle={{fontSize: 22, fontWeight: 'bold'}}
                subtitle={`근처 ${places.length} 개의 검색결과`}
                subtitleStyle={{color: '#424242'}}
                rightIcon={
                  <IonIcons
                    name='ios-close-circle-outline'
                    size={30}
                    color='#848484'
                    onPress={() => setKeyword('')}
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
                  places.map((
                    {id, name, address, distance, category, latitude, longitude},
                    idx,
                  ) => (
                    <ListItem
                      key={id}
                      title={name}
                      titleStyle={{fontWeight: 'bold'}}
                      subtitle={`${address.split(' ').slice(1).join(' ')} · ${convertDistance(distance)}`}
                      bottomDivider={idx !== places.length - 1}
                      onPress={() => dispatch([FOCUS_PLACE, {latitude, longitude}])}
                    />
                  ))
                }
              </ScrollView>
            </>
        }
      </View>
      {/*<Stack.Navigator headerMode='none'>*/}
      {/*  <Stack.Screen*/}
      {/*    name="SearchForm"*/}
      {/*    component={SearchForm}*/}
      {/*    initialParams={{places, setKeyword, setAllowDrag}}*/}
      {/*  />*/}
      {/*  <Stack.Screen*/}
      {/*    name="RecordForm"*/}
      {/*    component={RecordForm}*/}
      {/*    initialParams={{selectedIdx}}*/}
      {/*  />*/}
      {/*</Stack.Navigator>*/}
    </SlidingUpPanel>
  );
}

export default SearchForm;
