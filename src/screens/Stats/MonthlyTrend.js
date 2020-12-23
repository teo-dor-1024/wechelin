import React from 'react';
import {Dimensions, View} from 'react-native';
import {Text} from 'react-native-elements';
import {BarChart} from 'react-native-chart-kit';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {calcAvg, convertMoney} from '../../util/StringUtils';
import useMyInfo from '../../util/useMyInfo';

const MONTHLY_TREND_COUNT = 4;
const GET_MONTHLY_SPENDING = gql`
  query ($userId: String!, $now: Date, $count: Int) {
    monthlySpendingTrend(userId: $userId, now: $now, count: $count) {
      label
      spending
    }
  }
`;

function MonthlyTrend() {
  const {id} = useMyInfo();
  const {loading, error, data} = useQuery(GET_MONTHLY_SPENDING, {
    variables: {
      userId: id, count: MONTHLY_TREND_COUNT,
    },
  });
  
  if (loading) {
    return <Text> 통계 정보 계산하는 중 ... </Text>;
  }
  
  if (error) {
    return <Text> 통계 정보 가져오다 에러 발생 !! {error.toString()}</Text>;
  }
  
  const {monthlySpending} = data;
  
  if (monthlySpending.length < 4) {
    return null;
  }
  
  const trendList = monthlySpending.slice(-(MONTHLY_TREND_COUNT));
  const trendSpending = trendList.map(({spending}) => spending);
  const chartData = {
    labels: trendList.map(({label}) => `${label}월`),
    datasets: [{data: trendSpending.map(spending => Math.floor(spending / 10000))}],
  };
  
  const prevAvg = calcAvg(trendSpending.slice(0, MONTHLY_TREND_COUNT - 1));
  const targetSpending = trendSpending[MONTHLY_TREND_COUNT - 1];
  const diffPrevAndTarget = targetSpending - prevAvg;
  
  return (
    <>
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>
        월 평균 {convertMoney(calcAvg(monthlySpending.map(({spending}) => spending)))}원 지출했어요
      </Text>
      {
        !!diffPrevAndTarget && (
          <Text style={{fontSize: 15}}>
            지난 3달 평균 {convertMoney(prevAvg)}원 보다 {convertMoney(Math.abs(diffPrevAndTarget))}원
            {diffPrevAndTarget > 0 ? ' 더 쓰셨네요' : ' 아꼈네요'}
          </Text>
        )
      }
      <View style={{alignItems: 'center', marginTop: 15}}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 20}
          height={220}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: (opacity = 1) => `rgb(0, 102, 255, ${opacity})`,
            barPercentage: 1,
            decimalPlaces: 0.1,
          }}
          withInnerLines={false}
          fromZero={true}
          yAxisLabel={''}
          yAxisSuffix={'만원'}
        />
      </View>
    </>
  );
}

export default MonthlyTrend;
