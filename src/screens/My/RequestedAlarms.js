import React, {useEffect, useState} from 'react';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {View} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {getTypeKorName} from './SearchUnMatched';

const OFF_ALARM = gql`
  mutation ($_id: ID!) {
    offAlarm(_id: $_id)
  }
`;

function RequestedAlarms({requestedAlarms = []}) {
  const [alarms, setAlarms] = useState(requestedAlarms);
  
  const [offAlarm] = useMutation(OFF_ALARM);
  const [offAlarmId, setOffAlarmId] = useState('');
  
  useEffect(() => {
    const off = async () => {
      const result = await offAlarm({variables: {_id: offAlarmId}});
      !result && alert('알람 끄기 중 에러 발생');
      
      setOffAlarmId('');
      setAlarms(alarms.filter(({_id}) => _id !== offAlarmId));
    };
    
    offAlarmId && off();
  }, [offAlarmId]);
  
  return (
    <View>
      {
        alarms.map(({_id, targetId, targetName, result, type}, i) =>
          i < 2 && (
            <ListItem
              key={_id}
              containerStyle={{
                marginBottom: 5,
                paddingVertical: 10,
              }}
              title={`${targetName}님이 ${getTypeKorName(type)} 요청을 ${result === 'reject' ? '거절' : '수락'}하셨습니다.`}
              titleStyle={{fontSize: 14}}
              rightIcon={
                <Icon
                  type='material'
                  name='clear'
                  size={20}
                  color='#B43104'
                  onPress={() => setOffAlarmId(_id)}
                />
              }
            />
          ))
      }
    </View>
  );
}

export default RequestedAlarms;
