import React from 'react';
import {StatusBar} from 'react-native';
import useMyInfo from '../util/useMyInfo';
import {WebView} from 'react-native-webview';

function StatsScreen() {
  const {id} = useMyInfo();

  if (!id) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <WebView
        source={{uri: 'http://192.168.0.15:8000/wechelin/stats'}}
        style={{marginTop: 40}}
        useWebKit={true}
        injectedJavaScriptBeforeContentLoaded={`sessionStorage.setItem('me', '${JSON.stringify({myId: id})}'); true;`}
        onMessage={e => console.log(e.nativeEvent.data)}
      />
    </>
  );
}

export default StatsScreen;
