import assert from "node:assert/strict";
import {demo} from "./nci-029-kernel.mjs";
import {intervals,classify,begin,checkpoint,audit} from "./nci-030-kernel.mjs";
const readings=[
 {sensorId:"A",rootId:"A",issuerDomain:"CA",valueK:290,uncertaintyK:.05},
 {sensorId:"B",rootId:"B",issuerDomain:"CB",valueK:290.04,uncertaintyK:.05},
 {sensorId:"C",rootId:"C",issuerDomain:"CC",valueK:290.08,uncertaintyK:.05}
];
const match=intervals(readings);
assert.equal(match.compatible,true);
assert.equal(match.allPairsCompatible,true);
assert.ok(match.nominalConsensusK>=290.03&&match.nominalConsensusK<=290.05);
const conflicting=intervals(readings.map((x,i)=>i===2?{...x,valueK:291}:x));
assert.equal(conflicting.compatible,false);
assert.equal(conflicting.nominalConsensusK,null);
const pairwiseOnly=intervals([
 {...readings[0],valueK:0.25,uncertaintyK:0.15},
 {...readings[1],valueK:0.45,uncertaintyK:0.15},
 {...readings[2],valueK:0.65,uncertaintyK:0.15}]);
assert.equal(pairwiseOnly.compatible,false);
assert.equal(pairwiseOnly.allPairsCompatible,false);
assert.throws(()=>intervals([{valueK:290,uncertaintyK:1}]),/three readings/);
assert.throws(()=>intervals(readings.map((x,i)=>i===1?{...x,uncertaintyK:-1}:x)),/invalid Kelvin/);
const synthetic=await demo(),result=classify(synthetic.state,"THERM-029");
assert.equal(result.status,"INTERVAL_COMPATIBLE");
assert.equal(result.eligible,true);
assert.equal(result.trusted,false);
assert.equal(result.commonIntersection!==null,true);
const wrapped=begin({chain:synthetic.state}),saved=JSON.stringify(wrapped);
const checked=checkpoint(wrapped,"THERM-029");
assert.equal(checked.decision.status,"INTERVAL_COMPATIBLE");
assert.equal(audit(checked.state).checks,1);
assert.equal(JSON.stringify(wrapped),saved);
const shared=classify((await demo({sharedDomain:true})).state,"THERM-029");
assert.equal(shared.status,"SHARED_ISSUER_DOMAIN");
assert.equal(shared.eligible,false);
const bad=classify((await demo({disagree:true})).state,"THERM-029");
assert.equal(bad.status,"INTERVAL_CONFLICT");
const missing=classify((await demo({expired:true})).state,"THERM-029");
assert.equal(missing.status,"COUNT_MISMATCH");
const fake=JSON.parse(JSON.stringify(checked.state));fake.checkpoints[0].trusted=true;
assert.throws(()=>audit(fake),/unearned evidence seal/);
console.log("NCI-030 PASS: bounded intervals, common overlap, signed-chain provenance, conflict, false trust veto");
