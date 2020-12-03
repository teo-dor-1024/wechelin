import React, {useRef, useState} from 'react';
import {getMonth} from 'date-fns';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Dimensions, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Badge, Icon, Text} from 'react-native-elements';
import RBSheet from 'react-native-raw-bottom-sheet';
import {PieChart} from 'react-native-chart-kit';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';

const PIE_COLORS = ['#ffa7c4', '#6E6E6E', '#A4A4A4', '#D8D8D8', '#F2F2F2'];

const GET_STATS = gql`
  query Stats($userId: String!, $now: Date, $count: Int) {
    spending(userId: $userId, now: $now) {
      total
      dutch
      settlement
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
    monthlyPie(userId: $userId, now: $now) {
      category
      count
      spending
    }
  }
`;

export const RANKING_COUNT = 5;

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
  
  const {spending: {total, settlement}, monthlyPie, recordsByScore, recordsByCount, monthlySpending} = data;
  
  return (
    <SafeAreaView style={{backgroundColor: '#FFFFFF', height: '100%'}}>
      <ScrollView style={{paddingBottom: 80}} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={{padding: 20, flexDirection: 'row', alignItems: 'center'}}
          onPress={() => monthSelector.current.open()}
        >
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>{getMonth(now) + 1}월 소비</Text>
          <Icon name='ios-arrow-down' type='ionicon' size={20} containerStyle={{marginLeft: 10}}/>
        </TouchableOpacity>
        
        <View style={{paddingHorizontal: 20}}>
          <Text style={{fontSize: 22, fontWeight: 'bold'}}>{convertMoney(total)}원</Text>
          <View style={{marginTop: 10}}>
            {
              settlement > 0 ?
                <Text style={{fontSize: 16, color: '#d23669'}}>
                  {convertMoney(Math.abs(settlement))}원 받으세요
                </Text>
                :
                settlement < 0 ?
                  <Text style={{fontSize: 16, color: '#d23669'}}>
                    {convertMoney(Math.abs(settlement))}원 보내세요
                  </Text>
                  :
                  <Text style={{fontSize: 16}}>정산할 금액이 없습니다.</Text>
            }
          </View>
        </View>
        
        <View style={{backgroundColor: '#F2F2F2', width: '100%', height: 15, marginVertical: 20}}/>
        
        <View style={{paddingHorizontal: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>지출이 가장 많은 곳을 확인하세요</Text>
          <View style={{alignItems: 'center', marginVertical: 10}}>
            <PieChart
              data={monthlyPie.map(({category, spending}, index) => {
                return {name: category, population: spending, color: PIE_COLORS[index]};
              })}
              width={300}
              height={220}
              chartConfig={{
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{padding: 0, marginRight: -115}}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={false}
              absolute
            />
          </View>
          <View>
            {
              monthlyPie.map(({category, spending, count}, index) => (
                <View key={category} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Badge badgeStyle={{backgroundColor: PIE_COLORS[index], marginRight: 10}}/>
                    <Text>{category}</Text>
                  </View>
                  <Text>{convertMoney(spending)}원</Text>
                </View>
              ))
            }
          </View>
        </View>
        
        <View style={{backgroundColor: '#F2F2F2', width: '100%', height: 15, marginVertical: 20}}/>
      </ScrollView>
      
      <RBSheet
        ref={monthSelector}
        closeOnDragDown={false}
        height={Dimensions.get('window').height - 300}
        customStyles={{container: {borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20}}}
      >
        <View style={{marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>월 선택하기</Text>
          <Icon type='ionicon' name='ios-close' color='#A4A4A4' size={30} onPress={() => monthSelector.current.close()}/>
        </View>
        <ScrollView>
        
        </ScrollView>
      </RBSheet>
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
