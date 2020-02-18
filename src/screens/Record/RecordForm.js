import React, {useState} from 'react';
import {View} from 'react-native';
import {Input} from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import {containerStyle} from './RecordScreen';

const styles = {
  recordForm: {
    padding: 15,
  },
};

function RecordForm({route}) {
  const {selectedIdx} = route.params;
  const [placeRecord, setPlaceRecord] = useState({
    visitedDate: new Date(),
    menus: [],
    money: 0,
    score: 0,
    isDutch: true,
  });
  
  return (
    <View style={containerStyle}>
      {
        selectedIdx !== -1 && (
          <View style={styles.recordForm}>
            <DateTimePicker
              testID='dateTimePicker'
              timeZoneOffsetInMinutes={0}
              display='default'
              value={placeRecord.visitedDate}
              onChange={(e, visitedDate) => setPlaceRecord({...placeRecord, visitedDate})}
              is24Hour
            />
            <Input
              placeholder='메뉴를 입력하세요'
              label='메뉴'
            />
            <Input
              placeholder='금액을 입력하세요'
              label='금액'
            />
          
          </View>
        )
      }
    </View>
  );
}

export default RecordForm;
