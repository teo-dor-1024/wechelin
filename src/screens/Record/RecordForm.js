import React, {useContext, useEffect, useRef, useState} from 'react';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {useNavigation} from '@react-navigation/native';
import {View} from 'react-native';
import {Button, CheckBox, Icon, Input, ListItem, Text} from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {RecordContext} from './RecordScreen';
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
    _id,
    visitedDate: modifyVisitedDate,
    menus: modifyMenus,
    money: modifyMoney,
    score: modifyScore,
    isDutch: modifyIsDutch,
  } = addPinMode ?
    {
      id: `${addPinInfo.latitude}${addPinInfo.longitude}`,
      url: '',
      ...addPinInfo,
    }
    :
    (places[selectedIndex] || defaultPlaceInfo);
  
  const [formData, setFormData] = useState({
    visitedDate: modifyVisitedDate ? new Date(modifyVisitedDate) : new Date(),
    menus: modifyMenus ? modifyMenus.join(',') : '',
    money: modifyMoney ? modifyMoney.toString() : '',
    score: modifyScore || 0,
    isDutch: modifyIsDutch === undefined ? true : modifyIsDutch,
  });
  const {visitedDate, menus, money, score, isDutch} = formData;
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
              _id,
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
              score,
              visitedDate,
              visitedYear: visitedDate.getFullYear(),
              visitedMonth: visitedDate.getMonth() + 1,
              isDutch,
            },
          },
        });
        
        if (result) {
          slideRef.current.show(SLIDE_BOTTOM);
          dispatch([CLEAR_SEARCH_LIST]);
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
  
  useEffect(() => {
    if (selectedIndex === -1 && !addPinMode) {
      setTab('SearchForm');
      navigation.navigate('List', {reload: true});
    }
  });
  
  return (
    <>
      <ListItem
        title={name}
        titleStyle={{fontSize: 22, fontWeight: 'bold'}}
        subtitle={_id ? '수정하기' : '기록하기'}
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
              } else if (_id) {
                dispatch([CLEAR_SEARCH_LIST]);
                setTab('SearchForm');
                setAllowDrag(true);
                slideRef.current.show(SLIDE_BOTTOM);
              } else {
                setTab('PlaceDetail');
                setAllowDrag(true);
              }
            }}
          />
        }
      />
      <View style={{alignItems: 'flex-end'}}>
        <CheckBox
          right
          containerStyle={{
            marginTop: 20, backgroundColor: '#FFFFFF', borderWidth: 0, padding: 0, width: 100,
          }}
          title='정산 대상'
          checked={isDutch}
          onPress={() => setFormData({...formData, isDutch: !isDutch})}
        />
      </View>
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
      <View style={{alignItems: 'center', marginTop: 30}}>
        <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: '#2E2E2E'}}>
          {
            score === 5 ?
              '존맛!!'
              :
              score === 4 ?
                '추천할 만해!'
                :
                score === 3 ?
                  '평타는 치네'
                  :
                  score === 2 ?
                    '좀 별론데...?'
                    :
                    score === 1 ?
                      '최악, 다신 안가'
                      :
                      '아직 평가하긴 이르다'
          }
        </Text>
        <StarRating
          emptyStarColor='#FACC2E'
          fullStarColor='#FACC2E'
          maxStars={5}
          rating={score}
          selectedStar={nextScore => setFormData({...formData, score: nextScore === score ? 0 : nextScore})}
        />
      </View>
      <Button
        title='기록하기'
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={{marginTop: 60}}
        onPress={() => setIsWriteDone(true)}
      />
      <DateTimePickerModal
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
      />
    </>
  );
}

export default RecordForm;
