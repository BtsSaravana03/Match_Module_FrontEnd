export interface GraphicsFilter {
    Innings:number;
    BowlingType:number[];
    BattingType:number[];
    Batsman:number[];
    Bowlers:number[];
    BatSubject:number[],
    CreaseMovement:number[],
    uncomfortable?: number
}
export interface BowlingTypes{
    Id:number;
    Prefix:string;
    Description:string;
}
