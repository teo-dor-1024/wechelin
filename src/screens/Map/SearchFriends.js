import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Button, ListItem, Text} from 'react-native-elements';
import UserSearchForm from "../components/UserSearchForm";

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

function SearchFriends({userId, close, setFriendId}) {
  const [keyword, setKeyword] = useState('');
  const {loading, error, data} = useQuery(GET_MY_FRIENDS, {
    variables: {
      keyword, userId
    }
  });
  
  return (
    <UserSearchForm
      close={close}
      title='친구 핀 추가하기'
      description={
        <Text style={{marginTop: 10, fontSize: 16, paddingHorizontal: 10, color: '#FA5858', fontWeight: 'bold'}}>
          친구의 기록은 한 명씩만 볼 수 있습니다.
        </Text>
      }
      setKeyword={setKeyword}
    >
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
                      onPress={() => {
                        setFriendId(userId);
                        close();
                      }}
                    />
                  }
                />
              );
            })
      }
    </UserSearchForm>
  );
}

export default SearchFriends;
