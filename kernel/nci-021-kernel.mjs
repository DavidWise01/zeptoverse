/**
 * NCI-021: Ideal parallel-plate Casimir boundary test with a separate
 * balanced-ternary code. Zero-temperature perfect-conductor approximation.
 * The signed code is a relative gap deformation, never a temperature.
 */
export const HBAR = 1.054571817e-34; // J*s
export const C = 299792458;           // m/s (exact)
export const SIGNS = Object.freeze([-1,0,1]);
const copy=x=>JSON.parse(JSON.stringify(x));
const requireRule=(value,message)=>{if(!value)throw Error(message)};
function validGap(gap){requireRule(Number.isFinite(gap)&&gap>0,"gap must be positive and finite");}
function validArea(area){requireRule(Number.isFinite(area)&&area>0,"area must be positive and finite");}
export function idealCasimir(gap,area){
 validGap(gap);validArea(area);
 const energy=-Math.PI**2*HBAR*C*area/(720*gap**3);
 const pressure=-Math.PI**2*HBAR*C/(240*gap**4);
 const force=pressure*area;
 requireRule([energy,pressure,force].every(Number.isFinite),"out-of-range calculation");
 return {energy,pressure,force,energyPerArea:energy/area,
  assumptions:"perfect parallel conductors, vacuum, T=0, a small relative to lateral plate dimensions"};
}
export function signOfGap(gap,referenceGap){
 validGap(gap);validGap(referenceGap);
 const tolerance=1e-12*referenceGap;
 return Math.abs(gap-referenceGap)<=tolerance?0:(gap<referenceGap?-1:1);
}
export function start({gap=100e-9,area=1e-12}={}){
 const model=idealCasimir(gap,area);
 return {referenceGap:gap,gap,area,model,externalReservoir:0,
  initialTotal:model.energy,history:[],generation:0,seal:null,
  ternary:0,operator:"{-1, [0, (+1)]}"};
}
export function audit(state){
 const physical=idealCasimir(state.gap,state.area);
 const tolerance=Math.max(Math.abs(state.initialTotal)*1e-11,1e-35);
 const energyBalance=physical.energy+state.externalReservoir-state.initialTotal;
 requireRule(Math.abs(energyBalance)<=tolerance,"energy budget mismatch");
 requireRule(Math.abs(physical.energy-state.model.energy)<=tolerance,"physical cache mismatch");
 requireRule(state.ternary===signOfGap(state.gap,state.referenceGap),"ternary classification mismatch");
 requireRule(state.history.length===state.generation,"event count mismatch");
 requireRule(state.history.every((e,i)=>e.seq===i+1),"missing generation");
 requireRule(physical.force<0&&physical.pressure<0,"attractive force sign lost");
 return {valid:true,energyBalance,tolerance,ternary:state.ternary,
  relativeGap:state.gap/state.referenceGap,
  workReservoir:state.externalReservoir,physical,
  events:state.history.length,restored:state.gap===state.referenceGap,
  seal:state.seal};
}
/** Quasistatic displacement: external reservoir pays delta-Casimir-energy. */
export function move(state,newGap){
 audit(state);validGap(newGap);
 const next=copy(state),old=next.model,newModel=idealCasimir(newGap,state.area);
 const deltaEnergy=newModel.energy-old.energy;
 next.gap=newGap;next.model=newModel;next.externalReservoir-=deltaEnergy;
 next.ternary=signOfGap(newGap,state.referenceGap);next.generation++;
 next.seal=null;
 next.history.push({seq:next.generation,type:"GAP_MOVE",from:state.gap,to:newGap,
  deltaEnergy,externalReservoirDelta:-deltaEnergy,
  ternary:next.ternary,forceBefore:old.force,forceAfter:newModel.force});
 audit(next);return next;
}
/** Record rejected unsafe input with no change to physical gap or reservoir. */
export function attempt(state,newGap){
 try{return {state:move(state,newGap),accepted:true,reason:"ACCEPTED"}}
 catch(e){
  if(!Number.isFinite(newGap)||newGap<=0){
   const next=copy(state);next.generation++;
   next.history.push({seq:next.generation,type:"REJECT",reason:"INVALID_GAP",
     attempted:String(newGap),gap:state.gap,energy:state.model.energy});
   audit(next);return {state:next,accepted:false,reason:"INVALID_GAP"};
  }
  throw e;
 }
}
export function close(state){
 audit(state);
 const next=copy(state);
 const restored=Math.abs(state.gap-state.referenceGap)<=state.referenceGap*1e-12;
 next.generation++;
 next.seal=restored?"1/1 END END":null;
 next.history.push({seq:next.generation,type:"CHECKPOINT",restored,seal:next.seal});
 audit(next);return next;
}
