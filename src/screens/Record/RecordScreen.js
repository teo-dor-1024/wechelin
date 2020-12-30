import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  InputAccessoryView,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, ButtonGroup, Icon, Input} from 'react-native-elements';
import {format, getMonth, getYear} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import StarRating from 'react-native-star-rating';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {allCategories} from '../../util/Category';
import BottomSelect from '../components/BottomSelect';
import CategoryOption from './CategoryOption';
import KakaoMapSearch from './KakaoMapSearch';
import ModalHeader from '../components/ModalHeader';
import useMyInfo from '../../util/useMyInfo';
import {convertMoney} from '../../util/StringUtils';

const getColor = cond => cond ? '#d23669' : '#E6E6E6';
const INIT_FORM_DATA = {
  isDutch: false,
  money: 0,
  placeName: '',
  menus: [],
  category: '음식점',
  visitedDate: new Date(),
  score: 0,
};

const CREATE_RECORD = gql`
  mutation ($input: NewRecord!) {
    createRecord(input: $input) {
      _id
      userId
      placeId
      placeName
      category
      url
      address
      visitedDate
      menus
      money
      score
      isDutch
      x
      y
    }
  }
`;

const DELETE_RECORD = gql`
  mutation ($_id: ID!) {
    deleteRecord(_id: $_id)
  }
`;

function RecordScreen() {
  const {params} = useRoute();
  const navigation = useNavigation();
  
  const {id: userId} = useMyInfo();
  
  // 현재 입력 중인 창
  const [focusInput, setFocusInput] = useState('');
  // 날짜 선택 팝업
  const [isDateOpen, setIsDateOpen] = useState(false);
  // 카카오맵 검색 팝업
  const [isMapOpen, setIsMapOpen] = useState(false);
  // 입력 데이터
  const [formData, setFormData] = useState(INIT_FORM_DATA);
  
  // 수정 여부
  const [isModify, setIsModify] = useState(false);
  // 수정할 데이터 동기화
  useEffect(() => {
    if (!params?.modify) {
      return;
    }
    
    setIsModify(true);
  }, [params]);
  // 수정 여부 동기화
  useEffect(() => {
    setFormData(isModify ? params.modify : INIT_FORM_DATA);
  }, [isModify]);
  
  // 수정 또는 기록 처리
  const [isWriteDone, setIsWriteDone] = useState(false);
  const [createRecord] = useMutation(CREATE_RECORD);
  useEffect(() => {
    const record = async formData => {
      try {
        const {placeId, address, x, y, url, score, visitedDate} = formData;
        const {data: {createRecord: result}} = await createRecord({
          variables: {
            input: {
              userId,
              ...formData,
              placeId: placeId || '',
              address: address || '',
              x: x?.toString() || '',
              y: y?.toString() || '',
              url: url || '',
              score: score || 0,
              visitedDate: new Date(visitedDate),
              visitedYear: getYear(visitedDate),
              visitedMonth: getMonth(visitedDate) + 1,
            },
          },
        });
        
        if (result) {
          const {__typename, ...detail} = result;
          setIsModify(false);
          navigation.navigate('List', {reload: true, detail});
        } else {
          alert('기록 저장 실패!');
        }
      } catch (error) {
        alert('기록 저장 실패!');
      } finally {
        setIsWriteDone(false);
      }
    };
    
    isWriteDone && record(formData);
  }, [isWriteDone, userId]);
  
  // 삭제 처리
  const [deletingId, setDeletingId] = useState('');
  const [deleteRecord] = useMutation(DELETE_RECORD);
  // 기록 삭제
  useEffect(() => {
    if (!deletingId) {
      return;
    }
    
    (async (deletingId) => {
      const result = await deleteRecord({variables: {_id: deletingId}});
      if (result) {
        setDeletingId('');
        setIsModify(false);
        navigation.navigate('List', {reload: true});
      } else {
        alert('삭제에 실패했습니다.');
      }
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
  
  const categorySelector = useRef();
  const scoreSelector = useRef();
  
  const setPlaceByOne = (key, value) => setFormData({...formData, [key]: value});
  const setPlaceByMulti = rest => setFormData({...formData, ...rest});
  
  const setVisitedDate = value => {
    setPlaceByOne('visitedDate', value);
    setIsDateOpen(false);
  };
  const setCategory = value => {
    setPlaceByOne('category', value);
    categorySelector.current.close();
  };
  const setScore = value => {
    setPlaceByOne('score', value === formData.score ? 0 : value);
    scoreSelector.current.close();
  };
  
  const inputAccessoryView = 'placeNameView';
  const title = `${isModify ? '수정' : '기록'}하기`;
  
  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        close={() => {
          navigation.navigate('List', {detail: params?.modify});
          setIsModify(false);
        }}
        title={`지출 ${title}`}
        useLeft={isModify}
        RightComponent={
          isModify ?
            <TouchableOpacity onPress={() => handleDelete(formData?._id)}>
              <Text>삭제</Text>
            </TouchableOpacity>
            :
            null
        }
      />
      
      <View style={styles.body}>
        <View>
          <ButtonGroup
            containerStyle={styles.dutchContainer}
            buttonStyle={{borderRadius: 15}}
            selectedButtonStyle={{backgroundColor: '#FFF'}}
            selectedTextStyle={{color: '#000'}}
            innerBorderStyle={{width: 0}}
            textStyle={{color: '#585858'}}
            buttons={['개인지출', '데이트']}
            selectedIndex={formData.isDutch ? 1 : 0}
            onPress={index => setPlaceByOne('isDutch', !!index)}
          />
          
          <View style={styles.inputBox}>
            <Input
              inputStyle={styles.inputFont}
              inputContainerStyle={{borderBottomColor: getColor(focusInput === 'money')}}
              onFocus={() => setFocusInput('money')} onBlur={() => setFocusInput('')}
              keyboardType='number-pad' returnKeyType='done'
              value={`${convertMoney(formData.money)} 원`}
              onChangeText={value => {
                // 숫자 입력인지 Backspace 인지
                let next = value.replace(/\s+|원|^0원|,/g, '');
                if (!value.includes('원')) {
                  next = next.length === 1 ?
                    0
                    :
                    next.substring(0, next.length - 1);
                }
                
                setPlaceByOne('money', parseInt(next, 10));
              }}
            />
          </View>
          
          <View style={styles.inputBox}>
            <Input
              inputStyle={styles.inputFont}
              inputContainerStyle={{borderBottomColor: getColor(focusInput === 'placeName')}}
              onFocus={() => setFocusInput('placeName')} onBlur={() => setFocusInput('')}
              placeholder={`${formData.isDutch ? '데이트 장소' : '지출처'}를 입력하세요`}
              inputAccessoryViewID={inputAccessoryView}
              value={formData.placeName}
              onChangeText={value => formData.placeId ?
                Alert.alert(
                  '카카오맵 정보가 제거됩니다. 계속 입력하시겠습니까?',
                  null,
                  [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '확인',
                      onPress: () => setFormData({
                        ...formData,
                        x: 0, y: 0,
                        placeId: '',
                        address: '',
                        url: '',
                        placeName: value,
                      }),
                      style: 'destructive',
                    },
                  ],
                  {cancelable: true},
                )
                :
                setPlaceByOne('placeName', value)}
            />
            <InputAccessoryView nativeID={inputAccessoryView} backgroundColor='#FFF'>
              <Button
                title='카카오맵 검색' buttonStyle={{backgroundColor: '#d23669'}}
                disabled={!formData.placeName}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsMapOpen(true);
                }}
              />
            </InputAccessoryView>
          </View>
          
          <View style={styles.inputBox}>
            <Input
              inputStyle={styles.inputFont}
              inputContainerStyle={{borderBottomColor: getColor(focusInput === 'menus')}}
              onFocus={() => setFocusInput('menus')} onBlur={() => setFocusInput('')}
              value={formData.menus.join(',')}
              onChangeText={value => setPlaceByOne('menus', value ? value.split(',') : [])}
              placeholder="지출내역을 입력하세요"
            />
          </View>
          
          <View style={styles.selectBox}>
            <TouchableOpacity style={styles.selectButton} onPress={() => categorySelector.current.open()}>
              <Text style={styles.buttonLabel}>카테고리</Text>
              <View style={styles.selectedOption}>
                <Text style={styles.selectedValue}>{formData.category}</Text>
                <Icon type='ionicon' name='ios-arrow-forward' size={20}/>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectBox}>
            <TouchableOpacity style={styles.selectButton} onPress={() => setIsDateOpen(true)}>
              <Text style={styles.buttonLabel}>날짜</Text>
              <View style={styles.selectedOption}>
                <Text style={styles.selectedValue}>{format(formData.visitedDate, 'M월 d일 h:mm')}</Text>
                <Icon type='ionicon' name='ios-arrow-forward' size={20}/>
              </View>
            </TouchableOpacity>
          </View>
          
          {
            formData.isDutch && (
              <View style={styles.selectBox}>
                <TouchableOpacity style={styles.selectButton} onPress={() => scoreSelector.current.open()}>
                  <Text style={styles.buttonLabel}>평점</Text>
                  <View style={styles.selectedOption}>
                    <Text style={styles.selectedValue}>{formData.score ? `${formData.score}점` : '미평가'}</Text>
                    <Icon type='ionicon' name='ios-arrow-forward' size={20}/>
                  </View>
                </TouchableOpacity>
              </View>
            )
          }
        </View>
        
        <View style={styles.confirmButtonBox}>
          <Button
            title={title} containerStyle={{width: '100%'}}
            buttonStyle={styles.confirmButton}
            titleStyle={styles.confirmButtonTitle}
            onPress={() => setIsWriteDone(true)}
            disabled={!formData.placeName}
          />
        </View>
      </View>
      
      <DateTimePickerModal
        display='spinner'
        isVisible={isDateOpen} mode='datetime'
        onCancel={() => setIsDateOpen(false)}
        headerTextIOS='날짜를 선택하세요' cancelTextIOS='취소' confirmTextIOS='완료'
        minimumDate={new Date(2010, 0, 1)} locale='ko_KO'
        date={formData.visitedDate}
        onConfirm={setVisitedDate}
      />
      
      <BottomSelect slide={categorySelector} title='카테고리 선택하기'>
        {
          allCategories.map((data, index) => (
            <CategoryOption
              key={index}
              category={formData.category}
              setCategory={setCategory}
              {...data}
            />
          ))
        }
      </BottomSelect>
      
      <BottomSelect slide={scoreSelector} title='평점 선택하기' height={220}>
        <View style={styles.scoreSelector}>
          <StarRating
            emptyStarColor='#FACC2E' fullStarColor='#FACC2E'
            maxStars={5} rating={formData.score}
            selectedStar={setScore}
          />
        </View>
      </BottomSelect>
      
      <Modal animationType="slide" visible={isMapOpen}>
        <KakaoMapSearch
          setIsMapOpen={setIsMapOpen}
          initKeyword={formData.placeName}
          setPlace={setPlaceByMulti}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#FFFFFF', height: '100%', paddingBottom: 80},
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dutchContainer: {
    backgroundColor: '#F2F2F2',
    borderWidth: 0,
    borderRadius: 20,
    height: 45,
    padding: 5,
    marginBottom: 15,
  },
  spendKind: {paddingHorizontal: 20},
  inputBox: {marginVertical: 5},
  inputFont: {fontSize: 20, fontWeight: 'bold'},
  selectBox: {marginVertical: 10, paddingHorizontal: 10, justifyContent: 'center'},
  selectButton: {flexDirection: 'row', justifyContent: 'space-between'},
  buttonLabel: {fontSize: 18},
  selectedOption: {flexDirection: 'row'},
  selectedValue: {fontSize: 18, color: '#d23669', marginRight: 20},
  confirmButtonBox: {alignItems: 'center', paddingHorizontal: 10},
  confirmButton: {height: 50, borderRadius: 10, backgroundColor: '#d23669'},
  confirmButtonTitle: {fontSize: 18, fontWeight: 'bold'},
  scoreSelector: {marginTop: 25, alignItems: 'center'},
});

export default RecordScreen;
