export const convertDistance = distance => {
  const kmVal = (parseFloat(distance) / 1000).toFixed(1);
  
  return kmVal < 1 ? `${distance}m` : `${kmVal.toString()}km`;
};

export const convertMoney = (money = 0) => money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
