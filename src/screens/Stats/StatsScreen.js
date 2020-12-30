import React, {useRef, useState} from 'react';
import {eachMonthOfInterval, getMonth} from 'date-fns';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Badge, Icon, Text} from 'react-native-elements';
import {PieChart} from 'react-native-chart-kit';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';
import MonthOption from './MonthOption';
import MonthlyTrend from './MonthlyTrend';
import RankedByVisits from './RankedByVisits';
import BottomSelect from '../components/BottomSelect';

const PIE_COLORS = ['#ff5c92', '#ff8ab0', '#ffbdd3', '#ffe0ea', '#fff0f5'];

const GET_STATS = gql`
  query ($userId: String!, $now: Date) {
    spending(userId: $userId, now: $now) {
      total
      dating
      settlement
    }
    monthlyPie(userId: $userId, now: $now) {
      category
      count
      spending
    }
  }
`;

const MONTH_OPTIONS = [null].concat(eachMonthOfInterval({
  start: new Date(2019, 9, 1),
  end: new Date(),
}).reverse());

function StatsScreen() {
  const [now, setNow] = useState(new Date());
  const monthSelector = useRef();
  
  const {id} = useMyInfo();
  const {loading, error, data} = useQuery(GET_STATS, {variables: {userId: id, now}});
  
  if (loading) {
    return (
      <SafeAreaView style={{backgroundColor: '#FFF', height: '100%'}}>
        <SkeletonPlaceholder>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonMonthSelector}/>
            <View style={styles.skeletonSpending}/>
            <View style={styles.skeletonSpending}/>
            <View style={styles.skeletonSettlement}/>
            <View style={styles.skeletonDivider}/>
            <View style={styles.skeletonMonthlyPieTitle}/>
            <View style={styles.monthlyPieContainer}>
              <View style={styles.skeletonMonthlyPie}/>
            </View>
            {
              new Array(5).fill(0).map((_, i) => (
                <View style={styles.skeletonListItem} key={_ + i}>
                  <View style={styles.skeletonListCategory}/>
                  <View style={styles.skeletonListMoney}/>
                </View>
              ))
            }
          </View>
        </SkeletonPlaceholder>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.boxContainer}>
          <Text>통계 정보를 가져올 수 없습니다.</Text>
          <Text>{error.toString()}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const {spending: {total, dating, settlement}, monthlyPie, recordsByCount} = data;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.monthSelector} onPress={() => monthSelector.current.open()}>
          <Text style={styles.month}>{!now ? '전체' : `${getMonth(now) + 1}월`} 소비</Text>
          <Icon name='ios-arrow-down' type='ionicon' size={20}/>
        </TouchableOpacity>
        
        {
          !total ?
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../../assets/analytics.png')}
                style={{width: '100%', height: '100%', resizeMode:'contain'}}
              />
              <Text style={styles.emptyText}>통계를 낼 기록이 없습니다.</Text>
            </View>
            :
            <>
              <View style={styles.boxContainer}>
                <Text style={styles.spendingLabel}>개인 소비</Text>
                <Text style={styles.spending}>{convertMoney(total)}원</Text>
                {
                
                }
                <View style={styles.dating}>
                  <View>
                    <Text style={styles.spendingLabel}>데이트 총 소비</Text>
                    <Text style={styles.spending}>{convertMoney(dating)}원</Text>
                  </View>
                  {
                    now && !!settlement && (
                      <Text style={styles.settlement}>
                        {
                          settlement > 0 ?
                            `${convertMoney(Math.abs(settlement))}원 받으세요`
                            :
                            `${convertMoney(Math.abs(settlement))}원 보내세요`
                        }
                      </Text>
                    )
                  }
                </View>
              </View>
              
              {
                !now && (
                  <>
                    <View style={styles.divider}/>
                    <View style={styles.boxContainer}>
                      <MonthlyTrend/>
                    </View>
                  </>
                )
              }
              
              {
                !!monthlyPie?.length && (
                  <>
                    <View style={styles.divider}/>
                    <View style={styles.boxContainer}>
                      <Text style={styles.boxTitle}>지출이 가장 많은 곳을 확인하세요</Text>
                      <View style={styles.boxInner}>
                        <PieChart
                          data={monthlyPie.map(({category, spending}, index) => {
                            return {
                              name: category,
                              population: spending,
                              color: PIE_COLORS[index],
                            };
                          })}
                          width={300}
                          height={220}
                          chartConfig={{decimalPlaces: 0, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`}}
                          style={{padding: 0, marginRight: -115}}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="15"
                          hasLegend={false}
                          absolute
                        />
                      </View>
                      {
                        monthlyPie.map(({category, spending, count}, index) => (
                          <View key={category} style={styles.monthlyPie}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Badge badgeStyle={{backgroundColor: PIE_COLORS[index], marginRight: 10}}/>
                              <Text>{category}</Text>
                            </View>
                            <Text>{convertMoney(spending)}원</Text>
                          </View>
                        ))
                      }
                    </View>
                  </>
                )
              }
              
              {
                !now && (
                  <>
                    <View style={styles.divider}/>
                    <View style={styles.boxContainer}>
                      <RankedByVisits recordsByCount={recordsByCount}/>
                    </View>
                  </>
                )
              }
            </>
        }
      </ScrollView>
      
      <BottomSelect slide={monthSelector} title='월 선택하기'>
        {
          MONTH_OPTIONS.map(date => (
            <MonthOption key={date} date={date} now={now} setNow={setNow}/>
          ))
        }
      </BottomSelect>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {paddingHorizontal: 20},
  skeletonMonthSelector: {width: 100, height: 35, marginVertical: 10, borderRadius: 10},
  skeletonSpending: {width: 130, height: 40, marginBottom: 10, borderRadius: 10},
  skeletonSettlement: {width: 200, height: 20, borderRadius: 10},
  skeletonDivider: {height: 15, marginVertical: 20, borderRadius: 10},
  skeletonMonthlyPieTitle: {width: 220, height: 20, marginBottom: 10, borderRadius: 10},
  monthlyPieContainer: {justifyContent: 'center', alignItems: 'center'},
  skeletonMonthlyPie: {width: 190, height: 190, borderRadius: 100, marginVertical: 10},
  skeletonListItem: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 10},
  skeletonListCategory: {width: 160, height: 20, borderRadius: 5},
  skeletonListMoney: {width: 40, height: 20, borderRadius: 5},
  container: {backgroundColor: '#FFF', height: '100%', paddingBottom: 80},
  divider: {backgroundColor: '#F2F2F2', width: '100%', height: 15, marginVertical: 20},
  boxContainer: {paddingHorizontal: 20},
  boxTitle: {fontSize: 16, fontWeight: 'bold'},
  boxInner: {alignItems: 'center', marginVertical: 10, height: 250},
  monthSelector: {padding: 20, flexDirection: 'row', alignItems: 'center'},
  month: {fontSize: 20, fontWeight: 'bold', marginRight: 10},
  emptyContainer: {marginTop: 200, height: 120, alignItems: 'center'},
  emptyText: {fontWeight: 'bold', fontSize: 18, color: '#d23669', marginTop: 10},
  spendingLabel: {color: '#848484'},
  spending: {fontSize: 22, fontWeight: 'bold', marginBottom: 10},
  dating: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
  settlement: {marginLeft: 10, fontSize: 18, color: '#d23669', marginBottom: 13},
  monthlyPie: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10},
});

export default StatsScreen;
