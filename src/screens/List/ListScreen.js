import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {CheckBox, SearchBar} from 'react-native-elements';
import {Dimensions, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useMyInfo from '../../util/useMyInfo';
import SortedByVisitedDate from './SortedByVisitedDate';

const RIGHT_WIDTH = parseInt((Dimensions.get('window').width * 0.7).toFixed(0), 10);

const GET_RECORDS = gql`
  query ($userId: String!, $keyword: String, $cursor: Int, $isMoreFive: Boolean) {
    records(userId: $userId, keyword: $keyword, cursor: $cursor, isMoreFive: $isMoreFive) {
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
  
  const [isMoreFive, setIsMoreFive] = useState(false);
  
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
  
  // 더보기로 추가 fetch
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
  
  // 검색어 입력 시 다시 fetch
  useEffect(() => {
    if (!keywordFetch) {
      return;
    }
    
    refetch({userId, keyword});
    setKeywordFetch(false);
  }, [keywordFetch]);
  
  useEffect(() => {
    if (networkStatus === 1) {
      return;
    }
    
    refetch({userId, keyword, isMoreFive});
  }, [isMoreFive]);
  
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text>기록을 가져올 수 없습니다.</Text>
        <Text>{error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        platform="ios"
        containerStyle={{backgroundColor: '#FFFFFF', paddingHorizontal: 10}}
        inputContainerStyle={{backgroundColor: '#F2F2F2'}}
        inputStyle={{fontSize: 16}}
        leftIconContainerStyle={{marginRight: 5}}
        cancelButtonTitle='취소'
        cancelButtonProps={{buttonStyle: {marginRight: 10}, buttonTextStyle: {fontSize: 16}}}
        placeholder="검색"
        value={keyword}
        onChangeText={keyword => setKeyword(keyword)}
        onSubmitEditing={() => setKeywordFetch(true)}
        disabled={!shouldFetchMore && (loading || networkStatus === 2)}
      />
      <View style={styles.inner}>
        {
          !shouldFetchMore && (loading || networkStatus === 2) ?
            new Array(5).fill(0).map((_, i) => (
              <SkeletonPlaceholder key={_ + i}>
                <View style={styles.skeletonContainer}>
                  <View>
                    <View style={styles.skeletonPlaceName}/>
                    <View style={styles.skeletonMenus}/>
                  </View>
                  <View style={styles.skeletonMoney}/>
                </View>
              </SkeletonPlaceholder>
            ))
            :
            <>
              <View style={styles.searchCondition}>
                <CheckBox
                  checked={isMoreFive}
                  onPress={() => setIsMoreFive(!isMoreFive)}
                  title='5만원 이상'
                  containerStyle={{backgroundColor: '#FFF', borderWidth: 0, padding: 0, margin: 0}}
                  checkedColor='#d23669'
                />
              </View>
              <SortedByVisitedDate
                data={data?.records}
                onPressMoreView={() => setShouldFetchMore(true)}
                shouldFetchMore={shouldFetchMore}
                refetch={refetch}
                reOpenDetail={params?.detail}
              />
            </>
        }
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {backgroundColor: '#FFFFFF', height: '100%'},
  errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  inner: {height: 700, paddingBottom: 80},
  searchCondition: {alignItems: 'flex-end'},
  skeletonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  skeletonPlaceName: {width: RIGHT_WIDTH - 100, height: 30, borderRadius: 5},
  skeletonMenus: {width: RIGHT_WIDTH - 40, height: 15, marginTop: 5, borderRadius: 5},
  skeletonMoney: {
    width: 60,
    height: 25,
    marginLeft: 10,
    borderRadius: 5,
  },
});

export default ListScreen;
