import React, {useContext, useState} from 'react';
import {Button, Input, ListItem} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {RecordContext} from './RecordScreen';
import {SET_SLIDE_POSITION, SLIDE_MIDDLE} from '../../reducers/RecordReducer';

function RecordForm({setTab}) {
  const {state: {places, selectedIndex}, dispatch} = useContext(RecordContext);
  const {name} = places[selectedIndex];
  const [formData, setFormData] = useState({
    visitedDate: new Date(),
    isDateDone: false,
    menus: '',
    isMenusDone: false,
    money: 0,
    isMoneyDone: false,
    score: 0,
    isDutch: true,
  });
  
  return (
    <>
      <ListItem
        title={`${name}`}
        titleStyle={{fontSize: 22, fontWeight: 'bold'}}
        subtitle="기록하기"
        subtitleStyle={{color: '#424242'}}
        rightIcon={
          <IonIcons
            name='ios-close-circle-outline'
            size={30}
            color='#848484'
            onPress={() => {
              setTab('PlaceDetail');
              dispatch([SET_SLIDE_POSITION, SLIDE_MIDDLE]);
            }}
          />
        }
      />
      {
        formData.isMoneyDone && (
          <Input
            placeholder='금액을 입력하세요'
            label='금액'
          />
        )
      }
      {
        formData.isMenusDone ? (
            <ListItem
              title={formData.menus}
              titleStyle={{fontSize: 22, fontWeight: 'bold'}}
              onPress={() => setFormData({...formData, isMenusDone: false})}
            />
          )
          :
          <Input
            placeholder='메뉴를 입력하세요'
            label="메뉴"
            value={formData.menus}
            onChangeText={text => setFormData({...formData, menus: text})}
            onSubmitEditing={() => setFormData({...formData, isMenusDone: true})}
          />
      }
      {
        formData.isDateDone ?
          <ListItem
            title={formData.visitedDate.toLocaleDateString()}
            titleStyle={{fontSize: 22, fontWeight: 'bold'}}
            onPress={() => setFormData({...formData, isDateDone: false})}
          />
          :
          <>
            <DateTimePicker
              mode="datetime"
              testID='dateTimePicker'
              timeZoneOffsetInMinutes={0}
              minimumDate={new Date(2010, 0, 1)}
              maximumDate={new Date(2030, 11, 31)}
              locale="ko_KO"
              is24Hour
              minuteInterval={30}
              value={formData.visitedDate}
              onChange={(e, visitedDate) => setFormData({...formData, visitedDate})}
            />
            <Button
              title='날짜 입력완료'
              titleStyle={{fontWeight: 'bold'}}
              onPress={() => setFormData({...formData, isDateDone: true})}
            />
          </>
      }
    </>
  );
}

export default RecordForm;
