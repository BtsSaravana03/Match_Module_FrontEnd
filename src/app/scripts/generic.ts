import _ from "lodash";

export function check(value:any){
    if (value == 'Infinity')
      return '-';
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
export function splitName(fullName:string) {
    const parts = _.split(fullName, ' '); // Split the name by spaces
    const firstname = _.head(parts) || ""; // Get the first word (firstname), default to empty string
    const lastname = _.join(_.tail(parts), ' ') || ""; // Join the remaining words (lastname), default to empty string
    return { firstname, lastname };
}
