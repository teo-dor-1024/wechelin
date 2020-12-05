import React, {useRef} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Icon, SearchBar} from 'react-native-elements';
import BottomSheet from 'reanimated-bottom-sheet';

const TOP = Dimensions.get('window').height - 250;

function SearchResults({placeName, text, setText, places, setUrl}) {
  const sheetRef = useRef(null);
  
  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={[TOP, 120]}
      enabledContentGestureInteraction={false}
      renderHeader={() => (
        <View style={styles.header}>
          <Icon type='font-awesome-5' name='window-minimize'/>
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
            onFocus={() => sheetRef.current.snapTo(TOP)}
          />
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
                const {id, name, address, url} = place;
                
                return (
                  <View key={id} style={styles.searchItem}>
                    <View>
                      <TouchableOpacity onPress={() => setUrl(url)}>
                        <Text numberOfLines={1} style={styles.placeName}>{name}</Text>
                      </TouchableOpacity>
                      <Text numberOfLines={1}>{address}</Text>
                    </View>
                    {
                      placeName === name && (
                        <Icon type='ionicon' name='ios-checkmark' size={40} color='#d23669'/>
                      )
                    }
                  </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
  },
  body: {
    backgroundColor: '#FFF',
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  manualAdd: {marginTop: 20},
  manualInfo: {fontSize: 16},
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  placeName: {fontSize: 16, fontWeight: 'bold'},
});

export default SearchResults;
