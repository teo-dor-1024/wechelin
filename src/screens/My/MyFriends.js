import React from 'react';
import {Alert, ScrollView, TouchableOpacity, View} from "react-native";
import {Button, Icon, Text} from "react-native-elements";
import {myStyles} from "./MyScreen";

function MyFriends({myFriends, openSearchForm, unFollow}) {
  return (
    <>
      <View style={myStyles.titleContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon type='feather' name='users' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            친구들
          </Text>
        </View>
        <TouchableOpacity style={myStyles.toolContainer} onPress={openSearchForm}>
          <Icon
            name='md-add'
            type='ionicon'
            size={20}
            color='#0080FF'
          />
          <Text style={{marginLeft: 5, color: '#0080FF', fontWeight: 'bold'}}>친구찾기</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{paddingBottom: 70}} showsVerticalScrollIndicator={false}>
        {
          myFriends.length ?
            myFriends.map(({userId, nickname}) => (
              <View key={userId} style={myStyles.titleContainer}>
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
                        onPress: () => unFollow(userId, nickname),
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
    </>
  );
}

export default MyFriends;
