import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

function useMyInfo() {
  const [id, setId] = useState('');
  const [nickName, setNickName] = useState('');

  useEffect(() => {
    const getMyInfo = async () => {
      setId(await AsyncStorage.getItem('id'));
      setNickName(await AsyncStorage.getItem('nickname'));
    };

    getMyInfo();
  }, []);

  return {id, nickName};
}

export default useMyInfo;
