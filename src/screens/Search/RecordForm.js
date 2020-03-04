import React, {useContext, useEffect, useRef, useState} from 'react';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {useNavigation} from '@react-navigation/native';
import {Button, ButtonGroup, CheckBox, Icon, Input, ListItem} from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {RecordContext} from './SearchScreen';
import {CLEAR_SEARCH_LIST} from '../../reducers/searchReducer';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';
import {SLIDE_BOTTOM} from './SearchPanel';

const CREATE_RECORD = gql`
  mutation ($input: NewRecord!) {
    createRecord(input: $input)
  }
`;

const defaultPlaceInfo = {
  id: '',
  name: '',
  category: '',
  address: '',
  url: '',
  latitude: 0,
  longitude: 0,
};

function RecordForm({setAllowDrag, setTab, slideRef}) {
  const navigation = useNavigation();
  
  const {
    state: {
      places, selectedIndex, addPinMode, addPinInfo,
    },
    dispatch,
  } = useContext(RecordContext);
  
  const {
    id, name, category, address, url, latitude, longitude,
  } = addPinMode ?
    {
      id: `${addPinInfo.latitude}${addPinInfo.longitude}`,
      url: '',
      ...addPinInfo,
    }
    :
    (places[selectedIndex] || defaultPlaceInfo);
  
  const [formData, setFormData] = useState({
    visitedDate: new Date(),
    menus: '',
    money: '',
    tasty: -1,
    kind: -1,
    costEfficient: -1,
    isDutch: true,
  });
  const {visitedDate, menus, money, tasty, kind, costEfficient, isDutch} = formData;
  const [isDateOpen, setIsDateOpen] = useState(false);
  const menuRef = useRef();
  const moneyRef = useRef();
  
  const [isWriteDone, setIsWriteDone] = useState(false);
  const [createRecord] = useMutation(CREATE_RECORD);
  const {id: userId} = useMyInfo();
  
  useEffect(() => {
    const record = async () => {
      try {
        const {data: {createRecord: result}} = await createRecord({
          variables: {
            input: {
              userId,
              placeId: id,
              placeName: name,
              category,
              address,
              url,
              x: longitude.toString(),
              y: latitude.toString(),
              menus: menus.split(',').map(menu => menu.trim()),
              money: money ? parseInt(money.replace(/,/g, ''), 10) : 0,
              tasty,
              kind,
              costEfficient,
              visitedDate,
              visitedYear: visitedDate.getFullYear(),
              visitedMonth: visitedDate.getMonth() + 1,
              isDutch,
            },
          },
        });
        
        if (result) {
          dispatch([CLEAR_SEARCH_LIST]);
          setTab('SearchForm');
          slideRef.current.show(SLIDE_BOTTOM);
          navigation.navigate('Home');
        } else {
          alert('기록 저장 실패!');
        }
      } catch (error) {
        alert('기록 저장 실패!');
      } finally {
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
          <Icon
            type="ionicon"
            name='ios-close-circle-outline'
            size={30}
            color='#848484'
            onPress={() => {
              if (addPinMode) {
                setTab('ManualAddForm');
              } else {
                setTab('PlaceDetail');
                setAllowDrag(true);
              }
            }}
          />
        }
      />
      <Input
        ref={menuRef}
        label='날짜'
        containerStyle={{marginTop: 20}}
        inputStyle={{color: '#000000'}}
        placeholderTextColor='#BDBDBD'
        placeholder='날짜를 선택하세요'
        disabled
        value={visitedDate.toLocaleString()}
        onTouchStart={() => setIsDateOpen(true)}
      />
      <Input
        ref={menuRef}
        containerStyle={{marginTop: 20}}
        placeholderTextColor='#BDBDBD'
        label='메뉴'
        placeholder='메뉴를 입력하세요'
        value={menus}
        onChangeText={menus => setFormData({...formData, menus})}
        onSubmitEditing={() => moneyRef.current.focus()}
      />
      <Input
        ref={moneyRef}
        containerStyle={{marginTop: 20}}
        placeholderTextColor='#BDBDBD'
        keyboardType='number-pad'
        returnKeyType='done'
        label='금액'
        placeholder='금액을 입력하세요'
        value={money}
        onChangeText={money => setFormData({
          ...formData,
          money: money.replace(',', ''),
        })}
        onFocus={() => setFormData({
          ...formData,
          money: money.replace(/,/g, ''),
        })}
        onBlur={() => setFormData({
          ...formData,
          money: convertMoney(money),
        })}
      />
      <ButtonGroup
        containerStyle={{marginTop: 20}}
        buttons={['맛있음', '맛없음']}
        selectedIndex={tasty}
        onPress={selectedIdx => setFormData({
          ...formData,
          tasty: selectedIdx === tasty ? -1 : selectedIdx,
        })}
      />
      <ButtonGroup
        buttons={['친절함', '불친절함']}
        selectedIndex={kind}
        onPress={selectedIdx => setFormData({
          ...formData,
          kind: selectedIdx === kind ? -1 : selectedIdx,
        })}
      />
      <ButtonGroup
        buttons={['가성비 좋음', '비쌈']}
        selectedIndex={costEfficient}
        onPress={selectedIdx => setFormData({
          ...formData,
          costEfficient: selectedIdx === costEfficient ? -1 : selectedIdx,
        })}
      />
      <CheckBox
        containerStyle={{marginTop: 20}}
        title='정산 대상'
        checked={isDutch}
        onPress={() => setFormData({...formData, isDutch: !isDutch})}
      />
      <Button
        title='기록하기'
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={{marginTop: 30}}
        onPress={() => setIsWriteDone(true)}
      />
      <DateTimePickerModal
        isDarkModeEnabled
        isVisible={isDateOpen}
        mode='datetime'
        onConfirm={visitedDate => {
          setFormData({...formData, visitedDate});
          setIsDateOpen(false);
        }}
        onCancel={() => setIsDateOpen(false)}
        headerTextIOS='날짜를 선택하세요'
        cancelTextIOS='취소'
        confirmTextIOS='완료'
        minimumDate={new Date(2010, 0, 1)}
        locale='ko_KO'
        minuteInterval={30}
      />
    </>
  );
}

export default RecordForm;
