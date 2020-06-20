import React from 'react';
import {Alert, TouchableOpacity, View} from "react-native";
import {Button, Icon, Text} from "react-native-elements";
import {myStyles} from "./MyScreen";

function MyLover({myLover, crushedName, openSearchForm, breakUp}) {
  return (
    <>
      <View style={myStyles.titleContainer}>
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
            <TouchableOpacity style={myStyles.toolContainer} onPress={openSearchForm}>
              <Icon
                name='md-add'
                type='ionicon'
                size={20}
                color='#0080FF'
              />
              <Text style={{marginLeft: 5, color: '#0080FF', fontWeight: 'bold'}}>커플찾기</Text>
            </TouchableOpacity>
        }
      </View>
      <View style={{...myStyles.titleContainer, marginBottom: 40}}>
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
                      onPress: breakUp,
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
    </>
  );
}

export default MyLover;