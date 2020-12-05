import React, {useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {Button, Icon} from 'react-native-elements';
import {Dimensions, StyleSheet, View} from 'react-native';

function Map({region, setRegion, setGoUser, places}) {
  useEffect(() => {
    if (!places?.length) {
      return;
    }
    
    setRegion({
      ...region,
      latitude: places[0].latitude,
      longitude: places[0].longitude,
    });
  }, [places]);
  
  return (
    <View style={styles.container}>
      <Button
        containerStyle={styles.goToUserContainer}
        buttonStyle={styles.userButton}
        icon={<Icon type='font-awesome-5' name='location-arrow' size={18} color='#d23669'/>}
        onPress={() => setGoUser(true)}
      />
      <MapView
        style={{...Dimensions.get('window')}}
        region={region}
        showsUserLocation
      >
        {
          places.map(({id, name, latitude, longitude}) => (
            <Marker
              key={id} title={name}
              coordinate={{latitude, longitude}}
              onPress={() => setRegion({...region, latitude, longitude})}
            />
          ))
        }
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  goToUserContainer: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    position: 'absolute',
    zIndex: 99,
    right: 10,
    top: 60,
  },
  userButton: {
    backgroundColor: '#FFF',
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 0,
  },
});

export default Map;
