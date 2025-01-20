export interface BattingCardSummary {
    Innings:number,
    TeamTotal: number,
    ExtrasTotal: number,
    ExtrasBreakup: string,
    Dismissals: number,
    Overs: number,
    BattingClubId:number;
    RunRate:string;
}
export interface BattingCard {
    strikerID: number;
    strikerName: string;
    runs: number;
    balls: number;
    strikeRate: number | string;
    dot: number;
    _1s: number;
    _2s: number;
    _3s: number;
    _4s: number;
    _6s: number;
    dotPer: number | string;
    bdryPer: number | string;
    wkt: number;
    dismissalSts: string | null;
    isLastRow:boolean;
    BatOrder:number;
}

export interface MatchData {
    ID: number;
    ClubA: number;
    ClubB: number;
    ClubAPrefix:string;
    ClubBPrefix:string;
    ClubAFull:string;
    ClubBFull:string;
    CompetitionID: number;
    Date: string;
    Inningscount: number;
    KnockOut: number;
    MatchComplete: boolean;
    MatchOvers: number;
    MatchTypeID: number;
    Overtype: number;
    StadiumID: number;
    Status: number;
    isFollowOn: number;
    MatchNameShort: string;
    MatchName: string;
    InnCount: number;
    StadiumName:string;
    City:string;
    CompFullName:string;
    compprefix:string;
    isLimitedOvers:number;
    MomPlayerName:string|null;
    inningsData: InningsData[];
    result:MatchResult[];
    info:MatchInfo | null;
}

interface InningsData {
    AutoID: number;
    BattingClubID: number;
    BowlingClubID: number;
    DayOrNight: number;
    Description: string;
    InningsID: number;
    MatchID: number;
    Powerplay: number;
    RevisedOvers: number | null;
    RevisedTarget: number | null;
    TossWin: number;
    WinTeam: number;
    isEnd: number;
    VideoMode: number;
    VideoPath: string | null;
    Declared: number;
    BattingClubName: string;
    BattingClubPrefix: string;
    BowlingClubName: string;
    BowlingClubPrefix: string;
    SyncTime:number;
}
export interface MatchResult {
    AutoNo: number;
    Matchid: number;
    ClubID: number;
    Wickets: number;
    Runs: number;
    Result: string;
    Won: number;
    Points: string;
    SuperOver: number;
    DuckWorthLewis: number;
    ClubName:string;
    ClubPrefix:string;
  }
  interface MatchInfo {
    Series: string;
    Season: string;
    MatchName: string;
    Venue: string;
    City: string;
    Time: string;
    Date: string;
    MatchOvers: number;
    Format: string;
    Toss: string;
    Umpires: string | null;        // Could be null if no umpires are specified
    TVUmpire: string | null;       // Could be null if no TV umpire is specified
    MatchReferee: string | null;   // Could be null if no referee is specified
}
