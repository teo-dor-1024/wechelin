import React from 'react';
import {ListItem, Text} from 'react-native-elements';
import gql from 'graphql-tag';
import useMyInfo from '../../util/useMyInfo';
import {useQuery} from '@apollo/react-hooks';

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
    return <Text> 통계 정보 계산하는 중 ... </Text>;
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
      <Text style={{fontSize: 16, fontWeight: 'bold'}}>
        방문이 가장 많은 곳을 확인하세요
      </Text>
      {
        recordsByCount
          .slice(0, RANKING_COUNT)
          .map(({placeName, count}, index) => (
            <ListItem
              key={placeName}
              title={placeName}
              titleProps={{numberOfLines: 1}}
              leftElement={<Text>{index + 1}위</Text>}
              rightElement={<Text>{count}회</Text>}
            />
          ))
      }
    </>
  );
}

export default RankedByVisits;
