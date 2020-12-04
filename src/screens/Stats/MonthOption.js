import React from 'react';
import {Icon, Text} from 'react-native-elements';
import {TouchableOpacity} from 'react-native';
import {format, isSameMonth} from 'date-fns';

function MonthOption({date, now, setNow}) {
  return (
    <TouchableOpacity
      style={{
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
      }}
      onPress={() => setNow(date)}
    >
      <Text style={{fontSize: 16}}>{!date ? '전체' : format(date, 'yyyy년 M월')}</Text>
      {
        (now ? isSameMonth(now, date) : !date) &&
        <Icon type='ionicon' name='ios-checkmark' size={30} color='#d23669'/>
      }
    </TouchableOpacity>
  );
}

export default MonthOption;
