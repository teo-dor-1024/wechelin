import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import KakaoLogins from '@react-native-seoul/kakao-login';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';

const ENROLL_USER = gql`
  mutation ($userId: String!, $nickname: String) {
    createUser(userId: $userId, nickname: $nickname)
  }
`;

function LoginScreen({navigation}) {
  const [createUser] = useMutation(ENROLL_USER);
  
  useEffect(() => {
    const getToken = async () => {
      const id = await AsyncStorage.getItem('id');
      id && navigation.replace('TabNavigator');
    };
    getToken();
  });
  
  const onClickLogin = async () => {
    try {
      const {accessToken} = await KakaoLogins.login();
      const {id, nickname} = await KakaoLogins.getProfile();
      
      if (await createUser({variables: {userId: id, nickname}})) {
        await AsyncStorage.multiSet([['token', accessToken], ['id', id], ['nickname', nickname]]);
        navigation.navigate('TabNavigator');
      } else {
        alert('회원가입 오류!!');
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Wechelin!</Text>
      <Text style={styles.desc}>위슐랭, 우리만의 맛집 지도 만들기</Text>
      <TouchableOpacity onPress={onClickLogin}>
        <Text style={styles.loginButton}>시작하기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#282c35',
  },
  title: {
    marginTop: 120,
    fontSize: 34,
    color: '#ffa7c4',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  loginButton: {
    fontSize: 25,
    marginTop: 200,
    color: '#ffa7c4',
  },
});

export default LoginScreen;
