import React, {useRef, useState} from 'react';
import {eachMonthOfInterval, getMonth} from 'date-fns';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Badge, Icon, Text} from 'react-native-elements';
import RBSheet from 'react-native-raw-bottom-sheet';
import {PieChart} from 'react-native-chart-kit';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';
import MonthOption from './MonthOption';
import MonthlySpending from './MonthlySpending';
import RankedByVisits from './RankedByVisits';

const PIE_COLORS = ['#ffa7c4', '#6E6E6E', '#A4A4A4', '#D8D8D8', '#F2F2F2'];

const GET_STATS = gql`
  query ($userId: String!, $now: Date) {
    spending(userId: $userId, now: $now) {
      total
      dutch
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
    return <SafeAreaView><Text> 통계 정보 계산하는 중 ... </Text></SafeAreaView>;
  }
  
  if (error) {
    return <SafeAreaView><Text> 통계 정보 가져오다 에러 발생 !! {error.toString()}</Text></SafeAreaView>;
  }
  
  const {spending: {total, settlement}, monthlyPie, recordsByCount} = data;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.monthSelector} onPress={() => monthSelector.current.open()}>
          <Text style={styles.month}>{!now ? '전체' : `${getMonth(now) + 1}월`} 소비</Text>
          <Icon name='ios-arrow-down' type='ionicon' size={20}/>
        </TouchableOpacity>
        
        <View style={styles.boxContainer}>
          <Text style={styles.spending}>{convertMoney(total)}원</Text>
          {
            now && (
              <Text style={styles.settlement}>
                {
                  settlement > 0 ?
                    `정산 : ${convertMoney(Math.abs(settlement))}원 받으세요`
                    :
                    settlement < 0 ?
                      `정산: ${convertMoney(Math.abs(settlement))}원 보내세요`
                      :
                      '정산할 금액이 없습니다.'
                }
              </Text>
            )
          }
        </View>
        
        {
          !now && (
            <>
              <View style={styles.divider}/>
              <View style={styles.boxContainer}>
                <MonthlySpending/>
              </View>
            </>
          )
        }
        
        <View style={styles.divider}/>
        <View style={styles.boxContainer}>
          <Text style={styles.boxTitle}>지출이 가장 많은 곳을 확인하세요</Text>
          <View style={styles.boxInner}>
            {
              monthlyPie?.length ?
                <PieChart
                  data={monthlyPie.map(({category, spending}, index) => {
                    return {name: category, population: spending, color: PIE_COLORS[index]};
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
                :
                <Text style={{marginTop: 20}}>기록된 내역이 없어요</Text>
            }
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
      </ScrollView>
      
      <RBSheet
        ref={monthSelector}
        closeOnDragDown={false}
        height={Dimensions.get('window').height - 300}
        customStyles={{container: styles.modalContainer}}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>월 선택하기</Text>
          <Icon
            type='ionicon' name='ios-close' color='#A4A4A4' size={30}
            onPress={() => monthSelector.current.close()}
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {
            MONTH_OPTIONS.map(date => (
              <MonthOption key={date} date={date} now={now} setNow={setNow}/>
            ))
          }
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#FFFFFF', height: '100%', paddingBottom: 80},
  divider: {backgroundColor: '#F2F2F2', width: '100%', height: 15, marginVertical: 20},
  boxContainer: {paddingHorizontal: 20},
  boxTitle: {fontSize: 16, fontWeight: 'bold'},
  boxInner: {alignItems: 'center', marginVertical: 10, height: 250},
  monthSelector: {padding: 20, flexDirection: 'row', alignItems: 'center'},
  month: {fontSize: 20, fontWeight: 'bold', marginRight: 10},
  spending: {fontSize: 22, fontWeight: 'bold', marginBottom: 10},
  settlement: {fontSize: 16, color: '#d23669'},
  monthlyPie: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10},
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  modalHeader: {
    marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold'},
});

export default StatsScreen;
