export function check(value:any){
    if (value == 'Infinity')
      return 'Inf';
    else if(value.toString() === 'NaN'){
      return '0'
    }
    else
      return value.toFixed(1);
}
export function checkSR(value:any) {
    if (value.toString() === 'Infinity' || value.toString() === 'NaN')
        return 0.0;
    else
        return parseFloat(value).toFixed(1);
}
export function checkInf(value:any) {
  if (value.toString() === 'Infinity' || value.toString() === 'NaN')
      return '0';
  else
      return parseFloat(value).toFixed(1);
}