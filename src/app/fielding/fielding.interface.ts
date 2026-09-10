export interface Fielding{
    SrNo:number;
    FielderId?:number|null;
    Name:string|null;
    RunsSaved:number;
    RunsMissed:number;
    NetRunsSaved:number;
    CatchesTaken:number;
    CatchesDropped?:number;
    CatchEfficiency:number|null;
    Touches:number;
    RunoutSuccess:number;
    RunoutMissed:number;
    RunoutEfficiency:number|null;
}

