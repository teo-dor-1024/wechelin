import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {Button, ListItem} from 'react-native-elements';
import {myStyles} from './MyScreen';

const styles = {
  alarmButton: {
    height: 23,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 0,
    paddingBottom: 0,
  }
};

const DECIDE_ALARM = gql`
  mutation ($_id: ID!, $result: String!, $type: String!, $myId: String!, $applicantId: String!) {
    decideAlarm(_id: $_id, result: $result, type: $type, myId: $myId, applicantId: $applicantId)
  }
`;

const initDecideInfo = {_id: '', result: '', myId: '', applicantId: ''};

function ReceivedAlarms({myId, receivedAlarms = [], refetch}) {
  const [alarms, setAlarms] = useState(receivedAlarms);
  
  const [decideAlarm] = useMutation(DECIDE_ALARM);
  const [decideInfo, setDecideInfo] = useState(initDecideInfo);
  
  useEffect(() => {
    const decide = async () => {
      const result = await decideAlarm({variables: decideInfo});
      
      alert(result ? '요청이 처리되었습니다.' : '요청이 처리되지 않았습니다.');
      
      setDecideInfo({...initDecideInfo});
      setAlarms(alarms.filter(({_id}) => _id !== decideInfo._id));
    };
    
    decideInfo._id && decide();
  }, [decideInfo._id]);
  
  useEffect(() => {
    !alarms.length && refetch();
  }, [alarms.length]);
  
  return (
    <View>
      {
        alarms.map(({_id, applicantId, applicantName}, i) =>
          i < 2 && (
            <ListItem
              key={_id}
              containerStyle={myStyles.alarmItem}
              title={`${applicantName}님이 우리가 커플이라는데요?`}
              titleStyle={{fontSize: 14}}
              rightElement={
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Button
                    title='맞아'
                    titleStyle={{fontSize: 13, fontWeight: 'bold'}}
                    containerStyle={{marginRight: 5}}
                    buttonStyle={styles.alarmButton}
                    onPress={() => setDecideInfo({_id, result: 'accept', type, myId, applicantId})}
                  />
                  <Button
                    title='아닌데'
                    titleStyle={{fontSize: 13, fontWeight: 'bold'}}
                    buttonStyle={{...styles.alarmButton, backgroundColor: '#DF3A01'}}
                    onPress={() => setDecideInfo({_id, result: 'reject', type, myId, applicantId})}
                  />
                </View>
              }
            />
          ))
      }
    </View>
  );
}

export default ReceivedAlarms;
