import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgressService } from '../progress';
import type { MissionResult } from '@/types';
const result: MissionResult = {id:'old-result',scenarioId:'field',scenarioTitle:'Test',completedAt:'2026-10-04',totalTimeSeconds:120,overallScore:80,skillScores:{assessment:null,sequence:80,call1669:80,cprRhythm:80,aed:null,responseTime:null},timeline:[],cprAverageBpm:110,cprRhythmScore:80,callCompletenessScore:80,mistakes:[],scoringVersion:'measured-v2'};
afterEach(()=>vi.unstubAllGlobals());
describe('mission reward deduplication',()=>{
  it('does not reward a repeated result even after history is trimmed',()=>{
    const store = new Map<string,string>();
    vi.stubGlobal('window',{dispatchEvent:vi.fn()});
    vi.stubGlobal('localStorage',{getItem:(key:string)=>store.get(key)??null,setItem:(key:string,value:string)=>store.set(key,value)});
    ProgressService.recordMissionResult(result);
    for(let i=0;i<25;i++) ProgressService.recordMissionResult({...result,id:`mission-${i}`});
    expect(ProgressService.getProgress().history.some(item=>item.id===result.id)).toBe(false);
    expect(ProgressService.recordMissionResult(result).missionAttemptsCount).toBe(26);
  });
});
