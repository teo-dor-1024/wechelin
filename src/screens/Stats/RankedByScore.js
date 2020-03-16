import React from 'react';
import {View} from 'react-native';
import {Icon, ListItem, Text} from 'react-native-elements';
import {RANKING_COUNT} from './StatsScreen';

function RankedByScore({recordsByScore = []}) {
  if (!recordsByScore.length) {
    return null;
  }
  
  const scoredRecords = recordsByScore.filter(({score}) => score > 0);
  if (!scoredRecords.length) {
    return null;
  }
  
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10}}>평점 별 랭킹</Text>
      {
        scoredRecords
          .slice(0, RANKING_COUNT)
          .map(({placeName, score}, index) => (
            <ListItem
              key={placeName}
              containerStyle={{marginLeft: 20, marginRight: 20, marginBottom: 5}}
              title={placeName}
              leftElement={<Text>{index + 1}위</Text>}
              rightElement={
                <View style={{flexDirection: 'row'}}>
                  <Icon name='star' type='antdesign' color='#FACC2E' containerStyle={{marginRight: 5}}/>
                  <Text><Text style={{fontWeight: 'bold', color: '#FACC2E', fontSize: 20}}>{score}</Text> / 5</Text>
                </View>
              }
            />
          ))
      }
    </View>
  );
}

export default RankedByScore;
