export const convertDistance = distance => {
  const kmVal = (parseFloat(distance) / 1000).toFixed(1);
  
  return kmVal < 1 ? `${distance}m` : `${kmVal.toString()}km`;
};

export const convertMoney = (money = 0) => money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const convertDate = strFullDate => {
  if (!strFullDate) {
    return '';
  }
  
  const fullDate = new Date(strFullDate);
  const year = fullDate.getFullYear();
  const month = fullDate.getMonth() + 1;
  const date = fullDate.getDate();
  const hour24 = fullDate.getHours();
  let hour;
  let ampm;
  if (hour24 >= 12 ) {
    hour = hour24 - 12 || 12;
    ampm = '오후';
  } else {
    hour = hour24;
    ampm = '오전';
  }
  
  const min = fullDate.getMinutes();
  
  return `${year}. ${month}. ${date}. ${ampm} ${hour}:${min ? min : '00'}`;
};

export const calcAvg = list => (list.reduce((sum, val) => isNaN(val) ? sum : sum + Number(val), 0) / list.length).toFixed(0);