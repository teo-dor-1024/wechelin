import React, {useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Divider, Icon, SearchBar} from 'react-native-elements';
import BottomSheet from 'reanimated-bottom-sheet';
import {mappingCategory} from '../../util/Category';

const TOP = Dimensions.get('window').height - 250;

function SearchResults({text, setText, places, setPlace, close}) {
  const [isEnter, setIsEnter] = useState(true);
  const [isTop, setIsTop] = useState(true);
  
  const editKeyword = () => {
    setIsEnter(false);
  };
  
  const selectPlace = ({categoryGroup, latitude, longitude, distance, ...rest}) => {
    setPlace({...rest, x: longitude, y: latitude, category: mappingCategory(categoryGroup)});
    close();
  };
  
  return (
    <BottomSheet
      snapPoints={[TOP, 120]}
      enabledContentGestureInteraction={false}
      onOpenEnd={() => setIsTop(true)}
      onCloseEnd={() => setIsTop(false)}
      renderHeader={() => (
        <View style={styles.header}>
          <Icon type='font-awesome-5' name='window-minimize'/>
          {
            isEnter ?
              <>
                <View>
                  <View style={styles.searchDoneBar}>
                    <Icon type='font-awesome-5' name='search' size={25}/>
                    <View style={styles.searchDoneInfo}>
                      <Text style={styles.searchKeyword}>"{text}"</Text>
                      <View style={styles.searchSummary}>
                        <Text>{places.length} 개의 검색결과</Text>
                        {
                          isTop && (
                            <>
                              <Text> · </Text>
                              <TouchableOpacity onPress={editKeyword}>
                                <Text style={styles.editButton}>검색 편집</Text>
                              </TouchableOpacity>
                            </>
                          )
                        }
                      </View>
                    </View>
                  </View>
                </View>
                {
                  isTop ?
                    <Divider style={{width: '100%', marginTop: 20}}/>
                    :
                    <View style={{height: 30}}/>
                }
              </>
              :
              <SearchBar
                platform="ios"
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
                onSubmitEditing={() => setIsEnter(true)}
                onBlur={() => setIsEnter(true)}
              />
          }
        </View>
      )}
      renderContent={() => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.body}
        >
          {
            places.length ?
              places.map(place => {
                const {placeId, placeName, address} = place;
                
                return (
                  <TouchableOpacity key={placeId} style={styles.searchItem} onPress={() => selectPlace(place)}>
                    <Text numberOfLines={1} style={styles.placeName}>{placeName}</Text>
                    <Text numberOfLines={1}>{address}</Text>
                  </TouchableOpacity>
                );
              })
              :
              <View style={styles.manualAdd}>
                <Text style={styles.manualInfo}>카카오맵에 등록된 장소가 없습니다.</Text>
              </View>
          }
        </ScrollView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 10,
  },
  body: {
    backgroundColor: '#FFF',
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchDoneBar: {paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', marginTop: 10},
  searchDoneInfo: {marginLeft: 10},
  searchKeyword: {fontSize: 18, fontWeight: 'bold', marginBottom: 3},
  searchSummary: {flexDirection: 'row'},
  editButton: {color: '#0080FF'},
  manualAdd: {marginTop: 20},
  manualInfo: {fontSize: 16},
  searchItem: {marginBottom: 25, width: '100%'},
  placeName: {fontSize: 16, fontWeight: 'bold'},
});

export default SearchResults;
