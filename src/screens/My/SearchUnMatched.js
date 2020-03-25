import React, {useState} from 'react';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Button, ListItem, Text} from 'react-native-elements';
import UserSearchForm from "../components/UserSearchForm";

const GET_USERS = gql`
  query ($keyword: String, $userId: String!, $alarm: Boolean, $type: String!, $completed: Boolean) {
    unMatchedUsers(userId: $userId, keyword: $keyword, type: $type) {
      userId
      nickname
      coupleId
      friends
    }

    requestedAlarms(applicantId: $userId, alarm: $alarm, completed: $completed) {
      _id
      targetId
      targetName
      type
      result
      completed
    }
  }
`;

export const getTypeKorName = type => type === 'couple' ? '커플' : '친구';

function SearchUnMatched({userId, setTargetInfo, searchType, setIsVisibleModal}) {
  const typeKorName = getTypeKorName(searchType);
  const [keyword, setKeyword] = useState('');
  const {loading, error, data} = useQuery(GET_USERS, {
    variables: {
      keyword, userId, alarm: false, type: searchType, completed: false
    }
  });
  
  return (
    <UserSearchForm
      close={() => setIsVisibleModal(false)}
      title={`${searchType === 'couple' ? '커플' : '친구들'} 찾기`}
      setKeyword={setKeyword}
    >
      {
        loading ?
          <Text> 유저 검색 중 ...</Text>
          :
          error ?
            <Text> 유저 찾다가 에러 발생!! {error.toString()}</Text>
            :
            data.unMatchedUsers.map(({userId, nickname}) => {
              const requestedInfo = data.requestedAlarms.find(matching => matching.targetId === userId);
              if (requestedInfo && requestedInfo.type !== searchType) {
                return null;
              }
              
              return (
                <ListItem
                  key={userId}
                  title={nickname}
                  containerStyle={{paddingVertical: 10, paddingHorizontal: 5}}
                  rightElement={
                    requestedInfo ?
                      <Text style={{height: 25, lineHeight: 25}}>요청 수락 대기중</Text>
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
    </UserSearchForm>
  );
}

export default SearchUnMatched;
