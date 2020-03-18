import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import LoginScreen from './screens/Login/LoginScreen';
import ListScreen from './screens/List/ListScreen';
import SearchScreen from './screens/Search/SearchScreen';
import StatsScreen from './screens/Stats/StatsScreen';
import MapScreen from './screens/Map/MapScreen';
import MyScreen from './screens/My/MyScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
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
      <Tab.Screen name='List' component={ListScreen}/>
      <Tab.Screen name='Map' component={MapScreen}/>
      <Tab.Screen name='Record' component={SearchScreen}/>
      <Tab.Screen name='Stats' component={StatsScreen}/>
      <Tab.Screen name='My' component={MyScreen}/>
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
