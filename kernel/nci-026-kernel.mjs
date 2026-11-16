/**
 * NCI-026: three-witness prediction and provenance gate.
 * Default witnesses are three computations from ONE simulated observation.
 * Correlated predictions are not independent observations.
 */
import {begin as beginController, observe, audit as auditController} from "./nci-025-kernel.mjs";
import {rates} from "./nci-023-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const requireRule=(p,msg)=>{if(!p)throw Error(msg)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const kinds=["PHYSICS","LEARNED","CONSERVATION"];
export function begin({controller=beginController(),toleranceK=0.1,observationToleranceK=1e-6}={}){
 auditController(controller);
 requireRule(finite(toleranceK)&&toleranceK>0&&finite(observationToleranceK)&&observationToleranceK>=0,"invalid tolerances");
 return {controller:clone(controller),toleranceK,observationToleranceK,
  packets:[],gates:[],events:[],generation:0,sourceAncestry:"NCI-024-SIMULATION"};
}
/** Reconstruct cold temperature from the separate hot-reservoir and electrical accounts. */
export function reconstructCold(before,after){
 const c=before.heatCapacityColdJperK,h=before.heatCapacityHotJperK;
 const triadBefore=(before.initialEnergyJ-c*before.coldK-h*before.hotK-before.electricalJ);
 const triadAfter=(after.initialEnergyJ-c*after.coldK-h*after.hotK-after.electricalJ);
 requireRule(Math.abs(triadBefore-triadAfter)<1e-7,"triad unexpectedly changed");
 return (before.initialEnergyJ-h*after.hotK-after.electricalJ-triadAfter)/c;
}
function predictedPhysics(before,mode,seconds){
 const effective={
  ...before.parameters,coldK:before.coldK,hotK:before.hotK,
  currentA:mode==="PUMP"?before.parameters.currentA:0,
  conductanceWperK:mode==="STOP"?0:before.parameters.conductanceWperK
 };
 const r=rates(effective);
 return before.coldK-r.coldHeatW*seconds/before.heatCapacityColdJperK;
}
function packet({kind,generation,root,predictedK,observedK,dependsOn,method}){
 return {kind,generation,ancestryRoot:root,predictedK,observedK,
   errorK:observedK-predictedK,dependsOn:[...dependsOn],method};
}
export function agreement(packets,{toleranceK=0.1,observationToleranceK=1e-6}={}){
 requireRule(Array.isArray(packets)&&packets.length===3,"exactly three packets required");
 requireRule(new Set(packets.map(x=>x.kind)).size===3&&kinds.every(k=>packets.some(x=>x.kind===k)),"missing method witness");
 requireRule(packets.every(p=>finite(p.predictedK)&&finite(p.observedK)&&
   typeof p.ancestryRoot==="string"&&p.ancestryRoot.length>0),"invalid evidence packet");
 const roots=[...new Set(packets.map(x=>x.ancestryRoot))];
 const values=packets.map(p=>p.observedK),forecasts=packets.map(p=>p.predictedK);
 const observedSpreadK=Math.max(...values)-Math.min(...values);
 const forecastSpreadK=Math.max(...forecasts)-Math.min(...forecasts);
 const observationAgreement=observedSpreadK<=observationToleranceK;
 const forecastAgreement=forecastSpreadK<=toleranceK;
 return {observationAgreement,forecastAgreement,observedSpreadK,forecastSpreadK,
  ancestryRoots:roots,independentRoots:roots.length,
  sameObservationClaim:packets.every(p=>p.generation===packets[0].generation),
  status:!observationAgreement?"DISAGREE":roots.length<3?"SHARED_ANCESTRY":
    !forecastAgreement?"PREDICTIONS_DIVERGE":"ELIGIBLE_NOT_VERIFIED",
  // No externally authenticated independence or calibrated measurements are provided.
  trusted:false};
}
export function cycle(state,seconds=1){
 auditController(state.controller);
 const before=state.controller;
 const nextController=observe(before,seconds);
 const after=nextController.physical;
 const last=nextController.history.at(-1);
 const root=state.sourceAncestry+"#"+after.generation;
 const measured=after.coldK,mode=last.requestedMode;
 const packets=[
  packet({kind:"PHYSICS",generation:state.generation+1,root,
    predictedK:predictedPhysics(before.physical,mode,seconds),observedK:measured,
    dependsOn:["NCI-023 coefficients","NCI-024 initial reservoir"],
    method:"thermoelectric rate extrapolation"}),
  packet({kind:"LEARNED",generation:state.generation+1,root,
    predictedK:last.predictedK,observedK:measured,
    dependsOn:["NCI-025 historical policy","same simulated measurement"],
    method:"adaptive temperature slope"}),
  packet({kind:"CONSERVATION",generation:state.generation+1,root,
    predictedK:reconstructCold(before.physical,after),observedK:measured,
    dependsOn:["NCI-024 energy ledger","same simulated measurement"],
    method:"post-step energy reconstruction (not prospective prediction)"})
 ];
 const gate=agreement(packets,{toleranceK:state.toleranceK,
  observationToleranceK:state.observationToleranceK});
 requireRule(gate.observationAgreement,"simulated observation mismatch");
 const result=clone(state);result.controller=nextController;
 result.generation++;result.packets.push(...packets);
 result.gates.push({...gate,generation:result.generation});
 result.events.push({seq:result.generation,type:"THREE_WITNESS_GATE",
  status:gate.status,sharedSource:root,physicalEventSeq:after.generation,
  trusted:false,methodCount:3,distinctAncestryRoots:gate.independentRoots});
 return result;
}
export function audit(s){
 auditController(s.controller);
 requireRule(s.generation===s.events.length&&s.generation===s.gates.length&&
  s.packets.length===s.generation*3,"broken evidence lineage");
 requireRule(s.events.every((e,i)=>e.seq===i+1&&e.trusted===false),"incorrect event trust");
 requireRule(s.gates.every(x=>x.trusted===false),"unearned trust");
 return {generations:s.generation,lastGate:s.gates.at(-1)??null,
  physical:auditController(s.controller).physical,packets:s.packets.length,
  sharedSourceAncestry:true,independentMeasuredWitnesses:0};
}
export function iterate(s,steps=5,seconds=1){
 requireRule(Number.isSafeInteger(steps)&&steps>=0&&steps<=1000,"invalid step budget");
 let next=s;for(let i=0;i<steps;i++)next=cycle(next,seconds);
 return next;
}
