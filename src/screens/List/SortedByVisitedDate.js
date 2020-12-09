import React, {useEffect, useState} from 'react';
import {Button, Divider} from 'react-native-elements';
import {Modal, ScrollView, Text, View} from 'react-native';
import {format} from 'date-fns';
import ko from 'date-fns/locale/ko';
import ListItem from './ListItem';
import RecordDetail from './RecordDetail';

function SortedByVisitedDate({data, onPressMoreView, shouldFetchMore, refetch, reOpenDetail}) {
  const {records, hasMore} = data;
  
  const [detail, setDetail] = useState(null);
  
  useEffect(() => {
    if (!reOpenDetail) {
      return;
    }
    
    setDetail(reOpenDetail);
  }, [reOpenDetail]);
  
  let prevDate = null;
  
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {
        records.map(record => {
          const {_id, visitedDate} = record;
          const yyyymmdd = visitedDate?.substring(0, 10);
          if (prevDate && prevDate === yyyymmdd) {
            return <ListItem key={_id} {...record} setDetail={setDetail}/>;
          }
          
          prevDate = yyyymmdd;
          return (
            <View key={_id} style={{marginTop: 15}}>
              <Text style={{marginHorizontal: 20, paddingBottom: 15, color: '#848484'}}>
                {format(new Date(visitedDate), 'M월 d일 EEEE', {locale: ko})}
              </Text>
              <Divider style={{marginHorizontal: 20}}/>
              <ListItem {...record} setDetail={setDetail}/>
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
      <Modal animationType="slide" visible={!!detail}>
        <RecordDetail detail={detail} setDetail={setDetail} refetch={refetch}/>
      </Modal>
    </ScrollView>
  );
}

export default SortedByVisitedDate;
