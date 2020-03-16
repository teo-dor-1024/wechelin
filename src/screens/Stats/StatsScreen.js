import React, {useEffect, useState} from 'react';
import moment from 'moment';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Dimensions, SafeAreaView, ScrollView, View} from 'react-native';
import {CheckBox, Divider, Icon, Text} from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import RankedByVisits from './RankedByVisits';
import RankedByScore from './RankedByScore';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';

const GET_STATS = gql`
  query Stats($userId: String!, $now: Date) {
    myLover(myId: $userId) {
      nickname
    }
    spending(userId: $userId, now: $now) {
      total
      dutch
    }
    recordsByScore(userId: $userId, now: $now) {
      placeName
      score
    }
    recordsByCount(userId: $userId, now: $now) {
      placeName
      count
    }
  }
`;

export const RANKING_COUNT = 5;

function StatsScreen() {
  const {height} = Dimensions.get('window');
  const [isTotal, setIsTotal] = useState(false);
  const [now, setNow] = useState(null);
  
  const {id} = useMyInfo();
  const {loading, error, data} = useQuery(GET_STATS, {variables: {userId: id, now}});
  
  useEffect(() => {
    setNow(isTotal ? null : moment());
  }, [isTotal]);
  
  if (loading) {
    return <SafeAreaView><Text> 통계 정보 계산하는 중 ... </Text></SafeAreaView>;
  }
  
  if (error) {
    return <SafeAreaView><Text> 통계 정보 가져오다 에러 발생 !! {error.toString()}</Text></SafeAreaView>;
  }
  
  const {myLover, spending: {total, dutch}, recordsByScore, recordsByCount} = data;
  
  return (
    <SafeAreaView>
      <GestureRecognizer
        onSwipeLeft={() => moment(now).month() < moment().month() && setNow(moment(now).add(1, 'month'))}
        onSwipeRight={() => setNow(moment(now).subtract(1, 'month'))}
        config={{
          velocityThreshold: 0.3,
          directionalOffsetThreshold: 80,
        }}
      >
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <CheckBox
            right
            containerStyle={{
              marginLeft: 20, backgroundColor: '#F2F2F2', borderWidth: 0, padding: 0, width: 100,
            }}
            title='전체 통계'
            checked={isTotal}
            onPress={() => setIsTotal(!isTotal)}
          />
          {
            !isTotal && now && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginRight: 20,
                width: 80,
              }}>
                <Icon name='md-arrow-dropleft' type='ionicon' size={30}
                      onPress={() => setNow(moment(now).subtract(1, 'month'))}/>
                <Text style={{fontSize: 24}}>{now.month() + 1}월</Text>
                <Icon name='md-arrow-dropright' type='ionicon' size={30}
                      onPress={() => moment(now).month() < moment().month() && setNow(moment(now).add(1, 'month'))}/>
              </View>
            )
          }
        </View>
      </GestureRecognizer>
      <ScrollView style={{height: height - 170}}>
        <View style={{marginHorizontal: 20}}>
          <Text style={{fontSize: 24}}>총 금액: {convertMoney(total)}원</Text>
          {
            myLover && !isTotal && (
              <Text style={{fontSize: 20, fontWeight: 'bold', marginTop: 5, color: '#298A08'}}>
                더치페이: {convertMoney(dutch)}원
              </Text>
            )
          }
        </View>
        <Divider style={{marginHorizontal: 20, marginVertical: 20}}/>
        <RankedByVisits recordsByCount={recordsByCount}/>
        <Divider style={{marginHorizontal: 20, marginVertical: 20}}/>
        <RankedByScore recordsByScore={recordsByScore}/>
      </ScrollView>
    </SafeAreaView>
  );
}

export default StatsScreen;
