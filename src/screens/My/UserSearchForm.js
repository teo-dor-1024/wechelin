import React, {useEffect, useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Button, Icon, ListItem, SearchBar, Text} from 'react-native-elements';
import {ScrollView, View} from 'react-native';
import {getTypeKorName, myStyles} from './MyScreen';

const GET_USERS = gql`
  query ($keyword: String, $myId: String!, $alarm: Boolean, $type: String!) {
    unknownUsers(userId: $myId, keyword: $keyword, type: $type) {
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

function UserSearchForm({searchEl, myId, setTargetInfo, searchType, typeKorName}) {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const {loading, error, data} = useQuery(GET_USERS, {
    variables: {
      keyword, myId, alarm: false, type: searchType
    }
  });
  
  useEffect(() => {
    searchEl.current && searchEl.current.hide();
  }, [searchEl.current]);
  
  return (
    <View style={{
      zIndex: 1,
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      paddingTop: 15,
      paddingRight: 10,
      paddingLeft: 10,
      paddingBottom: 100,
    }}>
      <View style={{flexDirection: 'row', marginLeft: 10, marginTop: 10, alignItems: 'center'}}>
        <Icon type='feather' name='user-plus' size={25}/>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
          {searchType === 'couple' ? '커플' : '친구들'} 찾기
        </Text>
      </View>
      <SearchBar
        platform='ios'
        containerStyle={{backgroundColor: '#FFF'}}
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
      <ScrollView>
        {
          loading ?
            <Text> 유저 검색 중 ...</Text>
            :
            error ?
              <Text> 유저 찾다가 에러 발생!! {error.toString()}</Text>
              :
              data.unknownUsers.map(({userId, nickname}) => {
                const requestedInfo = data.requestedAlarms.find(matching => matching.targetId === userId);
                
                return (
                  <ListItem
                    key={userId}
                    containerStyle={myStyles.alarmItem}
                    title={nickname}
                    rightElement={
                      requestedInfo ?
                        <Text>{getTypeKorName(requestedInfo.type)} 요청 대기중</Text>
                        :
                        <Button
                          title={`${typeKorName} 요청`}
                          titleStyle={{fontSize: 14, fontWeight: 'bold'}}
                          buttonStyle={{
                            height: 25,
                            paddingVertical: 0,
                            backgroundColor: typeKorName === '커플' ? '#F5A9D0' : '#58ACFA',
                          }}
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
