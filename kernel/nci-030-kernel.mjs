/**
 * NCI-030 — calibration-interval witness consensus.
 * uncertaintyK is interpreted as a declared absolute ± bound, not 1-sigma.
 * The certificate is verified at provisioning by NCI-029; this layer does
 * not confer physical independence or statistical confidence coverage.
 */
import {begin as beginChain,inspect as inspectChain,audit as auditChain} from "./nci-029-kernel.mjs";
const copy=x=>JSON.parse(JSON.stringify(x));
const need=(test,msg)=>{if(!test)throw Error(msg)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
export function intervals(readings){
 need(Array.isArray(readings)&&readings.length===3,"three readings required");
 const rows=readings.map(p=>{
  need(finite(p.valueK)&&p.valueK>0&&finite(p.uncertaintyK)&&p.uncertaintyK>=0,"invalid Kelvin interval");
  return {sensorId:p.sensorId,centerK:p.valueK,uncertaintyK:p.uncertaintyK,
    lowerK:p.valueK-p.uncertaintyK,upperK:p.valueK+p.uncertaintyK,
    rootId:p.rootId,issuerDomain:p.issuerDomain};
 });
 const low=Math.max(...rows.map(x=>x.lowerK));
 const high=Math.min(...rows.map(x=>x.upperK));
 const compatible=low<=high+1e-12;
 const pairs=[];
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
  const a=rows[i],b=rows[j];
  pairs.push({sensors:[a.sensorId,b.sensorId],
    separationK:Math.abs(a.centerK-b.centerK),
    permittedK:a.uncertaintyK+b.uncertaintyK,
    compatible:Math.abs(a.centerK-b.centerK)<=a.uncertaintyK+b.uncertaintyK+1e-12});
 }
 return {rows,pairs,commonIntersection:compatible?{lowerK:low,upperK:high}:null,
  compatible,allPairsCompatible:pairs.every(p=>p.compatible),
  maxCenterSpreadK:Math.max(...rows.map(x=>x.centerK))-Math.min(...rows.map(x=>x.centerK)),
  // Midpoint is a descriptive interval point, NOT an uncertainty-weighted estimate.
  nominalConsensusK:compatible?(low+high)/2:null};
}
export function classify(chain,eventId){
 auditChain(chain);
 const prior=inspectChain(chain,eventId);
 const receipts=chain.receipts.receipts.filter(p=>p.eventId===eventId);
 if(receipts.length!==3)return {status:"COUNT_MISMATCH",count:receipts.length,
  compatible:false,structuralEligibility:false,trusted:false,seal:null};
 const readings=receipts.map(p=>{
  const c=chain.certificates[p.sensorId],issuer=chain.issuers[c.issuerId];
  return {sensorId:p.sensorId,rootId:c.rootId,valueK:p.valueK,
   uncertaintyK:c.uncertaintyK,issuerDomain:issuer.trustDomain};
 });
 const interval=intervals(readings);
 // Reuse the signed receipt and issuer chain for ancestry, clock and
 // certificate checks, but use interval agreement rather than its fixed
 // absolute center-value tolerance.
 const distinctRoots=prior.structuralIndependence===true;
 const distinctIssuers=prior.separateIssuerDomains===true;
 const calibrated=prior.calibrationVerified===true;
 const validClock=prior.clocksAgree===true;
 const distinctMeasurements=prior.sharedMeasurement===false;
 const structuralEligibility=distinctRoots&&distinctIssuers&&calibrated&&validClock&&distinctMeasurements;
 const status=!distinctRoots?"SHARED_ANCESTRY":!distinctIssuers?"SHARED_ISSUER_DOMAIN":
 !distinctMeasurements?"DUPLICATE_MEASUREMENT":!calibrated?"INVALID_CALIBRATION":
 !validClock?"CLOCK_DISAGREEMENT":!interval.compatible?"INTERVAL_CONFLICT":
 "INTERVAL_COMPATIBLE";
 return {status,eventId,count:3,compatible:interval.compatible,
  structuralEligibility,eligible:structuralEligibility&&interval.compatible,
  witnessIntervals:interval.rows,pairs:interval.pairs,
  allPairsCompatible:interval.allPairsCompatible,
  commonIntersection:interval.commonIntersection,
  nominalConsensusK:interval.nominalConsensusK,
  maxCenterSpreadK:interval.maxCenterSpreadK,
  calibrationMeaning:"DECLARED_ABSOLUTE_BOUND_K_NOT_SIGMA",
  authenticallyHardwareIndependent:false,trusted:false,seal:null,
  upstreamStatus:prior.status};
}
export function begin({chain=beginChain()}={}){
 auditChain(chain);
 return {chain:copy(chain),events:[],sequence:0,checkpoints:[],seal:null};
}
export function checkpoint(state,eventId){
 audit(state);
 const decision=classify(state.chain,eventId),next=copy(state);
 next.sequence++;
 const event={seq:next.sequence,type:"INTERVAL_CHECKPOINT",eventId,
  status:decision.status,eligible:decision.eligible??false,
  trusted:false,seal:null,source:"NCI-029-VERIFIED_CHAIN",
  interval:decision.commonIntersection};
 next.events.push(event);next.checkpoints.push(copy(event));
 audit(next);return {state:next,decision};
}
export function audit(s){
 auditChain(s.chain);
 need(s.sequence===s.events.length&&s.events.every((e,i)=>e.seq===i+1),"event sequence gap");
 need(s.checkpoints.length===s.events.length,"checkpoint history gap");
 need(s.checkpoints.every(e=>e.trusted===false&&e.seal===null),"unearned evidence seal");
 return {valid:true,checks:s.checkpoints.length,chain:auditChain(s.chain),trusted:false,seal:null};
}
