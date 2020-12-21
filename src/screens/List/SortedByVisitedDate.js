import React, {useEffect, useState} from 'react';
import {Button, Divider} from 'react-native-elements';
import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
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
            <View key={_id} style={styles.container}>
              <Text style={styles.date}>
                {format(new Date(visitedDate), 'M월 d일 EEEE', {locale: ko})}
              </Text>
              <Divider style={styles.divider}/>
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
            containerStyle={styles.moreButton}
            titleStyle={styles.moreButtonTitle}
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

const styles = StyleSheet.create({
  container: {marginTop: 15},
  date: {marginHorizontal: 20, paddingBottom: 15, color: '#848484'},
  divider: {marginHorizontal: 20},
  moreButton: {backgroundColor: '#FFF', height: 60, marginBottom: 10},
  moreButtonTitle: {color: '#585858'},
});

export default SortedByVisitedDate;
