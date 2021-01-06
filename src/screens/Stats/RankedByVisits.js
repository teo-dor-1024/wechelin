import React from 'react';
import {Text} from 'react-native-elements';
import gql from 'graphql-tag';
import useMyInfo from '../../util/useMyInfo';
import {useQuery} from '@apollo/react-hooks';
import {View} from 'react-native';

export const RANKING_COUNT = 5;
const GET_RANK = gql`
  query ($userId: String!, $now: Date) {
    recordsByCount(userId: $userId, now: $now) {
      placeName
      count
    }
  }
`;

function RankedByVisits() {
  const {id} = useMyInfo();
  const {loading, error, data} = useQuery(GET_RANK, {variables: {userId: id}});
  
  if (loading) {
    return null;
  }
  
  if (error) {
    return <Text> 통계 정보 가져오다 에러 발생 !! {error.toString()}</Text>;
  }
  
  const {recordsByCount} = data;
  
  if (!recordsByCount.length) {
    return null;
  }
  
  return (
    <>
      <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 20}}>
        방문이 가장 많은 곳을 확인하세요
      </Text>
      {
        recordsByCount
          .slice(0, RANKING_COUNT)
          .map(({placeName, count}, index) => (
            <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{marginRight: 20}}>{index + 1}위</Text>
                <Text>{placeName}</Text>
              </View>
              <Text style={{fontWeight: 'bold'}}>{count}회</Text>
            </View>
          ))
      }
    </>
  );
}

export default RankedByVisits;
