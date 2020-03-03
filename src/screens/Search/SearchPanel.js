import React, {useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, View} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {RecordContext} from './SearchScreen';
import {SLIDE_BOTTOM, SLIDE_MIDDLE} from '../../reducers/searchReducer';
import SearchForm from './SearchForm';
import RecordForm from './RecordForm';
import PlaceDetail from './PlaceDetail';
import ManualAddForm from './ManualAddForm';

const containerStyle = {
  zIndex: 1,
  flex: 0.9,
  backgroundColor: '#FFFFFF',
  borderRadius: 15,
  paddingTop: 5,
  paddingRight: 10,
  paddingLeft: 10,
};

function SearchPanel() {
  const {state: {slidePosition}} = useContext(RecordContext);
  
  const {height} = Dimensions.get('window');
  const SLIDE_TOP = height - 150;
  
  const [tab, setTab] = useState('SearchForm');
  const [allowDrag, setAllowDrag] = useState(true);
  const slidePanel = useRef();
  
  useEffect(() => {
    slidePanel.current.show(slidePosition);
  });
  
  return (
    <SlidingUpPanel
      ref={slidePanel}
      draggableRange={{bottom: SLIDE_BOTTOM, top: SLIDE_TOP}}
      snappingPoints={[SLIDE_BOTTOM, SLIDE_MIDDLE, SLIDE_TOP]}
      allowDragging={allowDrag}
      friction={2}
      minimumVelocityThreshold={0.5}
      minimumDistanceThreshold={1}
    >
      <View style={containerStyle}>
        {
          tab === 'SearchForm' && <SearchForm setAllowDrag={setAllowDrag} setTab={setTab}/>
        }
        {
          tab === 'ManualAddForm' && <ManualAddForm setAllowDrag={setAllowDrag} setTab={setTab} SLIDE_TOP={SLIDE_TOP}/>
        }
        {
          tab === 'PlaceDetail' && <PlaceDetail setAllowDrag={setAllowDrag} setTab={setTab} SLIDE_TOP={SLIDE_TOP}/>
        }
        {
          tab === 'RecordForm' && <RecordForm setAllowDrag={setAllowDrag} setTab={setTab}/>
        }
      </View>
    </SlidingUpPanel>
  );
}

export default SearchPanel;
