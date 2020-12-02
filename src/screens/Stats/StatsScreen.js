import React, {useEffect, useState} from 'react';
import moment from 'moment';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {ButtonGroup, Divider, Icon, Text} from 'react-native-elements';
import GestureRecognizer from 'react-native-swipe-gestures';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';
import RankedByVisits from './RankedByVisits';
import RankedByScore from './RankedByScore';
import MonthlySpending from "./MonthlySpending";

const viewHeight = Dimensions.get('window').height;

const GET_STATS = gql`
  query Stats($userId: String!, $now: Date, $count: Int) {
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
    monthlySpending(userId: $userId, now: $now, count: $count) {
      label
      spending
    }
  }
`;

export const RANKING_COUNT = 5;

function StatsScreen() {
  const [tab, setTab] = useState(1);
  const [now, setNow] = useState(undefined);
  
  const {id, nickName} = useMyInfo();
  const {loading, error, data} = useQuery(GET_STATS, {variables: {userId: id, now}});
  
  useEffect(() => {
    setNow(!tab ? undefined : moment());
  }, [tab]);
  
  if (loading) {
    return <SafeAreaView><Text> 통계 정보 계산하는 중 ... </Text></SafeAreaView>;
  }
  
  if (error) {
    return <SafeAreaView><Text> 통계 정보 가져오다 에러 발생 !! {error.toString()}</Text></SafeAreaView>;
  }
  
  const isNotThisMonth = moment(now).startOf('month').isBefore(moment().startOf('month'));
  const goToNextMonth = () => tab &&isNotThisMonth && setNow(moment(now).add(1, 'month'));
  const goToPrevMonth = () => tab && setNow(moment(now).subtract(1, 'month'));
  
  const {myLover, spending: {total, dutch}, recordsByScore, recordsByCount, monthlySpending} = data;
  
  return (
    <SafeAreaView>
      <ScrollView style={{height: viewHeight - 130}} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ButtonGroup
            buttons={['전체', '월간']}
            onPress={index => setTab(index)}
            selectedIndex={tab}
          />
          <Text style={styles.title}>{nickName}님의 {tab ? '월간' : '전체'} 리포트</Text>
          {
            !!tab && now && (
              <View style={styles.month}>
                <Icon name='md-arrow-dropleft' type='ionicon' size={30} onPress={goToPrevMonth}/>
                <Text style={{fontSize: 24, marginHorizontal: 15}}>{now.month() + 1}월</Text>
                {
                  isNotThisMonth &&
                  <Icon name='md-arrow-dropright' type='ionicon' size={30} onPress={goToNextMonth}/>
                }
              </View>
            )
          }
        </View>
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
                  <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
                    {tab ? '이번 달 총' : '전체'} 지출 금액은{'\n'}
                    {convertMoney(total)}
                    원입니다.
                  </Text>
                  {
                    myLover && !!tab && (
                      <Text style={{marginTop: 15, fontSize: 16, color: '#6E6E6E'}}>
                        {`더치 금액은 ${convertMoney(dutch)}원입니다.`}
                      </Text>
                    )
                  }
                </View>
                {
                  !tab && (
                    <>
                      <Divider style={styles.divider}/>
                      <MonthlySpending monthlySpending={monthlySpending}/>
                    </>
                  )
                }
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
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    marginVertical: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  month: {
    flexDirection: 'row',
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
