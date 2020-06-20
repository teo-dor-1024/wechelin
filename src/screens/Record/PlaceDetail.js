import React, {useContext} from 'react';
import {Button, Icon, ListItem} from 'react-native-elements';
import {WebView} from 'react-native-webview';
import {RecordContext} from './RecordScreen';
import {SLIDE_TOP, slideShowFormat} from "./SearchPanel";

function PlaceDetail({setAllowDrag, setTab, slideRef}) {
  const {state: {places, selectedIndex}} = useContext(RecordContext);
  const {name, url} = places[selectedIndex];
  
  return (
    <>
      <ListItem
        title={`${name}`}
        titleStyle={{fontSize: 22, fontWeight: 'bold'}}
        subtitle="카카오맵 정보"
        subtitleStyle={{color: '#424242'}}
        rightIcon={
          <Icon
            type='ionicon'
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
          slideRef.current.show(slideShowFormat(SLIDE_TOP));
          setAllowDrag(false);
        }}
      />
      <WebView
        source={{uri: url}}
        containerStyle={{marginTop: 10}}
        style={{marginTop: -35}}
        onTouchStart={() => setAllowDrag(false)}
        onTouchEnd={() => setAllowDrag(true)}
        onTouchCancel={() => setAllowDrag(true)}
      />
    </>
  );
}

export default PlaceDetail;
