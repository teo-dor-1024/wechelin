import {parseISO, format} from 'date-fns';
import ko from 'date-fns/locale/ko';

export const convertDistance = distance => {
  const kmVal = (parseFloat(distance) / 1000).toFixed(1);
  
  return kmVal < 1 ? `${distance}m` : `${kmVal.toString()}km`;
};

export const convertMoney = (money = 0) => money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const convertDate = (strFullDate, form = 'yyyy. MM. dd. aaa hh:mm') => {
  if (!strFullDate) {
    return '';
  }
  
  return format(parseISO(strFullDate), form, {locale: ko});
};

export const calcAvg = list => (list.reduce((sum, val) => isNaN(val) ? sum : sum + Number(val), 0) / list.length).toFixed(0);
