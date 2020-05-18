import React from 'react';
import {Dimensions, View} from "react-native";
import {Text} from "react-native-elements";
import {calcAvg, convertMoney} from "../../util/StringUtils";
import {BarChart} from "react-native-chart-kit";
import {MONTHLY_TREND_COUNT} from "./StatsScreen";

function MonthlySpending({monthlySpending, total}) {
  const data = {
    labels: monthlySpending.map(({label}) => `${label}월`),
    datasets: [{data: monthlySpending.map(({spending}) => spending)}],
  };
  
  const prevAvg = calcAvg(data.datasets[0].data.slice(0, MONTHLY_TREND_COUNT - 1));
  const targetSpending = data.datasets[0].data[MONTHLY_TREND_COUNT - 1];
  const diffPrevAndTarget = targetSpending - prevAvg;
  
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10}}>
        월 평균 {convertMoney(calcAvg(data.datasets[0].data))}원 지출했어요!
      </Text>
      <Text style={{fontSize: 15, marginLeft: 20}}>
        지난 3달 평균 {convertMoney(prevAvg)}원 보다 {convertMoney(Math.abs(diffPrevAndTarget))}원 {diffPrevAndTarget > 0 ? '더' : '덜'} 쓰셨네요.
      </Text>
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
          }}
          withInnerLines={false}
          fromZero={true}
        />
      </View>
    </View>
  );
}

export default MonthlySpending;