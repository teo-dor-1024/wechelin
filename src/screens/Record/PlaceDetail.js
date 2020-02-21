import React, {useContext} from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {Button, ListItem} from 'react-native-elements';
import {WebView} from 'react-native-webview';
import {RecordContext} from './RecordScreen';
import {SET_SLIDE_POSITION} from '../../reducers/RecordReducer';

function PlaceDetail({setAllowDrag, setTab, SLIDE_TOP}) {
  const {state: {places, selectedIndex}, dispatch} = useContext(RecordContext);
  const {name, url} = places[selectedIndex];
  
  return (
    <>
      <ListItem
        title={`${name}`}
        titleStyle={{fontSize: 22, fontWeight: 'bold'}}
        subtitle="카카오맵 정보"
        subtitleStyle={{color: '#424242'}}
        rightIcon={
          <IonIcons
            name='ios-close-circle-outline'
            size={30}
            color='#848484'
            onPress={() => setTab('SearchForm')}
          />
        }
      />
      <Button
        title="기록하기"
        titleStyle={{fontWeight: 'bold'}}
        onPress={() => {
          setTab('RecordForm');
          dispatch([SET_SLIDE_POSITION, SLIDE_TOP]);
        }}
      />
      <WebView
        source={{uri: url}}
        containerStyle={{marginTop: 10}}
        style={{marginTop: -35}}
        onToonTouchStart={() => setAllowDrag(false)}
        onTouchEnd={() => setAllowDrag(true)}
        onTouchCancel={() => setAllowDrag(true)}
      />
    </>
  );
}

export default PlaceDetail;
