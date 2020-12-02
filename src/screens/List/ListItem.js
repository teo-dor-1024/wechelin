import React from 'react';
import {Text, View} from 'react-native';
import moment from 'moment';
import {convertMoney} from '../../util/StringUtils';

const styles = {
  container: {
    backgroundColor: '#FFF',
    borderTopColor: '#D8D8D8',
    borderTopWidth: 0.4,
    height: 80,
    paddingHorizontal: 15,
  },
};

function ListItem({visitedDate, placeName, category, money, isDutch}) {
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20}}>
        <View style={{flexDirection: 'row', width: '65%'}}>
          <Text style={{color: '#848484', fontSize: 13}}>{moment(visitedDate).format('MM.DD')}</Text>
          <View style={{marginHorizontal: 15}}>
            <Text style={{fontSize: 16}} numberOfLines={1}>{placeName}</Text>
            <Text style={{marginTop: 3, color: '#2E64FE', fontSize: 12}} numberOfLines={1}>{category}</Text>
          </View>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={{fontWeight: 'bold', fontSize: 16}}>{convertMoney(money)}원</Text>
          {
            isDutch && (
              <Text style={{fontWeight: 'bold', fontSize: 14, color: '#DF7401'}}>{convertMoney(money / 2)}원</Text>
            )
          }
        </View>
      </View>
    </View>
  );
}

export default ListItem;
