import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Platform, View} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import SearchForm from './SearchForm';
import RecordForm from './RecordForm';
import PlaceDetail from './PlaceDetail';
import ManualAddForm from './ManualAddForm';

const viewHeight = Dimensions.get('window').height;
// iPhone Height: 896 / 812 / 736 / 667 / 568
export const SLIDE_TOP = viewHeight - (
  viewHeight > 800 ?
    150
    :
    viewHeight > 700 ?
      90
      :
      80
);
export const SLIDE_BOTTOM = 120;
export const SLIDE_MIDDLE = 430;

const containerStyle = {
  zIndex: 1,
  flex: 0.9,
  backgroundColor: '#FFFFFF',
  borderRadius: 15,
  paddingTop: 5,
  paddingRight: 10,
  paddingLeft: 10,
};

export const slideShowFormat = toValue => Platform.OS === 'android' ? {toValue, velocity: 2} : toValue;

function SearchPanel({modifyInfo}) {
  const [tab, setTab] = useState('SearchForm');
  const [allowDrag, setAllowDrag] = useState(true);
  const [slideTop, setSlideTop] = useState(SLIDE_MIDDLE);
  
  const slideRef = useRef(null);
  
  useEffect(() => {
    if (!modifyInfo) {
      return;
    }
    
    setAllowDrag(false);
    setTab('RecordForm');
    slideRef.current.show(slideShowFormat(SLIDE_TOP));
  }, [modifyInfo]);
  
  useEffect(() => {
    slideRef.current.show(slideShowFormat(slideTop));
  }, []);
  
  return (
    <SlidingUpPanel
      ref={slideRef}
      draggableRange={{bottom: SLIDE_BOTTOM, top: slideTop}}
      snappingPoints={[SLIDE_BOTTOM, slideTop]}
      allowDragging={allowDrag}
      containerStyle={{zIndex: 100}}
      friction={1.5}
    >
      <View style={containerStyle}>
        {
          tab === 'SearchForm' && (
            <SearchForm
              setAllowDrag={setAllowDrag}
              setTab={setTab}
              slideRef={slideRef}
              setSlideTop={setSlideTop}
            />
          )
        }
        {
          tab === 'ManualAddForm' && (
            <ManualAddForm
              setAllowDrag={setAllowDrag}
              setTab={setTab}
              slideRef={slideRef}
            />
          )
        }
        {
          tab === 'PlaceDetail' && (
            <PlaceDetail
              setAllowDrag={setAllowDrag}
              setTab={setTab}
              slideRef={slideRef}
            />
          )
        }
        {
          tab === 'RecordForm' && (
            <RecordForm
              setAllowDrag={setAllowDrag}
              setTab={setTab}
              slideRef={slideRef}
            />
          )
        }
      </View>
    </SlidingUpPanel>
  );
}

export default SearchPanel;
