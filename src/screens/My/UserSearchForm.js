import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Button, Icon, ListItem, SearchBar, Text} from 'react-native-elements';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {myStyles} from './MyScreen';

const GET_USERS = gql`
  query ($keyword: String, $myId: String!, $alarm: Boolean) {
    users(keyword: $keyword) {
      userId
      nickname
      coupleId
      friends
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

function UserSearchForm({myId, setTargetInfo}) {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const {loading, error, data} = useQuery(GET_USERS, {variables: {keyword, myId, alarm: false}});
  
  if (loading) {
    return (
      <SafeAreaView style={{marginLeft: 20}}>
        <Text> 커플 검색 중 ...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView>
        <Text> 커플 찾다가 에러 발생!! 혹시 솔로 ...? {error.toString()}</Text>
      </SafeAreaView>
    );
  }
  
  const {users, requestedAlarms} = data;
  
  return (
    <View>
      <View style={{flexDirection: 'row', marginLeft: 20, marginVertical: 10, alignItems: 'center'}}>
        <Icon type='feather' name='users' size={25}/>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
          커플 찾기
        </Text>
      </View>
      <SearchBar
        platform='ios'
        containerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 10,
          paddingTop: 0,
        }}
        inputContainerStyle={{backgroundColor: '#E6E6E6'}}
        placeholder='검색'
        value={text}
        onChangeText={text => setText(text)}
        onSubmitEditing={() => setKeyword(text)}
        onClear={() => {
          setText('');
          setKeyword('');
        }}
        cancelButtonTitle='취소'
        cancelButtonProps={{buttonStyle: {marginRight: 10, height: 45}}}
      />
      <ScrollView style={{height: 500}}>
      {
        users.map(({userId, nickname, coupleId}) => {
          const requestedInfo = requestedAlarms.find(matching => matching.targetId === userId);
          if (coupleId) {
            return null;
          }
          
          return (
            <ListItem
              key={userId}
              containerStyle={myStyles.alarmItem}
              title={nickname}
              rightElement={
                requestedInfo ?
                  <Text>커플 요청 대기중</Text>
                  :
                  <Button
                    title={'커플 요청'}
                    titleStyle={{fontSize: 14, fontWeight: 'bold'}}
                    buttonStyle={{height: 25, paddingVertical: 0, backgroundColor: '#F5A9D0'}}
                    onPress={() => setTargetInfo(userId, nickname)}
                  />
              }
            />
          );
        })
      }
      </ScrollView>
    </View>
  );
}

export default UserSearchForm;
