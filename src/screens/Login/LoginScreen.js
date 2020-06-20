import React, {useEffect, useState} from 'react';
import {Platform, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import KakaoLogins from '@react-native-seoul/kakao-login';
import appleAuth, {
  AppleAuthCredentialState,
  AppleAuthRequestOperation,
  AppleAuthRequestScope
} from '@invertase/react-native-apple-authentication';
import RegisterForm from "./RegisterForm";
import {viewHeight} from "../../../App";

const ENROLL_USER = gql`
  mutation ($userId: String!, $nickname: String) {
    createUser(userId: $userId, nickname: $nickname)
  }
`;

function LoginScreen({navigation}) {
  const [isVisible, setIsVisible] = useState(false);
  const [createUser] = useMutation(ENROLL_USER);
  
  useEffect(() => {
    const getToken = async () => {
      const id = await AsyncStorage.getItem('id');
      id && await navigation.replace('TabNavigator');
    };
    
    getToken();
  }, []);
  
  const login = async ({id, nickname, accessToken}) => {
    if (await createUser({variables: {userId: id, nickname}})) {
      await AsyncStorage.multiSet([['token', accessToken], ['id', id], ['nickname', nickname]]);
      await navigation.navigate('TabNavigator');
    } else {
      alert('회원가입 오류!!');
    }
  };
  
  const onClickApple = async () => {
    try {
      const {fullName: {familyName, givenName}, user, identityToken} = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [AppleAuthRequestScope.FULL_NAME],
      });
      
      const credentialState = await appleAuth.getCredentialStateForUser(user);
      
      if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        const existed = await AsyncStorage.getItem('appleNickname');
        const nickname = existed || `${familyName}${givenName}`;
        await AsyncStorage.setItem('appleNickname', nickname);
        await login({id: user, nickname, accessToken: identityToken});
      }
    } catch (error) {
      if (!error.message.includes("1001")) {
        console.error(error);
      }
    }
  };
  
  const onClickKakao = async () => {
    try {
      const {accessToken} = await KakaoLogins.login();
      const {id, nickname} = await KakaoLogins.getProfile();
      
      await login({id, nickname, accessToken});
    } catch (error) {
      if (!error.message.includes('The operation is cancelled')) {
        console.error(error.message);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={{
          ...styles.title,
          marginTop: viewHeight > 750 ? 120 : 80,
        }}
      >
        Wechelin!
      </Text>
      <Text style={styles.desc}>위슐랭, 우리만의 맛집 지도 만들기</Text>
      <View style={{marginTop: viewHeight > 830 ? 330 : viewHeight > 660 ? 250 : 170}}>
        {
          Platform.OS === 'ios' &&
          <Button
            title='Apple로 로그인'
            titleStyle={{color: 'black', fontWeight: 'bold', marginLeft: 5}}
            icon={<Icon type='ionicon' name='logo-apple' size={20}/>}
            buttonStyle={styles.btnLogin}
            containerStyle={{marginBottom: 10}}
            onPress={onClickApple}
          />
        }
        <Button
          title='Kakao로 로그인'
          titleStyle={{color: '#513302', fontWeight: 'bold', marginLeft: 5}}
          icon={<Icon type='ionicon' name='ios-chatbubbles' size={18} color='#513302'/>}
          buttonStyle={styles.btnLogin}
          containerStyle={{marginBottom: 10}}
          onPress={onClickKakao}
        />
        <Button
          title='Guest로 로그인'
          titleStyle={{color: '#6E6E6E', fontWeight: 'bold', marginLeft: 5}}
          icon={<Icon type='font-awesome' name='user-circle' size={16} color='#6E6E6E'/>}
          buttonStyle={styles.btnLogin}
          onPress={() => setIsVisible(true)}
        />
      </View>
      
      <RegisterForm
        isVisible={isVisible}
        close={() => setIsVisible(false)}
        login={login}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
  },
  title: {
    fontSize: 34,
    color: '#FFA7C4',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  btnLogin: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 60,
    backgroundColor: '#FFF',
  },
});

export default LoginScreen;
