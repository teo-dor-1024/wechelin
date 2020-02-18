export const convertDistance = distance => {
  const kmVal = (parseFloat(distance) / 1000).toFixed(1);
  
  return kmVal < 1 ? `${distance}m` : `${kmVal.toString()}km`;
};
