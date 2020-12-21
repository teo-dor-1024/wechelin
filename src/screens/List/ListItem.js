import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {convertMoney} from '../../util/StringUtils';

function ListItem({setDetail, ...item}) {
  const {placeName, money, menus, isDutch} = item;
  
  return (
    <TouchableOpacity style={styles.container} onPress={() => setDetail(item)}>
      <View style={styles.inner}>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName} numberOfLines={1}>{placeName}</Text>
          <Text style={styles.placeMenus} numberOfLines={1}>{menus?.join(', ')}</Text>
        </View>
        <View style={styles.moneyContainer}>
          <Text style={{fontWeight: 'bold', fontSize: 16, color: isDutch ? '#d23669' : '#222'}}>
            {convertMoney(isDutch ? money / 2 : money)}원
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#FFF', height: 70, paddingHorizontal: 15},
  inner: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20},
  placeInfo: {width: '60%', marginHorizontal: 15},
  placeName: {fontSize: 16},
  placeMenus: {marginTop: 3, color: '#222', fontSize: 12},
  moneyContainer: {
    alignItems: 'flex-end',
  },
});

export default ListItem;
