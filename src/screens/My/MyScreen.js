import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation, useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {Dimensions, SafeAreaView, ScrollView, View} from 'react-native';
import {Button, Icon, ListItem, Text} from 'react-native-elements';
import useMyInfo from '../../util/useMyInfo';
import ReceivedAlarms from './ReceivedAlarms';
import RequestedAlarms from './RequestedAlarms';
import UserSearchForm from './UserSearchForm';
import SlidingUpPanel from "rn-sliding-up-panel";

export const myStyles = {
  alarmItem: {
    marginHorizontal: 20,
    marginBottom: 5,
    paddingVertical: 10,
  },
};

export const getTypeKorName = type => type === 'couple' ? '커플' : '친구';
const SLIDE_BOTTOM = -370;

const GET_MY_INFO = gql`
  query ($userId: String!, $alarm: Boolean) {
    myLover(userId: $userId) {
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
    requestedAlarms(applicantId: $userId, alarm: $alarm) {
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
  const {loading, error, data, refetch} = useQuery(GET_MY_INFO, {variables: {userId: id, alarm: true}});
  
  const {height} = Dimensions.get('window');
  const SLIDE_TOP = height - 500;
  const searchEl = useRef();
  const [searchType, setSearchType] = useState('couple');
  const typeKorName = getTypeKorName(searchType);
  
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
          type: searchType,
        },
      });
      
      alert(result ? `${typeKorName} 요청되었습니다.` : `${typeKorName} 요청에 실패했습니다.`);
      setTargetId('');
      setTargetName('');
      navigation.reset();
      navigation.navigate('My');
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
          <ListItem
            title='수신된 알림이 없습니다.'
            titleStyle={{fontSize: 14}}
            containerStyle={{marginHorizontal: 20, marginBottom: 20}}
          />
      }
      
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon type='material-community' name='account-heart' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            커플
          </Text>
        </View>
        {
          myLover ?
            null
            :
            <Icon
              name='md-add'
              type='ionicon'
              size={25}
              containerStyle={{marginRight: 10}}
              color='#F5A9D0'
              onPress={() => {
                searchEl.current.show(SLIDE_TOP);
                setSearchType('couple');
              }}
            />
        }
      </View>
      <Text style={{marginLeft: 20, marginBottom: 20, fontWeight: 'bold', fontSize: 18}}>
        {
          myLover ? `${myLover.nickname}` : '연결된 커플이 없습니다.'
        }
      </Text>
      
      <View style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
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
            searchEl.current.show(SLIDE_TOP);
            setSearchType('friends');
          }}
        />
      </View>
      <ScrollView style={{paddingBottom: 70}}>
      {
        myFriends.map(({userId, nickname}) => (
          <Text key={userId} style={{marginLeft: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 18}}>
            {nickname}
          </Text>
        ))
      }
      </ScrollView>
      
      <SlidingUpPanel
        ref={searchEl}
        allowDragging={false}
        draggableRange={{top: SLIDE_TOP, bottom: SLIDE_BOTTOM}}
        containerStyle={{zIndex: 2, borderRadius: 15}}
        friction={2}
      >
        <UserSearchForm
          searchEl={searchEl}
          myId={id}
          setTargetInfo={setTargetInfo}
          searchType={searchType}
          typeKorName={typeKorName}
        />
      </SlidingUpPanel>
    </SafeAreaView>
  );
}

export default MyScreen;
