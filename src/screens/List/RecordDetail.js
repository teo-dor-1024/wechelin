import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Divider} from 'react-native-elements';
import Barcode from 'react-native-barcode-builder';
import {useNavigation} from '@react-navigation/native';
import ModalHeader from '../components/ModalHeader';
import {convertDate, convertMoney} from '../../util/StringUtils';

function RecordDetail({detail, setDetail}) {
  const {placeName, category, money, menus, visitedDate, isDutch, score} = detail;
  
  const navigation = useNavigation();
  
  return (
    <SafeAreaView>
      <ModalHeader
        title='상세 내역'
        close={() => setDetail(null)}
        RightComponent={<TouchableOpacity onPress={() => {
          navigation.navigate('Record', {modify: {...detail, visitedDate: new Date(visitedDate)}});
          setDetail(null);
        }}>
          <Text style={{fontSize: 16}}>수정</Text>
        </TouchableOpacity>}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{placeName}</Text>
        <Text style={styles.money}>{convertMoney(money)}원</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.date}>{convertDate(visitedDate)}</Text>
        {
          menus?.length && (
            <>
              <Divider style={styles.divider}/>
              {
                menus.map(menu => (
                  <Text key={menu} style={styles.menu}>{menu}</Text>
                ))
              }
            </>
          )
        }
        <Divider style={styles.divider}/>
        <View style={styles.hashInfo}>
          <Text style={styles.isDutch}>#{isDutch ? '데이트 지출' : '개인 지출'}</Text>
          <Text style={styles.score}>{score ? `#${score}점` : '#미평가'}</Text>
        </View>
        <Barcode value="fake barcode" format="CODE128"/>
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
  hashInfo: {flexDirection: 'row'},
  isDutch: {marginBottom: 15},
  score: {marginBottom: 15, marginLeft: 10},
});

export default RecordDetail;
