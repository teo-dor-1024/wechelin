import React, {useEffect, useState} from 'react';
import {Button, Divider} from 'react-native-elements';
import {Image, Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import ListItem from './ListItem';
import RecordDetail from './RecordDetail';
import {convertDate} from '../../util/StringUtils';

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
                {convertDate(visitedDate, 'MM월 dd일 EEEE')}
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
        !records.length && (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../assets/pencil.png')}
              style={{width: '100%', height: '100%', resizeMode: 'contain'}}
            />
            <Text style={styles.emptyText}>기록이 없습니다.</Text>
          </View>
        )
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
  emptyContainer: {marginTop: 170, height: 120, alignItems: 'center'},
  emptyText: {fontWeight: 'bold', color: '#d23669', fontSize: 18, marginTop: 20},
  divider: {marginHorizontal: 20},
  moreButton: {backgroundColor: '#FFF', height: 60, marginBottom: 10},
  moreButtonTitle: {color: '#585858'},
});

export default SortedByVisitedDate;
