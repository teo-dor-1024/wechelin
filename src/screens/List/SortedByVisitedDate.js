import React from 'react';
import {Button, Divider} from 'react-native-elements';
import {Alert, ScrollView, Text, View} from 'react-native';
import {format} from 'date-fns';
import ko from 'date-fns/locale/ko';
import ListItem from './ListItem';

function SortedByVisitedDate({data, onPressMoreView, shouldFetchMore, onPressModify, onPressDelete}) {
  const {records, hasMore} = data;
  
  const deleteRecord = id => Alert.alert(
    '정말 삭제하시겠습니까?',
    null,
    [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => onPressDelete(id),
        style: 'destructive',
      },
    ],
    {cancelable: true},
  );
  
  let prevDate = null;
  
  return (
    <ScrollView>
      {
        records.map(({_id, visitedDate, ...rest}) => {
          const yyyymmdd = visitedDate.substring(0, 10);
          if (prevDate && prevDate === yyyymmdd) {
            return <ListItem key={_id} {...rest} onPressModify={onPressModify}/>;
          }
          
          prevDate = yyyymmdd;
          return (
            <View key={_id} style={{marginTop: 15}}>
              <Text style={{marginHorizontal: 20, paddingBottom: 15, color: '#848484'}}>
                {format(new Date(visitedDate), 'M월 d일 EEEE', {locale: ko})}
              </Text>
              <Divider style={{marginHorizontal: 20}}/>
              <ListItem {...rest} onPressModify={onPressModify}/>
            </View>
          );
        })
      }
      {
        hasMore && (
          <Button
            title={shouldFetchMore ? ' 기록 가져오는 중 ...' : '더보기'}
            type='clear'
            containerStyle={{backgroundColor: '#FFF', height: 60, marginBottom: 10}}
            titleStyle={{color: '#585858'}}
            onPress={onPressMoreView}
            disabled={shouldFetchMore}
          />
        )
      }
      {
        !records.length && <Text>기록이 없습니다.</Text>
      }
    </ScrollView>
  );
}

export default SortedByVisitedDate;
