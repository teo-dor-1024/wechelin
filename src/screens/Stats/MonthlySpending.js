import React from 'react';
import {Dimensions, View} from "react-native";
import {Text} from "react-native-elements";
import {calcAvg, convertMoney} from "../../util/StringUtils";
import {BarChart} from "react-native-chart-kit";

const MONTHLY_TREND_COUNT = 4;

function MonthlySpending({monthlySpending}) {
  if (monthlySpending.length < 4) {
    return null;
  }
  
  const trendList = monthlySpending.slice(-(MONTHLY_TREND_COUNT));
  const trendSpending = trendList.map(({spending}) => spending);
  const data = {
    labels: trendList.map(({label}) => `${label}월`),
    datasets: [{data: trendSpending.map(spending => Math.floor(spending / 1000))}],
  };
  
  const prevAvg = calcAvg(trendSpending.slice(0, MONTHLY_TREND_COUNT - 1));
  const targetSpending = trendSpending[MONTHLY_TREND_COUNT - 1];
  const diffPrevAndTarget = targetSpending - prevAvg;
  
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10}}>
        월 평균 {convertMoney(calcAvg(monthlySpending.map(({spending}) => spending)))}원 지출했어요!
      </Text>
      {
        !!diffPrevAndTarget && (
          <Text style={{fontSize: 15, marginLeft: 20}}>
            지난 3달 평균 {convertMoney(prevAvg)}원 보다 {convertMoney(Math.abs(diffPrevAndTarget))}원
            {diffPrevAndTarget > 0 ? ' 더 쓰셨네요.' : ' 아꼈네요.'}
          </Text>
        )
      }
      <View style={{alignItems: 'center', marginTop: 15}}>
        <BarChart
          data={data}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: (opacity = 1) => `rgb(0, 102, 255, 1)`,
            barPercentage: 1,
            decimalPlaces: 1,
          }}
          withInnerLines={false}
          fromZero={true}
        />
      </View>
    </View>
  );
}

export default MonthlySpending;