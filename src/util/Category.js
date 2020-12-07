export const allCategories = [
  {label: '생필품', icon: 'shopping-basket'},
  {label: '전자제품', icon: 'tv'},
  {label: '의류', icon: 'tshirt'},
  {label: '잡화', icon: 'shopping-bag'},
  {label: '식자재', icon: 'carrot'},
  {label: '마트 · 편의점', icon: 'shopping-cart'},
  {label: '식비', icon: 'utensils'},
  {label: '카페 · 베이커리', icon: 'coffee'},
  {label: '술 · 유흥', icon: 'beer'},
  {label: '화장품', icon: 'magic'},
  {label: '미용실 · 피부과', icon: 'cut'},
  {label: '병원 · 약국', icon: 'hospital'},
  {label: '숙박', icon: 'hotel'},
  {label: '교통', icon: 'bus-alt'},
  {label: '자동차', icon: 'car'},
  {label: '친구 · 모임', icon: 'users'},
  {label: '문화 · 여가', icon: 'book'},
  {label: '경조사', icon: 'envelope'},
  {label: '선물', icon: 'gift'},
  {label: '기타', icon: 'ellipsis-h'},
];

export const mappingCategory = categoryGroup => {
  if (/음식점/gi.test(categoryGroup)) {
    return '식비';
  } else if (/대형마트|편의점/gi.test(categoryGroup)) {
    return '마트 · 편의점';
  } else if (/주차장|주유소|충전소/gi.test(categoryGroup)) {
    return '자동차';
  } else  if (/문화시설|관광명소/gi.test(categoryGroup)) {
    return '문화 · 여가';
  } else if (/숙박/gi.test(categoryGroup)) {
    return '숙박';
  } else if (/카페/gi.test(categoryGroup)) {
    return '카페 · 베이커리';
  } else if (/병원|약국/gi.test(categoryGroup)) {
    return '병원 · 약국';
  } else {
    return '기타';
  }
};
