import React, {useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {Button, Input, Text} from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import {RecordContext} from './RecordScreen';
import {SET_ADD_PIN_INFO, SET_ADD_PIN_MODE} from '../../reducers/searchReducer';
import {SLIDE_BOTTOM, SLIDE_MIDDLE} from './SearchPanel';

const styles = {
  descContainer: {
    padding: 10,
  },
  description: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },
  pickerGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
};

const category1Items = [
  {label: '음식점', value: '음식점'},
  {label: '카페', value: '카페'},
  {label: '기타', value: '기타'},
];
const category2Items = [
  {label: '한식', value: '한식', level1: '음식점'},
  {label: '중식', value: '중식', level1: '음식점'},
  {label: '일식', value: '일식', level1: '음식점'},
  {label: '양식', value: '양식', level1: '음식점'},
  {label: '패스트푸드', value: '패스트푸드', level1: '음식점'},
  {label: '기타', value: '기타', level1: '음식점'},
  {label: '커피전문점', value: '커피전문점', level1: '카페'},
  {label: '기타', value: '기타', level1: '기타'},
];

function ManualAddForm({setAllowDrag, setTab, SLIDE_TOP, slideRef}) {
  const {state: {addPinInfo}, dispatch} = useContext(RecordContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const addressEl = useRef();
  
  useEffect(() => {
    addPinInfo.latitude && slideRef.current.show(SLIDE_MIDDLE);
  }, [addPinInfo.latitude]);
  
  useEffect(() => {
    const {name, address, category} = addPinInfo;
    setName(name);
    setAddress(address);
    if (category) {
      const splitCategory = category.split('>');
      setCategory1(splitCategory[0].trim());
      setCategory2(splitCategory[1].trim());
    }
  }, [addPinInfo]);
  
  const onPickCategory = () => {
    category1 && category2 && dispatch([SET_ADD_PIN_INFO, {category: `${category1} > ${category2}`}]);
  };
  
  return (
    <View style={styles.descContainer}>
      <Text style={styles.description} onPress={() => slideRef.current.show(SLIDE_MIDDLE)}>
        {
          addPinInfo.latitude ?
            '아래 정보를 입력 후 등록을 누르세요.'
            :
            '지도에서 등록할 위치를 선택 하세요.'
        }
      </Text>
      {
        addPinInfo.latitude ?
          <>
            <Input
              placeholder='가게명을 입력하세요'
              containerStyle={{marginTop: 20}}
              placeholderTextColor='#BDBDBD'
              value={name}
              onChangeText={name => setName(name)}
              onSubmitEditing={() => {
                dispatch([SET_ADD_PIN_INFO, {name}]);
                addressEl.current.focus();
              }}
              onBlur={() => dispatch([SET_ADD_PIN_INFO, {name}])}
            />
            <Input
              ref={addressEl}
              placeholder='주소를 입력하세요'
              containerStyle={{marginTop: 10}}
              placeholderTextColor='#BDBDBD'
              value={address}
              onChangeText={address => setAddress(address)}
              onSubmitEditing={() => dispatch([SET_ADD_PIN_INFO, {address}])}
              onBlur={() => dispatch([SET_ADD_PIN_INFO, {address}])}
            />
            <View style={styles.pickerGroup}>
              <RNPickerSelect
                style={{
                  inputIOS: {
                    fontSize: 16,
                    width: 150,
                    textAlign: 'center',
                    borderWidth: 0.5,
                    borderRadius: 5,
                    borderColor: '#BDBDBD',
                    padding: 10,
                    color: '#000000',
                  },
                }}
                placeholder={{label: '대분류 선택하세요', value: ' '}}
                doneText='완료'
                // value={category1}
                onValueChange={value => setCategory1(value)}
                items={category1Items}
                onDonePress={onPickCategory}
              />
              <RNPickerSelect
                style={{
                  inputIOS: {
                    fontSize: 16,
                    width: 150,
                    textAlign: 'center',
                    borderWidth: 0.5,
                    borderRadius: 5,
                    borderColor: '#BDBDBD',
                    padding: 10,
                    marginLeft: 10,
                    color: '#000000',
                  },
                }}
                placeholder={{label: '소분류 선택하세요', value: ' '}}
                doneText='완료'
                value={category2}
                onValueChange={(value) => setCategory2(value)}
                items={category2Items.filter(({level1}) => level1 === category1)}
                onDonePress={onPickCategory}
              />
            </View>
          </>
          :
          null
      }
      <View style={styles.buttonGroup}>
        <Button
          title='취소'
          type='clear'
          onPress={() => {
            setAllowDrag(true);
            setTab('SearchForm');
            dispatch([SET_ADD_PIN_MODE, false]);
            slideRef.current.show(SLIDE_BOTTOM);
          }}
        />
        <Button
          title='등록'
          type='clear'
          disabled={!addPinInfo.latitude || !name}
          onPress={() => {
            slideRef.current.show(SLIDE_TOP);
            setTab('RecordForm');
          }}
        />
      </View>
    </View>
  );
}

export default ManualAddForm;
