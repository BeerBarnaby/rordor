import { describe, expect, it } from 'vitest';
import { parseMissionDraft } from '../missionDraft';
const valid = {version:1,phase:'aed',attemptKey:2,sequenceScore:80,callScore:70,cprRhythmScore:90,cprAvgBpm:110,mistakes:[],elapsedSeconds:120};
describe('mission checkpoints',()=>{
  it('restores a validated phase checkpoint',()=>expect(parseMissionDraft(JSON.stringify(valid))).toEqual(valid));
  it.each([null,'broken','{}','[]'])('ignores corrupt draft %s',raw=>expect(parseMissionDraft(raw)).toBeNull());
  it.each([{phase:'debrief'},{sequenceScore:101},{elapsedSeconds:-1},{version:2},{mistakes:[null]}])('rejects invalid fields',patch=>expect(parseMissionDraft(JSON.stringify({...valid,...patch}))).toBeNull());
});
