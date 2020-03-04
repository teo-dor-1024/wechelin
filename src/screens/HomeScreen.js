import React from 'react';
import {WebView} from 'react-native-webview';
import useMyInfo from '../util/useMyInfo';

function HomeScreen() {
  const {id} = useMyInfo();
  
  if (!id) {
    return null;
  }
  
  return (
    <WebView
      source={{uri: 'http://192.168.0.15:8000/wechelin'}}
      style={{marginTop: 40}}
      useWebKit={true}
      injectedJavaScriptBeforeContentLoaded={`sessionStorage.setItem('me', '${JSON.stringify({myId: id})}'); true;`}
      onMessage={e => console.log(e.nativeEvent.data)}
    />
  );
}

export default HomeScreen;
