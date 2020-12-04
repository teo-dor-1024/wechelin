import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';

function CategoryOption({label, icon, category, setCategory}) {
  return (
    <TouchableOpacity key={label} style={styles.categoryButton} onPress={() => setCategory(label)}>
      <View style={styles.category}>
        <View style={{width: 40}}>
          <Icon name={icon} type='font-awesome-5' size={25} color='#F5A9D0'/>
        </View>
        <Text style={styles.categoryLabel}>{label}</Text>
      </View>
      {
        category === label && <Icon type='ionicon' name='ios-checkmark' size={40} color='#d23669'/>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
  },
  category: {flexDirection: 'row', alignItems: 'center'},
  categoryLabel: {marginTop: 5, marginLeft: 15, fontWeight: 'bold', color: '#848484', fontSize: 18},
});

export default CategoryOption;
