export interface BattingStats {
    Innings: number;          
    Runs: number;    
    Balls: number;           
    Out: number;            
    Maiden: number;         
    BPD: number | string;    
    AVG: number | string;     
    strikeRate: number | string;
    dot: number;              
    _1s: number;            
    _2s: number;          
    _3s: number;             
    _4s: number;            
    _6s: number;             
    dotPer: number | string; 
    bdryPer: number | string;
  }

  export interface BattingStatsTest {
    Innings: number;          
    Runs: number;  
    Day:string|null;
    Session:string|null;  
    Balls: number;           
    Out: number;            
    Maiden: number;         
    BPD: number | string;    
    AVG: number | string;     
    strikeRate: number | string;
    dot: number;              
    _1s: number;            
    _2s: number;          
    _3s: number;             
    _4s: number;            
    _6s: number;             
    dotPer: number | string; 
    bdryPer: number | string;
  }