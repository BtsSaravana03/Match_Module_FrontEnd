import { BallData } from "../ball-by-ball/ball-by-ball.interface";

export function getDismissalString(_a:BallData): string {
    const {DismissalTypeID,DismissalFielder1Name,DismissalFielder2Name,BowlerName,DismissalFielderID1,BowlerID,NonBallType} = _a;
    let DismissalType = _a.DismissalTypeID;
    if(_a.NonBallType !== null && _a.NonBallType !== 7){
        DismissalType = _a.NonBallType;
    }
    switch (DismissalType) {
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
            return `run out ${DismissalFielder2Name?DismissalFielder1Name+' / '+DismissalFielder2Name:DismissalFielder1Name??''}`;
        case 5: // Stump
            return `st ${DismissalFielder1Name} b ${BowlerName}`;
        case 6: // Hit Wicket
            return `hit wicket b ${BowlerName}`;
        case 16: // Mankad
            return `mankaded b ${BowlerName}`;
        case 8: // Retire hurt
            return `retired hurt`;
        case 9: // Retire hurt
            return `retired out`;
        case 11: // Time Out
            return `timed out`;
        case 10: // Obstructing the field
            return `obstructed the field`;
        case 12: // Handle the ball
            return `handled the ball`;
        case 13: // Retire Not Out
            return `hit the ball twice`;
        case 14: // Hit ball twice
            return `retire not out`;
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
export function calculateOversPrecise(Balls:BallData[]) {
    let overs = 0;
    let balls = 0;
    for(let i = 0;i <Balls.length;i++){
        balls++;
        if(Balls[i].EndOver === 1 && !Balls[i].MultipleBowlers){
            overs++;
            balls = 0;
        }
    }
   return parseFloat(`${overs}.${balls}`);
}
export function getCurrentBallDescription(ball: BallData): string {
    let description = "";
    // Handle extras
    switch (ball.ExtraTypeId) {
        case 1: // Overstep (No Ball)
            description = "NB";
            break;
        case 2: // Wide
            description = "WD";
            break;
        case 3: // Leg Byes
            description = "LB";
            break;
        case 4: // Byes
            description = "B";
            break;
        case 5: // Overstep + Byes
            description = "NB+B";
            break;
        case 6: // Overstep + Leg Byes
            description = "NB+LB";
            break;
    }

    // Handle dismissal (wicket)
    if (ball.Dismissal === 1) {
        description += (description ? "+" : "") + "W"; // Combine extras and wicket if both exist
    }

    // Add runs if applicable
    if (ball.Runs > 0) {
        description = `${ball.Runs}${description ? description : ""}`;
    } else if (!description) {
        // Default case: Dot ball
        description = "0";
    }

    return description;
}
export function oversToBalls(overs: number): number {
    const fullOvers = Math.floor(overs); // Extract the full overs
    const partialBalls = Math.round((overs - fullOvers) * 10); // Extract the fractional part and convert to balls
    return fullOvers * 6 + partialBalls; // Total balls = full overs in balls + partial balls
}
export function oversSplit(overs:number) {
    let parts = overs.toString().split('.');
    let over = parseInt(parts[0]);
    let balls = parts.length > 1 ? parseInt(parts[1]) : 0;
    let ballFraction = balls / 6;
    return { over, ballFraction };
}
export function isTestMatch(MatchType:number):boolean {
    const testMatchTypes = [1,4,8,11,14,17,20,26,29,32,35];
    if(testMatchTypes.includes(MatchType)){
        return true;
    }
    else {
        return false;
    }
}
