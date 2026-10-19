import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateBudget,recommend,places} from '../public/model.js';
test('shared room and transport are charged per party; meals and admissions per person',()=>{
 const b=calculateBudget({days:3,people:2,lodging:100000,meal:15000,transport:70000,selected:[{fee:5000}]});
 assert.deepEqual(b,{stay:200000,food:270000,mobility:210000,activities:10000,reserve:69000,total:759000});
});
test('day trips have no lodging and zero-cost plans remain finite',()=>{
 assert.equal(calculateBudget({days:1,people:1,lodging:100000,meal:0,transport:0,selected:[]}).total,0);
});
test('interest matching changes ranking without discarding any locations',()=>{
 const r=recommend(['미식']);assert.equal(r.length,places.length);assert.ok(r[0].tags.includes('미식'));assert.equal(places[0].id,'hyeopjae');
});
