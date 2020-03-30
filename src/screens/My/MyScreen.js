import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Alert, Clipboard, Modal, SafeAreaView, View} from 'react-native';
import {Button, Icon, Text} from 'react-native-elements';
import useMyInfo from '../../util/useMyInfo';
import ReceivedAlarms from './ReceivedAlarms';
import RequestedAlarms from './RequestedAlarms';
import SearchUnMatched from './SearchUnMatched';
import MyLover from './MyLover';
import MyFriends from './MyFriends';

export const myStyles = {
  alarmItem: {
    marginBottom: 5,
    paddingVertical: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between'
  },
};

const GET_MY_INFO = gql`
  query ($userId: String!) {
    myLover(userId: $userId) {
      userId
      nickname
    }
    myFriends(userId: $userId) {
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
          {text: '확인'}
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
    await AsyncStorage.clear();
    navigation.replace('LoginScreen');
  };
  
  const openCoupleSearchForm = () => {
    setIsVisibleModal(true);
    setSearchType('couple');
  };
  
  const coupleBreakUp = () => {
    setSearchType('breakUp');
    setTargetInfo(myLover.userId, myLover.nickname);
  };
  
  const openFriendSearchForm = () => {
    setIsVisibleModal(true);
    setSearchType('friends');
  };
  
  const unFollowFriend = (userId, nickname) => {
    setSearchType('unFollow');
    setTargetInfo(userId, nickname);
  };
  
  if (loading) {
    return (
      <SafeAreaView>
        <Text> 내 정보 가져오는 중 ...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView>
        <Text> 내 정보 찾다가 에러 발생!! </Text>
        <Text>{error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  const {receivedAlarms = [], requestedAlarms = [], myLover, myFriends = []} = data;
  const requestedOnAlarm = requestedAlarms.filter(({alarm}) => alarm);
  const alreadyRequestedInfo = requestedAlarms.find(({completed, type}) => !completed && type === 'couple');
  const crushedName = alreadyRequestedInfo ? alreadyRequestedInfo.targetName : '';
  
  return (
    <SafeAreaView style={{marginHorizontal: 20}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 30}}>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>
          {nickName || 'Guest'}님
        </Text>
        <Button
          type='clear'
          title='로그아웃'
          titleStyle={{color: '#1C1C1C'}}
          icon={<Icon name='log-out' type='feather' size={20} containerStyle={{marginRight: 5}}/>}
          onPress={logout}
        />
      </View>
      
      <View style={{marginBottom: 20}}>
        <View style={{flexDirection: 'row', marginBottom: 10, alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon type='antdesign' name='idcard' size={25}/>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
              아이디
            </Text>
          </View>
          <Icon
            type='material-community'
            name='content-copy'
            underlayColor={'#F2F2F2'}
            onPress={() => Clipboard.setString(id)}
          />
        </View>
        <Text style={{fontSize: 18}}>{id}</Text>
      </View>
      
      <View style={{marginBottom: 20}}>
        <View style={{flexDirection: 'row', marginBottom: 10, alignItems: 'center'}}>
          <Icon type='material-community' name='bell-outline' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            알림
          </Text>
        </View>
        <ReceivedAlarms myId={id} receivedAlarms={receivedAlarms} refetch={refetch}/>
        <RequestedAlarms requestedAlarms={requestedOnAlarm} refetch={refetch}/>
        {
          (receivedAlarms.length || requestedOnAlarm.length) ?
            null
            :
            <Text style={{fontSize: 18}}>
              수신된 알람이 없습니다.
            </Text>
        }
      </View>
      
      <MyLover
        myLover={myLover}
        crushedName={crushedName}
        openSearchForm={openCoupleSearchForm}
        breakUp={coupleBreakUp}
      />
      
      <MyFriends
        myFriends={myFriends}
        openSearchForm={openFriendSearchForm}
        unFollow={unFollowFriend}
      />
      
      <Modal animationType='slide' visible={isVisibleModal}>
        <SearchUnMatched
          userId={id}
          setTargetInfo={setTargetInfo}
          searchType={searchType}
          setIsVisibleModal={setIsVisibleModal}
        />
      </Modal>
    </SafeAreaView>
  );
}

export default MyScreen;
