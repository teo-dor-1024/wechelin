import React from 'react';
import {Dimensions, Modal, Picker, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Button, Divider} from "react-native-elements";

function ScorePicker({score, onChange, isVisible, close}) {
  const {height} = Dimensions.get('window');
  
  return (
    <Modal
      animationType="fade"
      visible={isVisible}
      transparent
    >
      <SafeAreaView style={{backgroundColor: 'rgba(52, 52, 52, 0.6)', height}}>
        <TouchableOpacity
          style={{height: 400}}
          onPress={close}
        />
        <View style={styles.scorePicker}>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.title}>
              점수를 선택하세요
            </Text>
          </View>
          <Divider/>
          <Picker
            selectedValue={score}
            onValueChange={onChange}
          >
            <Picker.Item label="5점" value={5}/>
            <Picker.Item label="4점" value={4}/>
            <Picker.Item label="3점" value={3}/>
            <Picker.Item label="2점" value={2}/>
            <Picker.Item label="1점" value={1}/>
            <Picker.Item label="전체" value={0}/>
          </Picker>
          <Divider/>
          <Button
            title='완료'
            titleStyle={{fontSize: 20}}
            type='clear'
            containerStyle={styles.btnScoreDone}
            buttonStyle={{margin: 0, padding: 0}}
            onPress={close}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: '#848484',
    marginVertical: 12
  },
  scorePicker: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  btnScoreDone: {
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default ScorePicker;