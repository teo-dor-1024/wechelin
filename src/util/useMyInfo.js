import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

function useMyInfo() {
  const [id, setId] = useState('');
  const [nickName, setNickName] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const getMyInfo = async () => {
      setId(await AsyncStorage.getItem('id'));
      setNickName(await AsyncStorage.getItem('nickname'));
      setAccessToken(await AsyncStorage.getItem('token'));
    };

    getMyInfo();
  }, []);

  return {id, nickName, accessToken};
}

export default useMyInfo;
