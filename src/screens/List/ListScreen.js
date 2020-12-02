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
    loading, error, data, fetchMore, refetch, networkStatus,
  } = useQuery(GET_RECORDS, {variables: {userId}});
  const [deleteRecord] = useMutation(DELETE_RECORD);
  
  useEffect(() => {
    if (reload) {
      data && refetch();
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
  
  useEffect(() => {
    const doDelete = async () => {
      const result = await deleteRecord({variables: {_id: deletingId}});
      result ? refetch() : alert('삭제에 실패했습니다.');
    };
    deletingId && doDelete();
    
    setDeletingId('');
  }, [deletingId]);
  
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
                containerStyle={{backgroundColor: '#FFFFFF'}}
                inputContainerStyle={{backgroundColor: '#FFFFFF'}}
                inputStyle={{fontSize: 14}}
                leftIconContainerStyle={{marginRight: 10}}
                cancelButtonTitle='취소'
                cancelButtonProps={{
                  buttonStyle: {marginRight: 10},
                  buttonTextStyle: {color: '#000000', fontSize: 15},
                }}
                value={keyword}
                onChangeText={keyword => setKeyword(keyword)}
                onSubmitEditing={() => setKeywordFetch(true)}
              />
              <View style={{height: 700, paddingBottom: 70}}>
                <SortedByVisitedDate
                  data={data.records}
                  onPressMoreView={() => setShouldFetchMore(true)}
                  shouldFetchMore={shouldFetchMore}
                  onPressModify={modify => navigation.navigate('Record', {modify})}
                  onPressDelete={key => setDeletingId(key)}
                />
              </View>
            </>
      }
    </SafeAreaView>
  );
}

export default ListScreen;
