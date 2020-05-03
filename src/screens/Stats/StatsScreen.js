import React, {useEffect, useState} from 'react';
import moment from 'moment';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Dimensions, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {CheckBox, Divider, Icon, Text} from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import RankedByVisits from './RankedByVisits';
import RankedByScore from './RankedByScore';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';

const GET_STATS = gql`
  query Stats($userId: String!, $now: Date) {
    myLover(userId: $userId) {
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
  
  const goToNextMonth = () => moment(now)
      .startOf('month')
      .isBefore(moment().startOf('month'))
    && setNow(moment(now).add(1, 'month'));
  const goToPrevMonth = () => setNow(moment(now).subtract(1, 'month'));
  
  const {myLover, spending: {total, dutch}, recordsByScore, recordsByCount} = data;
  
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <CheckBox
          right
          containerStyle={styles.totalCheckBox}
          title='전체 통계'
          checked={isTotal}
          onPress={() => setIsTotal(!isTotal)}
        />
        {
          !isTotal && now && (
            <View style={styles.month}>
              <Icon name='md-arrow-dropleft' type='ionicon' size={30} onPress={goToPrevMonth}/>
              <Text style={{fontSize: 24}}>{now.month() + 1}월</Text>
              <Icon name='md-arrow-dropright' type='ionicon' size={30} onPress={goToNextMonth}/>
            </View>
          )
        }
      </View>
      <ScrollView style={{height: height - 200}} showsVerticalScrollIndicator={false}>
        <GestureRecognizer
          onSwipeLeft={goToNextMonth}
          onSwipeRight={goToPrevMonth}
          config={{
            velocityThreshold: 0.5,
            directionalOffsetThreshold: 100,
          }}
        >
          {
            total ?
              <>
                <View style={{marginHorizontal: 20}}>
                  <Text style={{fontSize: 24}}>총 금액: {convertMoney(total)}원</Text>
                  {
                    myLover && !isTotal && (
                      <Text style={styles.dutchPay}>
                        더치페이: {convertMoney(dutch)}원
                      </Text>
                    )
                  }
                </View>
                <Divider style={styles.divider}/>
                <RankedByVisits recordsByCount={recordsByCount}/>
                <Divider style={styles.divider}/>
                <RankedByScore recordsByScore={recordsByScore}/>
              </>
              :
              <Text style={{marginLeft: 20}}>
                통계를 낼 기록이 없습니다.
              </Text>
          }
        </GestureRecognizer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  totalCheckBox: {
    marginLeft: 20,
    backgroundColor: '#F2F2F2',
    borderWidth: 0,
    padding: 0,
    width: 100,
  },
  month: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  dutchPay: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#298A08',
  },
  divider: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
});

export default StatsScreen;
