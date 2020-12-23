import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Alert, Clipboard, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Divider, Text} from 'react-native-elements';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useMyInfo from '../../util/useMyInfo';
import ReceivedAlarms from './ReceivedAlarms';
import RequestedAlarms from './RequestedAlarms';
import SearchUnMatched from './SearchUnMatched';
import ModalHeader from '../components/ModalHeader';

const GET_MY_INFO = gql`
  query ($userId: String!) {
    myLover(userId: $userId) {
      userId
      nickname
    }
    receivedAlarms(targetId: $userId) {
      _id
      applicantId
      applicantName
      type
    }
    requestedAlarms(applicantId: $userId) {
      _id
      targetId
      targetName
      type
      result
      alarm
      completed
    }
  }
`;

const REQUEST_MATCHING = gql`
  mutation ($applicantId: String!, $applicantName: String!, $targetId: String!, $targetName: String!, $type: String!){
    requestMatching(applicantId: $applicantId, applicantName: $applicantName, targetId: $targetId, targetName: $targetName, type: $type)
  }
`;

const UN_FOLLOW = gql`
  mutation ($userId: String!, $friendId: String!) {
    unFollow(userId: $userId, friendId: $friendId)
  }
`;

const BREAK_UP = gql`
  mutation ($userId: String!, $coupleId: String!) {
    breakUp(userId: $userId, coupleId: $coupleId)
  }
`;

function MyScreen() {
  const navigation = useNavigation();
  const {id, nickName} = useMyInfo();
  const {loading, error, data, refetch} = useQuery(GET_MY_INFO, {variables: {userId: id}});
  
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [searchType, setSearchType] = useState('couple');
  
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [requestMatching] = useMutation(REQUEST_MATCHING);
  const [unFollow] = useMutation(UN_FOLLOW);
  const [breakUp] = useMutation(BREAK_UP);
  
  useEffect(() => {
    const request = async () => {
      const result = searchType === 'unFollow' ?
        await unFollow({variables: {userId: id, friendId: targetId}})
        :
        searchType === 'breakUp' ?
          await breakUp({variables: {userId: id, coupleId: targetId}})
          :
          await requestMatching({
            variables: {
              applicantId: id,
              applicantName: nickName,
              targetId,
              targetName,
              type: searchType,
            },
          });
      
      if (result) {
        setTargetId('');
        setTargetName('');
        navigation.reset();
        navigation.navigate('MyScreen');
      } else {
        Alert.alert(
          '요청 처리에 실패했습니다.',
          '다시 요청해주세요.',
          {text: '확인'},
        );
      }
    };
    
    targetId && request();
  }, [targetId]);
  
  const setTargetInfo = (id, name) => {
    setTargetId(id);
    setTargetName(name);
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('id');
    await navigation.navigate('LoginScreen');
  };
  
  const openCoupleSearchForm = () => {
    setIsVisibleModal(true);
    setSearchType('couple');
  };
  
  const coupleBreakUp = () => {
    setSearchType('breakUp');
    setTargetInfo(myLover.userId, myLover.nickname);
  };
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>사용자 정보를 가져올 수 없습니다.</Text>
        <Text>{error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  const {receivedAlarms = [], requestedAlarms = [], myLover} = data || {};
  const requestedOnAlarm = requestedAlarms?.filter(({alarm}) => alarm);
  const alreadyRequestedInfo = requestedAlarms?.find(({completed, type}) => !completed && type === 'couple');
  const crushedName = alreadyRequestedInfo ? alreadyRequestedInfo.targetName : '';
  
  return (
    <SafeAreaView style={styles.container}>
      <ModalHeader
        useLeft={false}
        title={`${nickName || '게스트'}님 정보`}
        RightComponent={<TouchableOpacity onPress={logout}>
          <Text>로그아웃</Text>
        </TouchableOpacity>}
      />
      
      {
        loading ?
          <SkeletonPlaceholder>
            <View style={styles.boxInfo}>
              <View style={styles.boxRow}>
                <View style={styles.skeletonBoxName}/>
                <View style={styles.skeletonBoxValue}/>
              </View>
              <View style={styles.boxRow}>
                <View style={styles.skeletonBoxName}/>
                <View style={styles.skeletonBoxValue}/>
              </View>
            </View>
            <View style={styles.boxHeader}>
              <View style={styles.skeletonAlarmContainer}/>
            </View>
            <View style={styles.boxHeader}>
              <View style={styles.skeletonAlarmContainer}/>
            </View>
          </SkeletonPlaceholder>
          :
          <>
            <View style={styles.boxInfo}>
              <View style={styles.boxRow}>
                <Text style={styles.generalText}>닉네임</Text>
                <Text style={styles.generalText}>{nickName}</Text>
              </View>
              
              <TouchableOpacity onPress={() => Clipboard.setString(id)}>
                <View style={styles.boxRow}>
                  <Text style={styles.generalText}>아이디</Text>
                  <Text style={styles.generalText}>{id}</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.boxHeader}>
              <Text style={styles.boxTitle}>알림</Text>
              <TouchableOpacity onPress={() => refetch()}><Text>새로고침</Text></TouchableOpacity>
            </View>
            <Divider style={styles.divider}/>
            <ReceivedAlarms myId={id} receivedAlarms={receivedAlarms}/>
            <RequestedAlarms requestedAlarms={requestedOnAlarm}/>
            {
              (receivedAlarms.length || requestedOnAlarm.length) ?
                null
                :
                <Text style={styles.emptyAlarm}>
                  수신된 알림이 없습니다.
                </Text>
            }
            
            <Text style={styles.title}>커플</Text>
            <Divider style={styles.divider}/>
            {
              !(myLover || crushedName) &&
              <TouchableOpacity stye={styles.boxInfo} onPress={openCoupleSearchForm}>
                <Text style={{color: '#0080FF', fontWeight: 'bold'}}>커플찾기</Text>
              </TouchableOpacity>
            }
            
            {
              myLover ?
                <View style={styles.boxInfo}>
                  <View style={styles.boxRow}>
                    <Text style={styles.generalText}>{myLover.nickname}</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert(
                        '정말 연결을 끊으시겠습니까?',
                        null,
                        [
                          {text: '취소', style: 'cancel'},
                          {
                            text: '해제',
                            onPress: coupleBreakUp,
                            style: 'destructive',
                          },
                        ],
                        {cancelable: true},
                      )}
                    >
                      <Text style={styles.cancelButton}>연결 해제</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                :
                <Text style={styles.emptyAlarm}>
                  {
                    crushedName ? `${crushedName}님의 수락을 기다리는 중입니다.` : '연결된 커플이 없습니다.'
                  }
                </Text>
            }
            
            <Modal animationType='slide' visible={isVisibleModal}>
              <SearchUnMatched
                userId={id}
                setTargetInfo={setTargetInfo}
                searchType={searchType}
                setIsVisibleModal={setIsVisibleModal}
              />
            </Modal>
          </>
      }
    
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skeletonBoxName: {width: 40, height: 20, borderRadius: 5},
  skeletonBoxValue: {width: 60, height: 20, borderRadius: 5},
  skeletonAlarmContainer: {width: 335, height: 40, borderRadius: 5},
  container: {backgroundColor: '#FFFFFF', height: '100%'},
  boxInfo: {paddingHorizontal: 20},
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 10,
  },
  boxTitle: {fontSize: 16, fontWeight: 'bold'},
  boxRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 25},
  generalText: {fontSize: 16},
  title: {paddingHorizontal: 20, marginTop: 40, marginBottom: 10, fontSize: 16, fontWeight: 'bold'},
  divider: {marginHorizontal: 20},
  emptyAlarm: {paddingHorizontal: 20, marginTop: 20, fontSize: 18},
  cancelButton: {color: '#d23669'},
});

export default MyScreen;
