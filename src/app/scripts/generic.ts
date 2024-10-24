export function check(value:any){
    if (value == 'Infinity' || value == 'NaN')
      return '-';
    else
      return value;
}
export function checkSR(value:any) {
    if (value.toString() === 'Infinity' || value.toString() === 'NaN')
        return 0.0;
    else
        return parseFloat(value).toFixed(1);
}