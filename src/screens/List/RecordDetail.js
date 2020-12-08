import React, {useEffect, useState} from 'react';
import ModalHeader from '../components/ModalHeader';
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Divider} from 'react-native-elements';
import Barcode from "react-native-barcode-builder";
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {convertDate, convertMoney} from '../../util/StringUtils';

const DELETE_RECORD = gql`
  mutation ($_id: ID!) {
    deleteRecord(_id: $_id)
  }
`;

function RecordDetail({detail, setDetail, refetch}) {
  const {placeId, placeName, category, money, menus, visitedDate, isDutch, score} = detail;
  
  const [deletingId, setDeletingId] = useState('');
  const [deleteRecord] = useMutation(DELETE_RECORD);
  
  // 기록 삭제
  useEffect(() => {
    if (!deletingId) {
      return;
    }
    
    (async (deletingId) => {
      const result = await deleteRecord({variables: {_id: deletingId}});
      result ? refetch() : alert('삭제에 실패했습니다.');
      setDeletingId('');
    })(deletingId);
  }, [deletingId]);
  
  // 삭제 핸들러
  const handleDelete = id => Alert.alert(
    '정말 삭제하시겠습니까?',
    null,
    [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => setDeletingId(id),
        style: 'destructive',
      },
    ],
    {cancelable: true},
  );
  
  return (
    <SafeAreaView>
      <ModalHeader
        title='상세 내역'
        close={() => setDetail(null)}
        RightComponent={<TouchableOpacity>
          <Text style={{fontSize: 16}}>수정</Text>
        </TouchableOpacity>}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{placeName}</Text>
        <Text style={styles.money}>{convertMoney(money)}원</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.date}>{convertDate(visitedDate)}</Text>
        <Divider style={styles.divider}/>
        {
          menus.map(menu => (
            <Text key={menu} style={styles.menu}>{menu}</Text>
          ))
        }
        <Divider style={styles.divider}/>
        <Text style={styles.isDutch}>{isDutch ? '데이트 지출' : '개인 지출'}</Text>
        {
          score && <Text style={styles.score}>{score}</Text>
        }
        <Barcode value="Hello World" format="CODE128"/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {paddingHorizontal: 20, marginTop: 40, height: '100%'},
  name: {fontSize: 20, marginBottom: 10},
  money: {fontSize: 24, fontWeight: 'bold', marginBottom: 15},
  category: {marginBottom: 15},
  date: {marginBottom: 15},
  divider: {marginBottom: 15},
  menu: {marginBottom: 15},
  isDutch: {marginBottom: 15},
  score: {marginBottom: 15},
});

export default RecordDetail;
