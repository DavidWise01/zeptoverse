/**
 * NCI-023 — Thermodynamic-loss layer for the triadic Casimir kernel.
 * Fixed-temperature reservoirs, constant thermoelectric coefficients,
 * symmetric Joule-heat split; no temperature dynamics or Casimir power extraction.
 * Three physical Casimir boundaries remain in the untouched NCI-022 subsystem.
 */
import {startTriad,auditTriad,diatomic} from "./nci-022-kernel.mjs";
const copy=x=>JSON.parse(JSON.stringify(x));
function requireRule(ok,message){if(!ok)throw Error(message)}
function finite(x){return typeof x==="number"&&Number.isFinite(x)}
function close(a,b,scale=1){return Math.abs(a-b)<=1e-10*Math.max(Math.abs(a),Math.abs(b),scale)}
export function rates({coldK=290,hotK=310,currentA=1,seebeckVperK=.02,resistanceOhm=2,conductanceWperK=.1}={}){
 requireRule([coldK,hotK,currentA,seebeckVperK,resistanceOhm,conductanceWperK].every(finite),"finite inputs required");
 requireRule(coldK>0&&hotK>=coldK,"absolute reservoir temperatures must satisfy Th >= Tc > 0");
 requireRule(currentA>=0&&seebeckVperK>=0&&resistanceOhm>=0&&conductanceWperK>=0,"cooling-mode coefficients must be nonnegative");
 const deltaK=hotK-coldK,peltierColdW=seebeckVperK*currentA*coldK;
 const jouleW=currentA**2*resistanceOhm,leakW=conductanceWperK*deltaK;
 const coldHeatW=peltierColdW-jouleW/2-leakW;
 const hotHeatW=seebeckVperK*currentA*hotK+jouleW/2-leakW;
 const electricalW=seebeckVperK*currentA*deltaK+jouleW;
 const entropyWperK=hotHeatW/hotK-coldHeatW/coldK;
 const entropyDissipationWperK=jouleW/2*(1/hotK+1/coldK)+leakW*(1/coldK-1/hotK);
 requireRule([coldHeatW,hotHeatW,electricalW,entropyWperK].every(finite),"nonfinite power result");
 requireRule(close(hotHeatW-coldHeatW,electricalW),"first law rate failure");
 requireRule(entropyWperK>=-1e-12&&close(entropyWperK,entropyDissipationWperK),"second law rate failure");
 const cop=coldHeatW>0&&electricalW>0?coldHeatW/electricalW:null;
 const carnot=deltaK>0?coldK/deltaK:null;
 if(cop!==null&&carnot!==null)requireRule(cop<=carnot*(1+1e-10),"Carnot bound exceeded");
 return {coldK,hotK,currentA,seebeckVperK,resistanceOhm,conductanceWperK,
  peltierColdW,jouleW,leakW,coldHeatW,hotHeatW,electricalW,
  entropyWperK,entropyDissipationWperK,cop,carnot,
  cooling:coldHeatW>0};
}
export function begin({triad=startTriad(),parameters={}}={}){
 auditTriad(triad);
 const device=rates(parameters);
 return {triad:copy(triad),parameters:{
  coldK:device.coldK,hotK:device.hotK,currentA:device.currentA,
  seebeckVperK:device.seebeckVperK,resistanceOhm:device.resistanceOhm,
  conductanceWperK:device.conductanceWperK},
  // Energy changes in J relative to a common thermal/electrical baseline.
  accounts:{coldJ:0,hotJ:0,electricalJ:0},
  thermalEntropyJperK:0,events:[],generation:0,initialCombinedJ:auditTriad(triad).total};
}
export function audit(state){
 const physical=auditTriad(state.triad),a=state.accounts;
 requireRule([a.coldJ,a.hotJ,a.electricalJ,state.thermalEntropyJperK].every(finite),"nonfinite ledger");
 requireRule(state.events.length===state.generation&&state.events.every((e,i)=>e.seq===i+1),"broken event history");
 const energyResidual=physical.total+a.coldJ+a.hotJ+a.electricalJ-state.initialCombinedJ;
 const entropyExpected=-a.coldJ/state.parameters.coldK-a.hotJ/state.parameters.hotK;
 // cold reservoir loses Qc, hot reservoir receives Qh; delta S = -Qc/Tc + Qh/Th
 const entropyActual=a.coldJ/state.parameters.coldK+a.hotJ/state.parameters.hotK;
 requireRule(Math.abs(energyResidual)<=1e-10*Math.max(1,Math.abs(state.initialCombinedJ)),"energy conservation failure");
 requireRule(state.thermalEntropyJperK>=-1e-10,"negative entropy production");
 requireRule(close(entropyActual,state.thermalEntropyJperK,1e-12),"entropy ledger mismatch");
 return {valid:true,energyResidual,entropyProductionJperK:state.thermalEntropyJperK,
  coldJ:a.coldJ,hotJ:a.hotJ,electricalJ:a.electricalJ,
  casimirTriad:physical,events:state.generation};
}
export function tick(state,seconds){
 audit(state);
 requireRule(finite(seconds)&&seconds>0&&seconds<=3600,"time step must be positive and at most one hour");
 const next=copy(state),r=rates(state.parameters);
 next.accounts.coldJ-=r.coldHeatW*seconds;
 next.accounts.hotJ+=r.hotHeatW*seconds;
 next.accounts.electricalJ-=r.electricalW*seconds;
 next.thermalEntropyJperK+=r.entropyWperK*seconds;
 next.generation++;
 next.events.push({seq:next.generation,type:"THERMAL_TICK",seconds,
  coolingW:r.coldHeatW,hotW:r.hotHeatW,electricalW:r.electricalW,
  jouleW:r.jouleW,conductiveLeakW:r.leakW,entropyJperK:r.entropyWperK*seconds,
  cooling:r.cooling,coefficientOfPerformance:r.cop});
 audit(next);return next;
}
export function setDrive(state,currentA){
 audit(state);
 const r=rates({...state.parameters,currentA});
 const next=copy(state);next.parameters.currentA=r.currentA;next.generation++;
 next.events.push({seq:next.generation,type:"SET_CURRENT",currentA});
 audit(next);return next;
}
export function pairCasimir(state,first,second,gap1,gap2){
 audit(state);const next=copy(state);
 next.triad=diatomic(next.triad,first,second,gap1,gap2);
 next.generation++;
 next.events.push({seq:next.generation,type:"TRIAD_DISPLACEMENT",pair:[first,second],
  gaps:[gap1,gap2],underlyingEventSeq:next.triad.generation});
 audit(next);return next;
}
export function attemptTick(state,seconds){
 try{return {state:tick(state,seconds),accepted:true,reason:"ACCEPTED"}}
 catch(e){
  if(!finite(seconds)||seconds<=0||seconds>3600){
   const next=copy(state);next.generation++;
   next.events.push({seq:next.generation,type:"REJECT",operation:"THERMAL_TICK",
    seconds:String(seconds),reason:"INVALID_INTERVAL"});
   audit(next);return {state:next,accepted:false,reason:"INVALID_INTERVAL"};
  }
  throw e;
 }
}
export function demonstrate(){
 let s=begin();s=pairCasimir(s,"A","B",50e-9,200e-9);
 s=tick(s,1);
 s=pairCasimir(s,"A","B",100e-9,100e-9);
 return {state:s,report:audit(s),device:rates(s.parameters)};
}
