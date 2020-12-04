export const MOVE_MAP = 'MOVE_MAP';

export const WRITE_KEYWORD = 'WRITE_KEYWORD';

export const FOCUS_PLACE = 'FOCUS_PLACE';
export const FETCH_PLACES = 'FETCH_PLACES';

export const CLEAR_SEARCH_LIST = 'CLEAR_SEARCH_LIST';

export const SET_ADD_PIN_MODE = 'SET_ADD_PIN_MODE';
export const SET_ADD_PIN_INFO = 'SET_ADD_PIN_INFO';

const defaultAddPinInfo = {
  name: '',
  category: '',
  address: '',
  latitude: 0,
  longitude: 0,
};

export default function (state, [type, payload]) {
  switch (type) {
    case MOVE_MAP:
      return {
        ...state,
        region: {
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          ...payload,
        },
      };
    case WRITE_KEYWORD:
      return {
        ...state,
        keyword: payload,
      };
    case FOCUS_PLACE:
      return {
        ...state,
        region: {
          ...state.region,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
        selectedIndex: payload.index,
      };
    case FETCH_PLACES:
      console.log('페이로드', payload);
      return {
        ...state,
        places: payload,
      };
    case CLEAR_SEARCH_LIST:
      return {
        ...state,
        keyword: '',
        places: [],
        selectedIndex: -1,
        addPinMode: false,
        addPinInfo: {...defaultAddPinInfo},
      };
    case SET_ADD_PIN_MODE:
      return {
        ...state,
        addPinMode: payload,
        addPinInfo:
          payload ?
            state.addPinInfo
            :
            {...defaultAddPinInfo},
      };
    case SET_ADD_PIN_INFO:
      return {
        ...state,
        addPinInfo: {
          ...state.addPinInfo,
          ...payload,
        },
      };
    default:
      return state;
  }
}
