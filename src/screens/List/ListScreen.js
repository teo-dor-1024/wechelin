import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {SearchBar} from 'react-native-elements';
import {Dimensions, SafeAreaView, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useMyInfo from '../../util/useMyInfo';
import SortedByVisitedDate from './SortedByVisitedDate';

const RIGHT_WIDTH = parseInt((Dimensions.get('window').width * 0.7).toFixed(0), 10);

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
  
  if (error) {
    return (
      <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>기록을 가져올 수 없습니다.</Text>
        <Text>{error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{backgroundColor: '#FFFFFF', height: '100%'}}>
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
        {
          !shouldFetchMore && (loading || networkStatus === 2) ?
            new Array(10).fill(0).map((_, i) => (
              <SkeletonPlaceholder key={_ + i}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  marginVertical: 15,
                }}>
                  <View style={{width: RIGHT_WIDTH}}>
                    <View style={{width: RIGHT_WIDTH - 100, height: 30, borderRadius: 5}}/>
                    <View style={{width: RIGHT_WIDTH - 40, height: 15, marginTop: 5, borderRadius: 5}}/>
                  </View>
                  <View style={{
                    width: 60,
                    height: 25,
                    marginLeft: 10,
                    borderRadius: 5,
                  }}/>
                </View>
              </SkeletonPlaceholder>
            ))
            :
            <SortedByVisitedDate
              data={data.records}
              onPressMoreView={() => setShouldFetchMore(true)}
              shouldFetchMore={shouldFetchMore}
              refetch={refetch}
              reOpenDetail={params?.detail}
            />
        }
      
      </View>
    </SafeAreaView>
  );
}

export default ListScreen;
