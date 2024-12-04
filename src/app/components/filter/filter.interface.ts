export interface InningsData {
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

type RunsFilter = { _0: boolean; _1: boolean; _2: boolean; _3: boolean; _4: boolean; _6: boolean; wickets: boolean };
export interface Filter {
  innings: number;
  ball: { from: number | null; to: number | null };
  over: { from: number | null; to: number | null };
  runs: RunsFilter;
  phase :{
    Powerplay: boolean,
    MiddleOvers: boolean,
    DeathOvers: boolean
  }
}