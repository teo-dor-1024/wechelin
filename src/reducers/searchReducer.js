export const MOVE_MAP = 'MOVE_MAP';

export const WRITE_KEYWORD = 'WRITE_KEYWORD';

export const FOCUS_PLACE = 'FOCUS_PLACE';
export const FETCH_PLACES = 'FETCH_PLACES';

export const CLEAR_SEARCH_LIST = 'CLEAR_SEARCH_LIST';

export const SET_SLIDE_POSITION = 'SET_SLIDE_POSITION';

export const SET_ADD_PIN_MODE = 'SET_ADD_PIN_MODE';
export const SET_ADD_PIN_INFO = 'SET_ADD_PIN_INFO';

export const SLIDE_BOTTOM = 80;
export const SLIDE_MIDDLE = 300;

export default function (state, [type, payload]) {
  switch (type) {
    case MOVE_MAP:
      return {
        ...state,
        region: {
          ...state.region,
          ...payload,
        },
        slidePosition: SLIDE_BOTTOM,
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
        slidePosition: SLIDE_MIDDLE,
        selectedIndex: payload.index,
      };
    case FETCH_PLACES:
      return {
        ...state,
        places: payload,
        slidePosition: SLIDE_MIDDLE,
      };
    case SET_SLIDE_POSITION:
      return {
        ...state,
        slidePosition: payload,
      };
    case CLEAR_SEARCH_LIST:
      return {
        ...state,
        keyword: '',
        places: [],
        slidePosition: SLIDE_BOTTOM,
        selectedIndex: -1,
      };
    case SET_ADD_PIN_MODE:
      return {
        ...state,
        addPinMode: payload,
        addPinInfo:
          payload ?
            state.addPinInfo
            :
            {
              name: '',
              category: '',
              address: '',
              latitude: 0,
              longitude: 0,
            },
        slidePosition: SLIDE_BOTTOM,
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
