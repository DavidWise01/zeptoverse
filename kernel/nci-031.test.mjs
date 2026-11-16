import assert from "node:assert/strict";
import {demo} from "./nci-029-kernel.mjs";
import {begin as beginInterval} from "./nci-030-kernel.mjs";
import {weightedEstimate,evaluate,begin,checkpoint,audit} from "./nci-031-kernel.mjs";
const inputs=[
 {sensorId:"A",valueK:290},
 {sensorId:"B",valueK:290.005},
 {sensorId:"C",valueK:290.01}
];
const model=weightedEstimate(inputs,{
 independentSigmaK:{A:.01,B:.01,C:.01},commonSigmaK:.02,
 commonSourceId:"SHARED-THERMAL-ROOM"});
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),String(a)+" != "+String(b));
close(model.estimateK,290.005);
close(model.independentSigmaOfMeanK,.01/Math.sqrt(3));
close(model.combinedSigmaK,Math.sqrt(.02**2+.01**2/3));
close(model.covarianceK2[0][1],.02**2);
close(model.covarianceK2[0][0],.02**2+.01**2);
assert.ok(model.combinedSigmaK>model.naiveSigmaK);
assert.ok(model.combinedSigmaK>=.02);
assert.equal(model.trusted,false);
const zero=weightedEstimate(inputs,{independentSigmaK:{A:.01,B:.01,C:.01}});
close(zero.combinedSigmaK,zero.naiveSigmaK);
assert.throws(()=>weightedEstimate(inputs,{independentSigmaK:{A:.01,B:0,C:.01}}),/positive independent sigma/);
assert.throws(()=>weightedEstimate(inputs,{independentSigmaK:{A:.01,B:.01,C:.01},commonSigmaK:-.1}),/common sigma/);
const d=await demo();
const options={independentSigmaK:{"S-0":.01,"S-1":.01,"S-2":.01},
 commonSigmaK:.02,commonSourceId:"ROOM-THERMAL-MODE"};
const good=evaluate(d.state,"THERM-029",options);
assert.equal(good.status,"CORRELATION_ACCOUNTED");
assert.equal(good.eligible,true);
assert.equal(good.trusted,false);
assert.equal(good.estimate.commonSourceId,"ROOM-THERMAL-MODE");
assert.equal(good.ancestry.independentPhysicalInstrumentsVerified,false);
const shared=evaluate((await demo({sharedDomain:true})).state,"THERM-029",options);
assert.equal(shared.status,"SHARED_ISSUER_DOMAIN");
assert.equal(shared.eligible,false);
const mismatch=evaluate((await demo({disagree:true})).state,"THERM-029",options);
assert.equal(mismatch.status,"INTERVAL_CONFLICT");
assert.equal(mismatch.eligible,false);
const state=begin({interval:beginInterval({chain:d.state}),assumptions:options});
const original=JSON.stringify(state);
const checked=checkpoint(state,"THERM-029");
assert.equal(checked.decision.status,"CORRELATION_ACCOUNTED");
assert.equal(audit(checked.state).checks,1);
assert.equal(JSON.stringify(state),original);
const fake=JSON.parse(JSON.stringify(checked.state));fake.checkpoints[0].trusted=true;
assert.throws(()=>audit(fake),/false trust seal/);
console.log("NCI-031 PASS: independent/common-mode covariance, uncertainty floor, ancestry, conflict, trust veto");
