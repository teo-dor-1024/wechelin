import React, {useState} from 'react';
import {Button, Header, Icon, Input} from "react-native-elements";
import {Dimensions, Modal, Text, View} from "react-native";
import {getUniqueId} from 'react-native-device-info';

function RegisterForm({isVisible, close, login}) {
  const {width} = Dimensions.get('window');
  const [nickname, setNickname] = useState('');
  
  const onClickLogin = async () => {
    const id = await getUniqueId();
    await login({id, nickname, accessToken: id});
    close();
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType='slide'
    >
      <View style={{alignItems: 'center', paddingHorizontal: 20}}>
        <Header
          centerComponent={{text: 'Guest로 로그인', style: {fontSize: 18, fontWeight: 'bold'}}}
          rightComponent={{
            text: '취소',
            onPress: () => {
              setNickname('');
              close();
            },
          }}
          backgroundColor='#FFF'
        />
        <Input
          containerStyle={{marginTop: 40}}
          inputStyle={{fontSize: 14}}
          placeholder='닉네임'
          placeholderTextColor='#6E6E6E'
          value={nickname}
          onChangeText={text => setNickname(text)}
          onSubmitEditing={onClickLogin}
        />
        <View style={{flexDirection: 'row', marginTop: 40, alignItems: 'center'}}>
          <Icon type='feather' name='info' size={20} color='#6E6E6E'/>
          <Text style={{marginLeft: 10, fontSize: 16, color: '#6E6E6E'}}>
            닉네임은 친구, 커플 연결 시 검색에 사용됩니다.
          </Text>
        </View>
        <Button
          title='시작하기'
          titleStyle={{fontSize: 16, color: '#FFF', fontWeight: 'bold'}}
          containerStyle={{marginTop: 40}}
          buttonStyle={{width: width - 50, paddingVertical: 10, borderRadius: 5}}
          onPress={onClickLogin}
        />
      </View>
    </Modal>
  );
}

export default RegisterForm;