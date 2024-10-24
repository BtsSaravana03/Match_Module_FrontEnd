export function getDismissalString(_a:any): string {
    const {DismissalTypeID,DismissalFielder1Name,BowlerName,DismissalFielderID1,BowlerID} = _a;
    switch (DismissalTypeID) {
        case 1: // Bowled
            return `b ${BowlerName}`;
        case 2: // Caught
            if (DismissalFielderID1 === BowlerID) {
                return `c & b ${BowlerName}`; // Caught and Bowled
            }
            return `c ${DismissalFielder1Name} b ${BowlerName}`;
        case 3: // LBW
            return `lbw b ${BowlerName}`;
        case 4: // Run Out
            return `run out ${DismissalFielder1Name}`;
        case 5: // Stump
            return `st ${DismissalFielder1Name} b ${BowlerName}`;
        case 6: // Hit Wicket
            return `hit wicket b ${BowlerName}`;
        case 16: // Mankad
            return `mankaded b ${BowlerName}`;
        case 8: // Retire hurt
            return `retired hurt`;
        case 11: // Time Out
            return `timed out`;
        case 10: // Obstructing the field
            return `obstructed the field`;
        case 12: // Handle the ball
            return `handled the ball`;
        case 13: // Hit ball twice
            return `hit the ball twice`;
        case 15: // Absent hurt
            return `absent hurt`;
        default:
            return "-";
    }
}
export function calculateOvers(totalBalls:number) {
    const fullOvers = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;
    return `${fullOvers}.${remainingBalls}`;
}