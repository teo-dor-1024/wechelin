import React from 'react';
import {StatusBar} from 'react-native';
import {WebView} from 'react-native-webview';
import useMyInfo from '../util/useMyInfo';

function HomeScreen() {
  const {id} = useMyInfo();

  if (!id) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <WebView
        // source={{uri: 'http://192.168.1.101:8000/wechelin'}}
        source={{uri: 'http://192.168.219.121:8000/wechelin'}}
        style={{marginTop: 40}}
        useWebKit={true}
        injectedJavaScriptBeforeContentLoaded={`sessionStorage.setItem('me', '${JSON.stringify({myId: id})}'); true;`}
        onMessage={e => console.log(e.nativeEvent.data)}
      />
    </>
  );
}

export default HomeScreen;
