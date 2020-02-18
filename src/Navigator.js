import React from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/Record/RecordScreen';
import StatsScreen from './screens/StatsScreen';

IonIcons.loadFont();

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon({focused}) {
          let name;
          switch (route.name) {
            case 'Home':
              name = 'ios-home';
              break;
            case 'Record':
              name = 'ios-add-circle-outline';
              break;
            case 'Stats':
              name = 'ios-stats';
              break;
            default:
              console.error('없는 탭 이름 입니다.');
          }
          
          return (
            <IonIcons
              name={name}
              size={32}
              color={focused ? '#2E2E2E' : '#BDBDBD'}
            />
          );
        },
      })}
      tabBarOptions={{
        showLabel: false,
      }}
      initialRouteName='Record'
    >
      <Tab.Screen name='Home' component={HomeScreen}/>
      <Tab.Screen name='Record' component={RecordScreen}/>
      <Tab.Screen name='Stats' component={StatsScreen}/>
    </Tab.Navigator>
  );
}

const Stack = createStackNavigator();

function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode='none'>
        <Stack.Screen name='LoginScreen' component={LoginScreen}/>
        <Stack.Screen name='TabNavigator' component={TabNavigator}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
