import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import LoginScreen from './screens/Login/LoginScreen';
import ListScreen from './screens/List/ListScreen';
import RecordScreen from './screens/Record/RecordScreen';
import StatsScreen from './screens/Stats/StatsScreen';
import MapScreen from './screens/Map/MapScreen';
import MyScreen from './screens/My/MyScreen';
import {Text} from 'react-native';

const makeTabBarLabel = title => ({focused}) =>
  <Text style={{color: focused ? '#000' : '#A4A4A4', fontSize: 11}}>
    {title}
  </Text>;

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={
        ({route}) => ({
          tabBarIcon({focused}) {
            let type = 'ionicon';
            let name;
            switch (route.name) {
              case 'List':
                name = 'ios-list';
                break;
              case 'Map':
                type = 'material-community';
                name = 'map-outline';
                break;
              case 'Record':
                name = 'ios-add-circle-outline';
                break;
              case 'Stats':
                name = 'ios-stats';
                break;
              case 'My':
                type = 'feather';
                name = 'user';
                break;
              default:
                console.error('없는 탭 이름 입니다.');
            }
            
            return (
              <Icon
                type={type}
                name={name}
                size={30}
                color={focused ? '#000' : '#A4A4A4'}
              />
            );
          },
        })
      }
      tabBarOptions={{style: {backgroundColor: '#FAFAFA'}}}
      initialRouteName='Record'
    >
      <Tab.Screen name='List' component={ListScreen} options={{tabBarLabel: makeTabBarLabel('목록')}}/>
      <Tab.Screen name='Map' component={MapScreen} options={{tabBarLabel: makeTabBarLabel('지도')}}/>
      <Tab.Screen name='Record' component={RecordScreen} options={{tabBarLabel: makeTabBarLabel('등록')}}/>
      <Tab.Screen name='Stats' component={StatsScreen} options={{tabBarLabel: makeTabBarLabel('통계')}}/>
      <Tab.Screen name='My' component={MyScreen} options={{tabBarLabel: makeTabBarLabel('내정보')}}/>
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
