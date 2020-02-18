import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import KakaoLogins from '@react-native-seoul/kakao-login';

function LoginScreen({navigation}) {
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
      await AsyncStorage.multiSet([['token', accessToken], ['id', id], ['nickname', nickname]]);
      navigation.replace('TabNavigator');
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>우리가 정하는 맛집 랭킹, 위슐랭</Text>
      <TouchableOpacity onPress={onClickLogin}>
        <Text style={styles.loginButton}>로그인</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    marginBottom: 150,
  },
  loginButton: {
    fontSize: 25,
    marginBottom: 300,
  },
});

export default LoginScreen;
