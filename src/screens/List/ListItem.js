import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {convertMoney} from '../../util/StringUtils';

const styles = {
  container: {
    backgroundColor: '#FFF',
    height: 70,
    paddingHorizontal: 15,
  },
};

function ListItem({setDetail, ...item}) {
  const {placeName, category, money, menus, isDutch} = item;
  
  return (
    <TouchableOpacity style={styles.container} onPress={() => setDetail(item)}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20}}>
        <View style={{flexDirection: 'row', width: '75%'}}>
          <View style={{marginHorizontal: 15}}>
            <Text style={{fontSize: 16}} numberOfLines={1}>{placeName}</Text>
            <Text style={{marginTop: 3, color: '#222', fontSize: 12}} numberOfLines={1}>{menus?.join(', ')}</Text>
          </View>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={{fontWeight: 'bold', fontSize: 16, color: isDutch ? '#d23669' : '#222'}}>
            {convertMoney(isDutch ? money / 2 : money)}원
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default ListItem;
