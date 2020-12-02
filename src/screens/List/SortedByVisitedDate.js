import React from 'react';
import {Button, Icon} from 'react-native-elements';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import ListItem from './ListItem';

const styles = {
  hiddenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: 60,
    height: 80,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFBF00',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#FFFFFF',
    textAlign: 'center'
  },
};

function SortedByVisitedDate({data, onPressMoreView, shouldFetchMore, onPressModify, onPressDelete}) {
  const {records, hasMore} = data;
  const recordsWithKey = records.map(({_id, ...rest}) => ({...rest, key: _id}));
  
  return (
    recordsWithKey.length ?
      <SwipeListView
        useFlatList
        showsVerticalScrollIndicator={false}
        data={hasMore ? recordsWithKey.concat([{moreBtn: true, key: 'moreBtn'}]) : recordsWithKey}
        renderItem={({item}) => {
          const {moreBtn} = item;
          
          return moreBtn ?
            <Button
              title={shouldFetchMore ? ' 기록 가져오는 중 ...' : '더보기'}
              type='clear'
              containerStyle={{backgroundColor: '#FFFFFF', height: 60, marginBottom: 10}}
              titleStyle={{color: '#585858'}}
              onPress={onPressMoreView}
              disabled={shouldFetchMore}
            />
            :
            <ListItem {...item}/>;
        }}
        renderHiddenItem={({item: {key, moreBtn, ...rest}}) => !moreBtn && (
          <View style={styles.hiddenItem}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => onPressModify({key, ...rest})}
            >
              <Icon name='edit' type='material' color='#FFFFFF' style={{margin: 0, padding: 0}}/>
              <Text style={styles.optionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{...styles.optionButton, backgroundColor: '#DF3A01'}}
              onPress={() => Alert.alert(
                '정말 삭제하시겠습니까?',
                null,
                [
                  {text: '취소', style: 'cancel'},
                  {
                    text: '삭제',
                    onPress: () => onPressDelete(key),
                    style: 'destructive',
                  },
                ],
                {cancelable: true},
              )}
            >
              <Icon name='delete' type='antdesign' color='#FFFFFF'/>
              <Text style={styles.optionButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        leftOpenValue={80}
        rightOpenValue={-80}
      />
      :
      <Text>기록이 없습니다.</Text>
  );
}

export default SortedByVisitedDate;
