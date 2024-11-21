export interface BowlingStats{
    Innings: number;          
    Runs: number;    
    Balls: number;           
    Out: number;            
    Maiden: number;         
    BPD: number | string;    
    AVG: number | string;     
    Econ:number | string;
    strikeRate: number | string;
    dot: number;              
    _1s: number;            
    _2s: number;          
    _3s: number;             
    _4s: number;            
    _6s: number;             
    dotPer: number | string; 
    bdryPer: number | string;
    BowlingType:string|null;
}
export interface BowlingStatsTest{
    Innings: number;          
    Runs: number;  
    Day:string|null;
    Session:string|null;  
    Balls: number;           
    Out: number;            
    Maiden: number;         
    BPD: number | string;    
    AVG: number | string;  
    Econ:number | string;   
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