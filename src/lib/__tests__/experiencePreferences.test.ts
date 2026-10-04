import { describe, expect, it } from 'vitest';
import { readExperience } from '../experiencePreferences';
describe('experience preferences',()=>{
  it.each(['','broken','null','[]'])('uses safe defaults for %s',raw=>expect(readExperience(raw)).toEqual({reduceMotion:false,haptics:false}));
  it('requires booleans, not truthy strings',()=>expect(readExperience('{"haptics":"true","reduceMotion":true}')).toEqual({reduceMotion:true,haptics:false}));
});
