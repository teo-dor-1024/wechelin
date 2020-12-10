import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {SearchBar} from 'react-native-elements';
import {SafeAreaView, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import useMyInfo from '../../util/useMyInfo';
import SortedByVisitedDate from './SortedByVisitedDate';

const GET_RECORDS = gql`
  query ($userId: String!, $keyword: String, $cursor: Int) {
    records(userId: $userId, keyword: $keyword, cursor: $cursor) {
      records {
        _id
        userId
        placeId
        placeName
        category
        url
        address
        visitedDate
        menus
        money
        score
        isDutch
        x
        y
      }
      cursor
      hasMore
    }
  }
`;

function ListScreen() {
  const {params} = useRoute();
  const reload = params ? params.reload : null;
  
  const {id: userId} = useMyInfo();
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [keywordFetch, setKeywordFetch] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const {
    loading, error, data, fetchMore, refetch, networkStatus,
  } = useQuery(GET_RECORDS, {variables: {userId}});
  
  
  useEffect(() => {
    if (reload) {
      data && refetch();
      params.detail = null;
      params.reload = false;
    }
  }, [reload]);
  
  useEffect(() => {
    if (!shouldFetchMore || !data) {
      return;
    }
    
    const {records: {cursor, hasMore}} = data;
    hasMore ?
      fetchMore({
        variables: {cursor, keyword},
        updateQuery(prev, {fetchMoreResult}) {
          setShouldFetchMore(false);
          return fetchMoreResult ? fetchMoreResult : prev;
        },
      })
      :
      setShouldFetchMore(false);
  }, [shouldFetchMore]);
  
  useEffect(() => {
    if (!keywordFetch) {
      return;
    }
    
    refetch({userId, keyword});
    setKeywordFetch(false);
  }, [keywordFetch]);
  
  return (
    <SafeAreaView style={{backgroundColor: '#FFFFFF', height: '100%'}}>
      {
        !shouldFetchMore && (loading || networkStatus === 2) ?
          <Text style={{padding: 20}}> 기록 가져오는 중 ...</Text>
          :
          error ?
            <Text style={{padding: 20}}> 기록 찾다가 에러 발생!! {error.toString()}</Text>
            :
            <>
              <SearchBar
                platform="ios"
                containerStyle={{backgroundColor: '#FFFFFF', paddingHorizontal: 10}}
                inputContainerStyle={{backgroundColor: '#F2F2F2'}}
                inputStyle={{fontSize: 16}}
                leftIconContainerStyle={{marginRight: 5}}
                cancelButtonTitle='취소'
                cancelButtonProps={{
                  buttonStyle: {marginRight: 10},
                  buttonTextStyle: {fontSize: 16},
                }}
                placeholder="검색"
                value={keyword}
                onChangeText={keyword => setKeyword(keyword)}
                onSubmitEditing={() => setKeywordFetch(true)}
              />
              <View style={{height: 700, paddingBottom: 80}}>
                <SortedByVisitedDate
                  data={data.records}
                  onPressMoreView={() => setShouldFetchMore(true)}
                  shouldFetchMore={shouldFetchMore}
                  refetch={refetch}
                  reOpenDetail={params?.detail}
                />
              </View>
            </>
      }
    </SafeAreaView>
  );
}

export default ListScreen;
