/**
 * NCI-025: Hysteretic, observation-updated controller.
 * Pure supervisory state separate from NCI-024 physical heat/electrical model.
 * "Memory foam" is a controller analogy, NOT viscoelastic spacetime physics.
 */
import {initialize,step,audit as auditPhysics} from "./nci-024-kernel.mjs";
import {rates} from "./nci-023-kernel.mjs";
const copy=x=>JSON.parse(JSON.stringify(x));
const ok=(x,m)=>{if(!x)throw Error(m)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
export function begin({physical=initialize(),onBandK=0.08,offBandK=0.05,coastBandK=0.05,learnRate=0.5,
    initialSlopeKperS={PUMP:-0.1,COAST:0,STOP:0}}={}){
  auditPhysics(physical);
  ok([onBandK,offBandK,coastBandK,learnRate,...Object.values(initialSlopeKperS)].every(finite),"finite controller inputs");
  ok(onBandK>0&&offBandK>0&&coastBandK>0&&learnRate>0&&learnRate<=1,"invalid hysteresis or learning parameters");
  ok(["PUMP","COAST","STOP"].every(k=>finite(initialSlopeKperS[k])),"missing slope estimate");
  return {physical:copy(physical),policy:{onBandK,offBandK,coastBandK,learnRate,
      latch:"STOP",slopes:copy(initialSlopeKperS),samples:{PUMP:0,COAST:0,STOP:0}},
    history:[],generation:0};
}
export function choose(s){
  const {physical:p,policy:q}=s,t=p.targetColdK;
  const hotBlocked=p.hotK>=p.hotCeilingK;
  const rate=rates({...p.parameters,coldK:p.coldK,hotK:p.hotK});
  const pumpAvailable=rate.coldHeatW>0&&rate.electricalW>0&&
    p.electricalJ>0&&!hotBlocked;
  if(pumpAvailable){
    if(q.latch==="PUMP"&&p.coldK>t-q.offBandK)return {mode:"PUMP",reason:"HYSTERESIS_HOLD"};
    if(p.coldK>t+q.onBandK)return {mode:"PUMP",reason:"UPPER_TRIGGER"};
  }
  if(p.coldK<t-q.coastBandK&&p.hotK>p.coldK)return {mode:"COAST",reason:"PASSIVE_REWARM"};
  return {mode:"STOP",reason:hotBlocked?"HOT_LIMIT":"DEADBAND_OR_NO_POWER"};
}
function validate(s){
  auditPhysics(s.physical);
  ok(s.generation===s.history.length&&s.history.every((e,i)=>e.seq===i+1),"learning event gap");
  ok(["PUMP","COAST","STOP"].includes(s.policy.latch),"invalid latch");
  ok(Object.values(s.policy.samples).every(x=>Number.isSafeInteger(x)&&x>=0),"bad sample count");
  ok(s.history.every(e=>e.observedMode===e.requestedMode&&
    e.observedK>0&&Number.isFinite(e.errorK)),"invalid observation");
  return true;
}
export function observe(s,dt=1){
  validate(s);
  ok(finite(dt)&&dt>0&&dt<=5,"invalid integration step");
  const decision=choose(s),p=s.physical,q=s.policy;
  // Use NCI-024's exact electrical budget gate; if a step cannot be afforded,
  // choose STOP before invoking the physical transition.
  const r=rates({...p.parameters,coldK:p.coldK,hotK:p.hotK,
    currentA:decision.mode==="PUMP"?p.parameters.currentA:0,
    conductanceWperK:decision.mode==="STOP"?0:p.parameters.conductanceWperK});
  let requested=decision.mode,reason=decision.reason;
  if(requested==="PUMP"&&r.electricalW*dt>p.electricalJ+1e-12){
    requested="STOP";reason="INSUFFICIENT_ELECTRICAL_STORE";
  }
  const estimate=q.slopes[requested],predicted=p.coldK+estimate*dt;
  const actual=step(p,dt,requested);
  const measured=(actual.coldK-p.coldK)/dt,error=actual.coldK-predicted;
  const next=copy(s);
  next.physical=actual;
  next.policy.slopes[requested]=(1-q.learnRate)*estimate+q.learnRate*measured;
  next.policy.samples[requested]++;
  next.policy.latch=requested;
  next.generation++;
  next.history.push({seq:next.generation,type:"PREDICTION_OBSERVATION",
    requestedMode:requested,observedMode:actual.lastMode,
    trigger:reason,seconds:dt,predictedK:predicted,observedK:actual.coldK,
    errorK:error,priorSlopeKperS:estimate,measuredSlopeKperS:measured,
    updatedSlopeKperS:next.policy.slopes[requested],
    physicalEventSeq:actual.generation});
  validate(next);return next;
}
export function iterate(s,n=10,dt=1){
  ok(Number.isSafeInteger(n)&&n>=0&&n<=1000,"invalid generation limit");
  let next=s;for(let i=0;i<n;i++)next=observe(next,dt);
  return next;
}
export function audit(s){
  validate(s);
  const errors=s.history.map(e=>Math.abs(e.errorK));
  return {physical:auditPhysics(s.physical),generation:s.generation,
    latch:s.policy.latch,learnedSlopes:copy(s.policy.slopes),
    sampleCounts:copy(s.policy.samples),
    meanAbsolutePredictionErrorK:errors.length?errors.reduce((a,b)=>a+b,0)/errors.length:null,
    lastAbsolutePredictionErrorK:errors.length?errors.at(-1):null,
    energyConserved:true,entropyNonnegative:s.physical.entropyJperK>=-1e-9};
}
