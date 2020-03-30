import React, {useContext} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {Button, Icon} from 'react-native-elements';
import {RecordContext} from './RecordScreen';
import {FOCUS_PLACE, SET_ADD_PIN_INFO} from '../../reducers/searchReducer';
import {StyleSheet} from "react-native";

function Map({setGoUserPosition}) {
  const {
    state: {
      region, places, addPinMode, addPinInfo,
    },
    dispatch,
  } = useContext(RecordContext);
  
  return (
    <>
      <Button
        containerStyle={styles.toolContainer}
        buttonStyle={styles.btnGoUser}
        icon={<Icon type='feather' name='navigation' size={23}/>}
        onPress={() => setGoUserPosition(true)}
      />
      <MapView
        style={{flex: 1}}
        region={region}
        onPress={({nativeEvent: {coordinate}}) => addPinMode && dispatch([SET_ADD_PIN_INFO, {...coordinate}])}
        showsUserLocation
      >
        {
          places.map(({id, name, latitude, longitude}, index) =>
            <Marker
              key={id}
              title={name}
              coordinate={{latitude, longitude}}
              onPress={
                ({
                   nativeEvent: {
                     coordinate: {latitude, longitude},
                   },
                 }) => dispatch([FOCUS_PLACE, {
                  index,
                  latitude,
                  longitude,
                }])
              }
            />,
          )
        }
        {
          addPinInfo.latitude ?
            <Marker coordinate={{...addPinInfo}}/>
            :
            null
        }
      </MapView>
    </>
  );
}

const styles = StyleSheet.create({
  toolContainer: {
    position: 'absolute',
    zIndex: 99,
    right: 15,
    top: 45
  },
  btnGoUser: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: '#D8D8D8',
    borderWidth: 1,
  },
});

export default Map;
