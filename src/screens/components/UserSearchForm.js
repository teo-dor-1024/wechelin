import React, {useState} from 'react';
import {Dimensions, SafeAreaView, ScrollView, View} from "react-native";
import {Icon, SearchBar, Text} from "react-native-elements";

function UserSearchForm({close, title, setKeyword, children, placeholder = '검색'}) {
  const {height} = Dimensions.get('window');
  const [text, setText] = useState('');
  
  return (
    <SafeAreaView>
      <View style={{paddingHorizontal: 20, paddingVertical: 10}}>
        <View style={{alignItems: 'flex-end', marginHorizontal: 10}}>
          <Icon
            type='antdesign'
            name='close'
            size={25}
            onPress={close}
          />
        </View>
        <View style={{flexDirection: 'row', marginHorizontal: 10, alignItems: 'center'}}>
          <Icon type='feather' name='user-plus' size={25}/>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            {title}
          </Text>
        </View>
        <SearchBar
          platform='ios'
          containerStyle={{backgroundColor: '#FFF'}}
          inputContainerStyle={{backgroundColor: '#E6E6E6'}}
          inputStyle={{fontSize: 16}}
          placeholder={placeholder}
          value={text}
          onChangeText={text => setText(text)}
          onSubmitEditing={() => setKeyword(text)}
          onClear={() => {
            setText('');
            setKeyword('');
          }}
          cancelButtonTitle='취소'
          cancelButtonProps={{buttonStyle: {marginLeft: 10, height: 35}}}
        />
        <ScrollView style={{marginHorizontal: 10, height: height - 230}}>
          {
            children
          }
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default UserSearchForm;