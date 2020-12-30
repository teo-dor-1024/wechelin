import React, {useEffect, useState} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import KakaoLogins from '@react-native-seoul/kakao-login';
import appleAuth, {
  AppleAuthCredentialState,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import RegisterForm from './RegisterForm';

const viewHeight = Dimensions.get('window').height;
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
      <View style={{marginTop: viewHeight > 750 ? 120 : 80}}>
        <Text style={styles.title}>
          내돈어디
        </Text>
        <Text style={styles.subtitle}>
          같이 작성하는 커플 가계부
        </Text>
      </View>
      <View style={{marginTop: viewHeight > 830 ? 300 : viewHeight > 660 ? 250 : 200}}>
        <Button
          title='Apple로 로그인'
          titleStyle={{color: '#FFF', fontWeight: 'bold', marginLeft: 5}}
          icon={<Icon type='ionicon' name='logo-apple' size={20} color='#FFF'/>}
          buttonStyle={{...styles.btnLogin, backgroundColor: '#000'}}
          containerStyle={{marginBottom: 10}}
          onPress={onClickApple}
        />
        <Button
          title='Kakao로 로그인'
          titleStyle={{color: '#3A1D1D', fontWeight: 'bold', marginLeft: 5}}
          icon={<Icon type='ionicon' name='ios-chatbubbles' size={18} color='#3A1D1D'/>}
          buttonStyle={{...styles.btnLogin, backgroundColor: '#fef01b'}}
          containerStyle={{marginBottom: 10}}
          onPress={onClickKakao}
        />
        <Button
          title='Guest로 로그인'
          titleStyle={{color: '#FFF', fontWeight: 'bold', marginLeft: 5}}
          icon={<Icon type='font-awesome' name='user-circle' size={16} color='#FFF'/>}
          buttonStyle={{...styles.btnLogin, backgroundColor: '#6E6E6E'}}
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
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 40,
    color: '#d23669',
    fontFamily: 'Verdana-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    color: '#222',
    fontFamily: 'Verdana-Bold',
    textAlign: 'center',
    marginTop: 10,
  },
  btnLogin: {
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 70,
  },
});

export default LoginScreen;
