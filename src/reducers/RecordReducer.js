export const MOVE_MAP = 'MOVE_MAP';
export const FOCUS_PLACE = 'FOCUS_PLACE';
export const FETCH_PLACES = 'FETCH_PLACES';

export const SLIDE_BOTTOM = 80;
export const SLIDE_MIDDLE = 250;

export default function(state, [type, payload]) {
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
    case FOCUS_PLACE:
      return {
        ...state,
        region: {
          ...state.region,
          ...payload,
        },
        slidePosition: SLIDE_MIDDLE,
      };
    case FETCH_PLACES:
      return {
        ...state,
        places: payload,
      };
    default:
      return state;
  }
}
