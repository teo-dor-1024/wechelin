import React from 'react';
import {View} from 'react-native';
import {ListItem, Text} from 'react-native-elements';
import {RANKING_COUNT} from './StatsScreen';

function RankedByVisits({recordsByCount = []}) {
  if (!recordsByCount.length) {
    return null;
  }
  
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10}}>방문 횟수 별 랭킹</Text>
      {
        recordsByCount
          .slice(0, RANKING_COUNT)
          .map(({placeName, count}, index) => (
            <ListItem
              key={placeName}
              containerStyle={{marginLeft: 20, marginRight: 20, marginBottom: 5}}
              title={placeName}
              titleProps={{numberOfLines: 1}}
              leftElement={<Text>{index + 1}위</Text>}
              rightElement={<Text>{count}회</Text>}
            />
          ))
      }
    </View>
  );
}

export default RankedByVisits;
