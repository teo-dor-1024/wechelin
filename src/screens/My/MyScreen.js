import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Alert, Modal, SafeAreaView, ScrollView, View} from 'react-native';
import {Button, Icon, Text} from 'react-native-elements';
import useMyInfo from '../../util/useMyInfo';
import ReceivedAlarms from './ReceivedAlarms';
import RequestedAlarms from './RequestedAlarms';
import UserSearchForm from './UserSearchForm';

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
        navigation.navigate('My');
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
      <View style={{alignItems: 'flex-end', padding: 20}}>
        <Button
          type='clear'
          title='로그아웃'
          titleStyle={{color: '#1C1C1C'}}
          icon={<Icon name='log-out' type='feather' size={20} containerStyle={{marginRight: 5}}/>}
          onPress={logout}
        />
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
      
      <View style={myStyles.userItem}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon type='material-community' name='account-heart' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            커플
          </Text>
        </View>
        {
          (myLover || crushedName) ?
            null
            :
            <Icon
              name='md-add'
              type='ionicon'
              size={25}
              containerStyle={{marginRight: 10}}
              color='#0080FF'
              onPress={() => {
                setIsVisibleModal(true);
                setSearchType('couple');
              }}
            />
        }
      </View>
      <View style={{...myStyles.userItem, marginBottom: 20}}>
        {
          myLover ?
            <>
              <Text style={{fontWeight: 'bold', fontSize: 18}}>
                {myLover.nickname}
              </Text>
              <Button
                title='연결 해제'
                titleStyle={{fontSize: 14, color: '#FE2E2E'}}
                type='clear'
                containerStyle={{height: 30}}
                buttonStyle={{padding: 5}}
                onPress={() => Alert.alert(
                  '정말 연결을 끊으시겠습니까?',
                  null,
                  [
                    {text: '취소', style: 'cancel'},
                    {
                      text: '해제',
                      onPress: () => {
                        setSearchType('breakUp');
                        setTargetInfo(myLover.userId, myLover.nickname);
                      },
                      style: 'destructive'
                    },
                  ],
                  {cancelable: true}
                )}
              />
            </>
            :
            <Text style={{fontSize: 18}}>
              {
                crushedName ? `${crushedName}님의 수락을 기다리는 중입니다.` : '연결된 커플이 없습니다.'
              }
            </Text>
        }
      </View>
      
      <View style={myStyles.userItem}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon type='feather' name='users' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            친구들
          </Text>
        </View>
        <Icon
          name='md-add'
          type='ionicon'
          size={25}
          containerStyle={{marginRight: 10}}
          color='#0080FF'
          onPress={() => {
            setIsVisibleModal(true);
            setSearchType('friends');
          }}
        />
      </View>
      <ScrollView style={{paddingBottom: 70}}>
        {
          myFriends.length ?
            myFriends.map(({userId, nickname}) => (
              <View key={userId} style={myStyles.userItem}>
                <Text style={{fontWeight: 'bold', fontSize: 18}}>
                  {nickname}
                </Text>
                <Button
                  title='연결 해제'
                  titleStyle={{fontSize: 14, color: '#FE2E2E'}}
                  type='clear'
                  containerStyle={{height: 30}}
                  buttonStyle={{padding: 5}}
                  onPress={() => Alert.alert(
                    '정말 연결을 끊으시겠습니까?',
                    null,
                    [
                      {text: '취소', style: 'cancel'},
                      {
                        text: '해제',
                        onPress: () => {
                          setSearchType('unFollow');
                          setTargetInfo(userId, nickname);
                        },
                        style: 'destructive'
                      },
                    ],
                    {cancelable: true}
                  )}
                />
              </View>
            ))
            :
            <Text style={{fontSize: 18}}>
              연결된 친구들이 없습니다.
            </Text>
        }
      </ScrollView>
      
      <Modal
        animationType="slide"
        visible={isVisibleModal}
      >
        <UserSearchForm
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
