import React from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {Icon, Text} from 'react-native-elements';
import RBSheet from 'react-native-raw-bottom-sheet';

function BottomSelect({slide, height, title, children}) {
  return (
    <RBSheet
      ref={slide}
      closeOnDragDown={false}
      height={height || Dimensions.get('window').height - 200}
      customStyles={{container: styles.modalContainer}}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Icon
          type='ionicon' name='ios-close' color='#A4A4A4' size={30}
          onPress={() => slide.current.close()}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {
          children
        }
      </ScrollView>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  modalHeader: {
    marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold'},
});

export default BottomSelect;
