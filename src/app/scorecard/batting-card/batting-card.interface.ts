export interface BattingCardSummary {
    Innings:number,
    TeamTotal: number,
    ExtrasTotal: number, 
    ExtrasBreakup: string, 
    Dismissals: number, 
    Overs: number,
    BattingClubId:number
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
}

export interface MatchData {
    ID: number;
    ClubA: number;
    ClubB: number;
    CompetitionID: number;
    Date: string;
    Inningscount: number;
    KnockOut: number;
    MatchComplete: number;
    MatchOvers: number;
    MatchTypeID: number;
    Overtype: number;
    StadiumID: number;
    Status: number;
    isFollowOn: number;
    MatchNameShort: string;
    MatchName: string;
    InnCount: number;
    inningsData: InningsData[];
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
}

