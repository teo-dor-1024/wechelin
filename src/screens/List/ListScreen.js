import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {SearchBar} from 'react-native-elements';
import {SafeAreaView, Text, View} from 'react-native';
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

const DELETE_RECORD = gql`
  mutation ($_id: ID!) {
    deleteRecord(_id: $_id)
  }
`;

function ListScreen({route: {params}}) {
  const reload = params ? params.reload : null;
  const navigation = useNavigation();
  
  const {id: userId} = useMyInfo();
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [keywordFetch, setKeywordFetch] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [deletingId, setDeletingId] = useState('');
  
  const {
    loading, error, data, fetchMore, refetch,
  } = useQuery(GET_RECORDS, {variables: {userId}});
  const [deleteRecord] = useMutation(DELETE_RECORD);
  
  useEffect(() => {
    data && reload && refetch();
  }, [reload]);
  
  useEffect(() => {
    if (!shouldFetchMore || !data) {
      return;
    }
    
    const {records: {cursor, hasMore}} = data;
    shouldFetchMore && hasMore && fetchMore({
      variables: {cursor, keyword},
      updateQuery(prev, {fetchMoreResult}) {
        return fetchMoreResult ? fetchMoreResult : prev;
      },
    });
    
    setShouldFetchMore(false);
  }, [shouldFetchMore]);
  
  useEffect(() => {
    if (!keywordFetch) {
      return;
    }
    
    refetch({userId, keyword});
    setKeywordFetch(false);
  }, [keywordFetch]);
  
  useEffect(() => {
    const doDelete = async () => {
      const result = await deleteRecord({variables: {_id: deletingId}});
      result ? refetch() : alert('삭제에 실패했습니다.');
    };
    deletingId && doDelete();
    
    setDeletingId('');
  }, [deletingId]);
  
  if (loading) {
    return (
      <SafeAreaView>
        <Text> 기록 가져오는 중 ...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView>
        <Text> 기록 찾다가 에러 발생!! {error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  const {records: {records, hasMore}} = data;
  
  let recordsResult = records.map(({_id, ...rest}) => ({...rest, key: _id}));
  
  return (
    <SafeAreaView style={{backgroundColor: '#FFFFFF'}}>
      <SearchBar
        platform='ios'
        containerStyle={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 10,
          paddingBottom: 10,
          paddingTop: 0,
        }}
        inputContainerStyle={{backgroundColor: '#E6E6E6'}}
        placeholder='검색'
        value={keyword}
        onChangeText={keyword => setKeyword(keyword)}
        onSubmitEditing={() => setKeywordFetch(true)}
        onClear={() => setKeywordFetch(true)}
        cancelButtonTitle='취소'
        cancelButtonProps={{buttonStyle: {marginRight: 10, height: 45}}}
      />
      <View style={{height: 700, paddingHorizontal: 20, paddingBottom: 70}}>
        <SortedByVisitedDate
          hasMore={hasMore}
          records={recordsResult}
          onPressMoreView={() => setShouldFetchMore(true)}
          onPressModify={modify => navigation.navigate('Record', {modify})}
          onPressDelete={key => setDeletingId(key)}
        />
      </View>
    </SafeAreaView>
  );
}

export default ListScreen;
