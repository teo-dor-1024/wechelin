import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {SafeAreaView, View} from 'react-native';
import {Button, Icon, ListItem, Text} from 'react-native-elements';
import useMyInfo from '../../util/useMyInfo';
import ReceivedAlarms from './ReceivedAlarms';
import RequestedAlarms from './RequestedAlarms';
import UserSearchForm from './UserSearchForm';

export const myStyles = {
  alarmItem: {
    marginHorizontal: 20,
    marginBottom: 5,
    paddingVertical: 10,
  },
};

const GET_MY_INFO = gql`
  query ($myId: String!, $alarm: Boolean) {
    myLover(myId: $myId) {
      nickname
    }
    receivedAlarms(targetId: $myId) {
      _id
      applicantId
      applicantName
      type
    }
    requestedAlarms(applicantId: $myId, alarm: $alarm) {
      _id
      targetId
      targetName
      type
      result
    }
  }
`;

const REQUEST_MATCHING = gql`
  mutation ($applicantId: String!, $applicantName: String!, $targetId: String!, $targetName: String!, $type: String!){
    requestMatching(applicantId: $applicantId, applicantName: $applicantName, targetId: $targetId, targetName: $targetName, type: $type)
  }
`;

function MyScreen() {
  const navigation = useNavigation();
  const {id, nickName} = useMyInfo();
  const {loading, error, data, refetch} = useQuery(GET_MY_INFO, {variables: {myId: id, alarm: true}});
  
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [requestMatching] = useMutation(REQUEST_MATCHING);
  
  useEffect(() => {
    const request = async () => {
      const result = await requestMatching({
        variables: {
          applicantId: id,
          applicantName: nickName,
          targetId,
          targetName,
          type: 'couple',
        },
      });
      result ? alert(`커플 요청되었습니다.`) : alert(`커플 요청에 실패했습니다.`);
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
        <Text> 내 정보 찾다가 에러 발생!! {error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  const {receivedAlarms = [], requestedAlarms = [], myLover} = data;
  
  return (
    <SafeAreaView>
      <View style={{alignItems: 'flex-end', padding: 20}}>
        <Button
          type='clear'
          title='로그아웃'
          titleStyle={{color: '#1C1C1C'}}
          icon={<Icon name='log-out' type='feather' size={20} containerStyle={{marginRight: 5}}/>}
          onPress={logout}
        />
      </View>
      <View style={{flexDirection: 'row', marginLeft: 20, marginBottom: 10, alignItems: 'center'}}>
        <Icon type='material-community' name='bell-outline' size={25}/>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
          알림
        </Text>
      </View>
      <ReceivedAlarms myId={id} receivedAlarms={receivedAlarms} refetch={refetch}/>
      <RequestedAlarms requestedAlarms={requestedAlarms} refetch={refetch}/>
      {
        (receivedAlarms.length || requestedAlarms.length) ?
          null
          :
          <ListItem title='수신된 알림이 없습니다.' titleStyle={{fontSize: 14}}
                    containerStyle={{marginHorizontal: 20, marginBottom: 10}}/>
      }
      {
        myLover ?
          <View>
            <View style={{flexDirection: 'row', marginLeft: 20, marginVertical: 10, alignItems: 'center'}}>
              <Icon type='material-community' name='account-heart' size={25}/>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
                커플
              </Text>
            </View>
            <Text style={{marginLeft: 20, fontWeight: 'bold', fontSize: 18}}>
              {myLover.nickname}님
            </Text>
          </View>
          :
          <UserSearchForm myId={id} setTargetInfo={setTargetInfo}/>
      }
    </SafeAreaView>
  );
}

export default MyScreen;
