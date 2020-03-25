import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Button, Icon, ListItem, SearchBar, Text} from 'react-native-elements';
import {Dimensions, SafeAreaView, ScrollView, View} from 'react-native';

const GET_MY_FRIENDS = gql`
  query ($userId: String!, $keyword: String) {
    myFriends(userId: $userId, keyword: $keyword) {
      userId
      nickname
      coupleId
      friends
    }
  }
`;

function UserList({userId, setIsVisibleModal}) {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const {loading, error, data} = useQuery(GET_MY_FRIENDS, {
    variables: {
      keyword, userId
    }
  });
  
  const {height} = Dimensions.get('window');
  
  return (
    <SafeAreaView>
      <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
        <View style={{alignItems: 'flex-end', marginHorizontal: 10}}>
          <Icon
            type='antdesign'
            name='close'
            size={25}
            onPress={() => setIsVisibleModal(false)}
          />
        </View>
        <View style={{flexDirection: 'row', marginHorizontal: 10, alignItems: 'center'}}>
          <Icon type='feather' name='user-plus' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            친구 핀 추가하기
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
          cancelButtonProps={{buttonStyle: {marginLeft: 10, height: 35}}}
        />
        <ScrollView style={{marginHorizontal: 10, height: height - 230}}>
          {
            loading ?
              <Text> 유저 검색 중 ...</Text>
              :
              error ?
                <Text> 유저 찾다가 에러 발생!! {error.toString()}</Text>
                :
                data.myFriends.map(({userId, nickname}) => {
                  return (
                    <ListItem
                      key={userId}
                      title={nickname}
                      containerStyle={{paddingVertical: 10, paddingHorizontal: 5}}
                      rightElement={
                        <Button
                          title='추가하기'
                          titleStyle={{fontSize: 14, fontWeight: 'bold'}}
                          buttonStyle={{
                            height: 25,
                            paddingVertical: 0,
                            backgroundColor: '#58ACFA',
                          }}
                        />
                      }
                    />
                  );
                })
          }
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default UserList;
