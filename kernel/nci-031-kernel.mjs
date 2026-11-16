/**
 * NCI-031 — correlated-uncertainty model, distinct from NCI-030's
 * issuer-signed ABSOLUTE measurement bounds.
 *
 * Statistical inputs here are UNSIGNED, explicitly hypothetical 1-sigma
 * standard deviations for demonstration. The shared term is not averaged
 * away. This is not calibration certification, actual hardware attestation,
 * or a physical 1/1 END END seal.
 */
import {classify as classifyIntervals, begin as beginInterval, audit as auditInterval} from "./nci-030-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const assert=(x,m)=>{if(!x)throw Error(m)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const id=x=>typeof x==="string"&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
export function weightedEstimate(readings,{independentSigmaK,commonSigmaK=0,commonSourceId="UNSPECIFIED_COMMON_MODE"}={}){
 assert(Array.isArray(readings)&&readings.length===3,"exactly three readings required");
 assert(independentSigmaK&&typeof independentSigmaK==="object","explicit independent sigma assumptions required");
 assert(finite(commonSigmaK)&&commonSigmaK>=0,"invalid common sigma");
 assert(id(commonSourceId),"invalid common source ID");
 const rows=readings.map(r=>{
  assert(id(r.sensorId)&&finite(r.valueK)&&r.valueK>0,"invalid sensor reading");
  const sd=independentSigmaK[r.sensorId];
  assert(finite(sd)&&sd>0,"positive independent sigma required for each sensor");
  return {sensorId:r.sensorId,valueK:r.valueK,independentSigmaK:sd,weight:1/(sd*sd)};
 });
 assert(new Set(rows.map(r=>r.sensorId)).size===3,"duplicate sensor IDs");
 const totalWeight=rows.reduce((s,r)=>s+r.weight,0);
 assert(finite(totalWeight)&&totalWeight>0,"invalid weight sum");
 const weights=rows.map(r=>r.weight/totalWeight);
 const estimateK=rows.reduce((s,r,i)=>s+r.valueK*weights[i],0);
 const independentVarianceK2=1/totalWeight;
 const commonVarianceK2=commonSigmaK*commonSigmaK;
 const totalVarianceK2=independentVarianceK2+commonVarianceK2;
 const independentSigmaOfMeanK=Math.sqrt(independentVarianceK2);
 const combinedSigmaK=Math.sqrt(totalVarianceK2);
 const naiveSigmaK=independentSigmaOfMeanK;
 const covarianceK2=rows.map((r,i)=>rows.map((q,j)=>
  commonVarianceK2+(i===j?r.independentSigmaK*r.independentSigmaK:0)));
 // Effective sample count for equal precision is only a descriptive ratio:
 // correlated common-mode uncertainty cannot vanish as n increases.
 assert(combinedSigmaK+1e-14>=commonSigmaK,"common-mode floor lost");
 return {estimateK,weights,readings:rows,
  independentSigmaOfMeanK,naiveSigmaK,commonSigmaK,combinedSigmaK,
  independentVarianceK2,commonVarianceK2,totalVarianceK2,covarianceK2,
  commonSourceId,model:"UNSIGNED_HYPOTHETICAL_1_SIGMA",
  physicallyAuthenticated:false,trusted:false,seal:null};
}
export function evaluate(chain,eventId,assumptions){
 const prior=classifyIntervals(chain,eventId);
 if(prior.count!==3)return {status:"COUNT_MISMATCH",eventId,count:prior.count,
  eligible:false,modelOnly:true,trusted:false,seal:null};
 const receipts=chain.receipts.receipts.filter(r=>r.eventId===eventId);
 const result=weightedEstimate(receipts,assumptions);
 const structural=prior.structuralEligibility===true;
 const bounds=prior.compatible===true;
 const eligible=structural&&bounds;
 const status=!structural?prior.status:!bounds?"INTERVAL_CONFLICT":"CORRELATION_ACCOUNTED";
 return {eventId,status,eligible,modelOnly:true,
  intervalCompatible:bounds,structureVerifiedByChain:structural,
  signedCalibrationMeaning:prior.calibrationMeaning,
  signedInterval:prior.commonIntersection,
  estimate:result,ancestry:{
   sensorRoots:prior.witnessIntervals.map(r=>r.rootId),
   commonModeSourceId:result.commonSourceId,
   correlatedMeasurements:true,
   independentPhysicalInstrumentsVerified:false},
  trusted:false,seal:null};
}
export function begin({interval=beginInterval(),assumptions={
 independentSigmaK:{"S-0":.01,"S-1":.01,"S-2":.01},
 commonSigmaK:.02,commonSourceId:"ROOM-THERMAL-MODE"
}}={}){
 auditInterval(interval);
 assert(assumptions&&typeof assumptions==="object","explicit assumptions required");
 return {interval:clone(interval),assumptions:clone(assumptions),
  events:[],checkpoints:[],sequence:0,seal:null};
}
export function checkpoint(state,eventId){
 audit(state);
 const decision=evaluate(state.interval.chain,eventId,state.assumptions);
 const next=clone(state);
 next.sequence++;
 const record={seq:next.sequence,type:"CORRELATED_CHECKPOINT",
  eventId,status:decision.status,eligible:decision.eligible,
  sharedMode:decision.estimate?.commonSourceId??null,
  recordedSigmaK:decision.estimate?.combinedSigmaK??null,
  source:"UNSIGNED_STATISTICAL_SIDECAR",trusted:false,seal:null};
 next.events.push(record);next.checkpoints.push(clone(record));
 audit(next);
 return {state:next,decision};
}
export function audit(state){
 auditInterval(state.interval);
 assert(state.events.length===state.sequence&&
  state.events.every((e,i)=>e.seq===i+1),"event history gap");
 assert(state.checkpoints.length===state.events.length,"checkpoint discontinuity");
 assert(state.checkpoints.every(e=>e.trusted===false&&e.seal===null),"false trust seal");
 return {valid:true,checks:state.sequence,physicalTrust:false,seal:null};
}
