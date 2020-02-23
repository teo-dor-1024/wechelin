import React, {useContext, useEffect, useState} from 'react';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Button, CheckBox, Icon, Input, ListItem, Rating} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {RecordContext} from './RecordScreen';
import {CLEAR_SEARCH_LIST, SET_SLIDE_POSITION, SLIDE_MIDDLE} from '../../reducers/RecordReducer';
import useMyInfo from '../../util/useMyInfo';

const CREATE_RECORD = gql`
  mutation ($input: NewRecord!) {
    createRecord(input: $input)
  }
`;

function RecordForm({setTab}) {
  const {state: {places, selectedIndex}, dispatch} = useContext(RecordContext);
  const {id, name, category, address, url, latitude, longitude} = places[selectedIndex];
  const [formData, setFormData] = useState({
    visitedDate: new Date(),
    isDateDone: true,
    menus: '',
    isMenusDone: false,
    money: 0,
    isMoneyDone: false,
    score: 0,
    isScoreDone: false,
    isDutch: true,
  });
  const {visitedDate, isDateDone, menus, isMenusDone, money, isMoneyDone, score, isScoreDone, isDutch} = formData;
  
  const [isWriteDone, setIsWriteDone] = useState(false);
  const [createRecord] = useMutation(CREATE_RECORD);
  const {id: userId} = useMyInfo();
  
  useEffect(() => {
    const record = async () => {
      try {
        await createRecord({
          variables: {
            input: {
              userId,
              placeId: id,
              placeName: name,
              category,
              address,
              url,
              x: longitude,
              y: latitude,
              menus: menus.split(',').map(menu => menu.trim()),
              money,
              score,
              visitedDate,
              visitedYear: visitedDate.getFullYear(),
              visitedMonth: visitedDate.getMonth() + 1,
              isDutch,
            },
          },
        });
        dispatch([CLEAR_SEARCH_LIST]);
        setTab('SearchForm');
      } catch (error) {
        console.error(error.toString());
        setIsWriteDone(false);
      }
    };
  
    isWriteDone && record();
  }, [isWriteDone]);
  
  return (
    <>
      <ListItem
        title={`${name}`}
        titleStyle={{fontSize: 22, fontWeight: 'bold'}}
        subtitle='기록하기'
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
        isDateDone ?
          <ListItem
            title={visitedDate.toLocaleDateString()}
            titleStyle={{fontSize: 22, fontWeight: 'bold'}}
            containerStyle={{marginBottom: 5, paddingBottom: 0}}
            onPress={() => setFormData({...formData, isDateDone: false})}
            leftIcon={<Icon type="foundation" name='calendar' size={30}/>}
          />
          :
          <>
            <DateTimePicker
              mode='datetime'
              testID='dateTimePicker'
              timeZoneOffsetInMinutes={0}
              minimumDate={new Date(2010, 0, 1)}
              maximumDate={new Date(2030, 11, 31)}
              locale='ko_KO'
              is24Hour
              minuteInterval={30}
              value={visitedDate}
              onChange={(e, visitedDate) => setFormData({...formData, visitedDate})}
            />
            <Button
              title='날짜 입력완료'
              titleStyle={{fontWeight: 'bold'}}
              onPress={() => setFormData({...formData, isDateDone: true})}
            />
          </>
      }
      {
        isMenusDone ?
          <ListItem
            title={menus}
            titleStyle={{fontSize: 22, fontWeight: 'bold'}}
            containerStyle={{marginBottom: 10, paddingBottom: 0}}
            onPress={() => setFormData({...formData, isMenusDone: false})}
            leftIcon={<Icon type="ionicon" name='ios-restaurant' size={30}/>}
          />
          :
          <Input
            inputContainerStyle={{marginTop: 10}}
            placeholder='메뉴를 입력하세요'
            value={menus}
            onChangeText={text => setFormData({...formData, menus: text})}
            onSubmitEditing={() => setFormData({...formData, isMenusDone: true})}
          />
      }
      {
        isMoneyDone ?
          <ListItem
            title={`${money}원`}
            titleStyle={{fontSize: 22, fontWeight: 'bold'}}
            containerStyle={{marginBottom: 10, paddingBottom: 0}}
            onPress={() => setFormData({...formData, isMoneyDone: false})}
            leftIcon={<Icon type="font-awesome" name="won" size={20}/>}
          />
          :
          <Input
            inputContainerStyle={{marginTop: 10}}
            placeholder='금액을 입력하세요'
            value={money}
            onChangeText={text => setFormData({...formData, money: text})}
            onSubmitEditing={() => setFormData({...formData, isMoneyDone: true})}
          />
      }
      {
        isScoreDone ?
          <ListItem
            title={`${score} / 5`}
            titleStyle={{fontSize: 22, fontWeight: 'bold'}}
            containerStyle={{marginBottom: 10, paddingBottom: 0}}
            onPress={() => setFormData({...formData, isScoreDone: false})}
            leftIcon={<Icon type="font-awesome" name="star" size={20}/>}
          />
          :
          <>
            <Rating
              count={5}
              startingValue={score}
              fractions={1}
              imageSize={30}
              style={{marginTop: 20, marginBottom: 10}}
              onFinishRating={score => setFormData({...formData, score})}
            />
            <Button
              title='평점 입력완료'
              titleStyle={{fontWeight: 'bold'}}
              containerStyle={{marginBottom: 10}}
              onPress={() => setFormData({...formData, isScoreDone: true})}
            />
          </>
      }
      {
        <CheckBox
          title="정산 대상"
          checked={isDutch}
          onPress={() => setFormData({...formData, isDutch: !isDutch})}
        />
      }
      {
        isDateDone &&
        <Button
          title="기록하기"
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={{marginTop: 50}}
          onPress={() => setIsWriteDone(true)}
        />
      }
    </>
  );
}

export default RecordForm;
