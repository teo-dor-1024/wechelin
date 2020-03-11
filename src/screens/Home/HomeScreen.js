import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {SearchBar, Icon, ListItem} from 'react-native-elements';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import useMyInfo from '../../util/useMyInfo';
import {convertDate, convertMoney} from '../../util/StringUtils';

const styles = {
  listItem: {
    backgroundColor: '#FFF',
    borderBottomColor: '#D8D8D8',
    borderBottomWidth: 0.4,
    height: 100,
    paddingLeft: 15,
    paddingRight: 15,
  },
  hiddenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: 80,
    height: 100,
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#FFBF00',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#FFFFFF',
  },
};

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
        changedYear
        changedMonth
        menus
        money
        score
        isDutch
      }
      cursor
      hasMore
    }
  }
`;

function HomeScreen() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [keyword, setKeyword] = useState('');
  const {id: userId} = useMyInfo();
  const {loading, error, data, fetchMore, refetch} = useQuery(GET_RECORDS, {
    variables: {userId, keyword: ''},
  });
  
  useEffect(() => {
    if (!shouldFetch || !data) {
      return;
    }
    
    const {records: {cursor, hasMore}} = data;
    
    shouldFetch && hasMore && fetchMore({
      variables: {cursor, keyword},
      updateQuery(prev, {fetchMoreResult}) {
        return fetchMoreResult ? fetchMoreResult : prev;
      },
    });
    
    setShouldFetch(false);
  }, [shouldFetch]);
  
  if (loading) {
    return (
      <SafeAreaView>
        <Text>기록 가져오는 중 ... </Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView>
        <Text>기록 찾다가 사망 ... </Text>
      </SafeAreaView>
    );
  }
  
  const {records: {records}} = data;
  
  if (!records.length) {
    return (
      <SafeAreaView>
        <Text>먹은 기록이 없음</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView>
      <View>
        <SearchBar
          placeholder='기록을 검색하세요'
          value={keyword}
          onChangeText={keyword => setKeyword(keyword)}
          cancelButtonTitle='취소'
        />
      </View>
      <SwipeListView
        useFlatList
        swipeRowStyle={{height: 100}}
        data={records}
        renderItem={({item}) => {
          const {_id, placeName, visitedDate, menus = [], money, score} = item;
          
          return (
            <View key={_id} style={styles.listItem}>
              <ListItem
                title={placeName}
                titleStyle={{fontWeight: 'bold'}}
                rightElement={
                  <View>
                    <Icon name='star' type='antdesign' color='#FACC2E'/>
                    <Text>{score} / 5</Text>
                  </View>
                }
                subtitle={
                  <View>
                    <Text style={{fontWeight: 'bold'}}>{convertDate(visitedDate)}</Text>
                    <Text>{menus.join(',')}</Text>
                    <Text>{convertMoney(money)} 원</Text>
                  </View>
                }
              />
            </View>
          );
        }}
        renderHiddenItem={({item: {_id, placeId}}) => (
          <View key={_id} style={styles.hiddenItem}>
            <TouchableOpacity style={styles.optionButton}>
              <Icon name='edit' type='material' color='#FFFFFF' style={{margin: 0, padding: 0}}/>
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.optionButton, backgroundColor: '#DF3A01'}}>
              <Icon name='delete' type='antdesign' color='#FFFFFF'/>
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        leftOpenValue={80}
        rightOpenValue={-80}
        onEndReached={() => setShouldFetch(true)}
        onEndReachedThreshold={0.2}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;
