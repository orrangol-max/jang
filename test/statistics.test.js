import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {statistics} from '../public/statistics.js';
test('regional records have 43 unique areas per month and consistent visitor totals',()=>{
 assert.equal(Object.keys(statistics.regions).length,92);
 for(const rows of Object.values(statistics.regions)){
  assert.equal(rows.length,43);assert.equal(new Set(rows.map(r=>r.code)).size,43);
  for(const r of rows)assert.equal(r.domestic+r.foreign,r.total);
 }
 assert.equal(statistics.regions['202608'].find(r=>r.name==='애월읍').total,1243446);
});
test('satisfaction preserves all 18 missing values and 2025 attraction score',()=>{
 const values=Object.values(statistics.satisfaction).flatMap(v=>Object.values(v));
 assert.equal(values.length,144);assert.equal(values.filter(v=>v===null).length,18);
 assert.equal(statistics.satisfaction['2025']['관광지 매력도'],4.37);
});
test('monthly age values match every original CSV row without missing or extra months',()=>{
 const english=new URL('../data/raw/age-visits.csv',import.meta.url);
 const source=existsSync(english)?english:new URL('../data/raw/제주 연령대별 방문.csv',import.meta.url);
 const text=readFileSync(source,'utf8').replace(/^\uFEFF/,'');
 const rows=text.trim().split(/\r?\n/).slice(1);
 const expected={};
 for(const row of rows){const [month,,,sex,age,value]=row.split(',').map(s=>s.replace(/^"|"$/g,''));assert.ok(['M','W'].includes(sex));expected[month]??={};expected[month][age]=(expected[month][age]||0)+Number(value);}
 assert.deepEqual(statistics.months,expected);
 assert.equal(rows.length,1288);assert.equal(Object.keys(expected).length,92);
 assert.equal(expected['202608']['40'],1028535);
});
test('domestic survey references preserve year-specific values without foreign currency mixing',()=>{
 assert.deepEqual(statistics.survey['2025'],{expense:637140,stay:3.8});
 assert.deepEqual(statistics.survey['2024'],{expense:666809,stay:3.7});
 assert.equal(Object.keys(statistics.survey).length,12);
});
