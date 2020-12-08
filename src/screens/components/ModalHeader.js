import React from 'react';
import {Icon} from 'react-native-elements';
import {StyleSheet, Text, View} from 'react-native';

function ModalHeader({title, close, RightComponent}) {
  return (
    <View style={styles.container}>
      <Icon
        type='font-awesome-5'
        name='chevron-left'
        size={20}
        onPress={close}
      />
      <Text style={styles.title}>{title}</Text>
      {
        RightComponent || <View style={styles.empty}/>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {fontSize: 18, fontWeight: 'bold'},
  empty: {width: 20},
});

export default ModalHeader;
