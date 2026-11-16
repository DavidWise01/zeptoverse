/**
 * NCI-024 — Homeostatic finite-reservoir triad controller.
 * Uses NCI-023's thermoelectric rates, but updates actual T each step.
 * Ternary control: -1=PUMP, 0=COAST (conductive contact), +1=STOP (isolate).
 * No claims of negative kelvin, Casimir generation, or Planck foam.
 */
import {rates} from "./nci-023-kernel.mjs";
import {startTriad,auditTriad} from "./nci-022-kernel.mjs";
const copy=x=>JSON.parse(JSON.stringify(x));
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const modes=Object.freeze({PUMP:-1,COAST:0,STOP:1});
const totalEnergy=s=>s.heatCapacityColdJperK*s.coldK+s.heatCapacityHotJperK*s.hotK+s.electricalJ+auditTriad(s.triad).total;
const entropy=(cold,hot,s)=>s.heatCapacityColdJperK*Math.log(cold/s.genesis.coldK)+s.heatCapacityHotJperK*Math.log(hot/s.genesis.hotK);
function append(state,type,payload){
 state.generation++;
 state.history.push({seq:state.generation,type,...payload});
 return state;
}
export function initialize({
 coldK=290,hotK=310,targetColdK=289.9,deadbandK=.02,
 heatCapacityColdJperK=100,heatCapacityHotJperK=200,
 electricalJ=1000,hotCeilingK=315,
 currentA=1,seebeckVperK=.02,resistanceOhm=2,conductanceWperK=.1,
 triad=startTriad()
}={}){
 check([coldK,hotK,targetColdK,deadbandK,heatCapacityColdJperK,heatCapacityHotJperK,
  electricalJ,hotCeilingK,currentA,seebeckVperK,resistanceOhm,conductanceWperK].every(finite),"finite inputs required");
 check(coldK>0&&hotK>=coldK&&targetColdK>0&&hotCeilingK>=hotK&&deadbandK>=0,"invalid temperatures or thresholds");
 check(heatCapacityColdJperK>0&&heatCapacityHotJperK>0&&electricalJ>=0,"capacities and electrical budget required");
 const params={currentA,seebeckVperK,resistanceOhm,conductanceWperK};
 rates({...params,coldK,hotK});
 auditTriad(triad);
 const s={coldK,hotK,targetColdK,deadbandK,hotCeilingK,heatCapacityColdJperK,
 heatCapacityHotJperK,electricalJ,parameters:params,triad:copy(triad),
 genesis:{coldK,hotK},history:[],generation:0,lastMode:null,entropyJperK:0,initialEnergyJ:0};
 s.initialEnergyJ=totalEnergy(s);
 audit(s);return s;
}
export function choose(state){
 audit(state);
 if(state.hotK>=state.hotCeilingK)return {mode:"STOP",sign:1,reason:"HOT_LIMIT"};
 const low=state.targetColdK-state.deadbandK,high=state.targetColdK+state.deadbandK;
 if(state.coldK>high){
  const p=rates({...state.parameters,coldK:state.coldK,hotK:state.hotK});
  if(p.coldHeatW<=0||p.electricalW<=0||state.electricalJ<=0)
   return {mode:"STOP",sign:1,reason:"NO_COOLING_OR_POWER"};
  return {mode:"PUMP",sign:-1,reason:"COLD_ABOVE_BAND"};
 }
 if(state.coldK<low)return {mode:"COAST",sign:0,reason:"COLD_BELOW_BAND"};
 return {mode:"STOP",sign:1,reason:"WITHIN_BAND"};
}
export function audit(s){
 check(s.history.length===s.generation&&s.history.every((e,i)=>e.seq===i+1),"broken history");
 check(s.coldK>0&&s.hotK>0&&s.heatCapacityColdJperK>0&&s.heatCapacityHotJperK>0,"nonpositive thermal state");
 check(s.electricalJ>=-1e-9,"negative electrical budget");
 const en=totalEnergy(s),residual=en-s.initialEnergyJ;
 check(Math.abs(residual)<=1e-8*Math.max(1,Math.abs(s.initialEnergyJ)),"energy conservation failure");
 const actualEntropy=entropy(s.coldK,s.hotK,s);
 check(Math.abs(actualEntropy-s.entropyJperK)<=1e-9*Math.max(1,Math.abs(actualEntropy)),"entropy audit mismatch");
 check(s.entropyJperK>=-1e-9,"second-law failure");
 return {valid:true,energyResidualJ:residual,entropyProducedJperK:s.entropyJperK,
  electricalJ:s.electricalJ,coldK:s.coldK,hotK:s.hotK,
  triad:auditTriad(s.triad),events:s.generation,lastMode:s.lastMode};
}
export function step(state,seconds=1,override=null){
 audit(state);
 check(finite(seconds)&&seconds>0&&seconds<=5,"time step outside (0,5] s");
 const decision=override===null?choose(state):{mode:override,sign:modes[override],reason:"MANUAL"};
 check(Object.hasOwn(modes,decision.mode),"unknown operating mode");
 const config={...state.parameters,coldK:state.coldK,hotK:state.hotK,
  currentA:decision.mode==="PUMP"?state.parameters.currentA:0,
  conductanceWperK:decision.mode==="STOP"?0:state.parameters.conductanceWperK};
 const r=rates(config),work=r.electricalW*seconds;
 check(work<=state.electricalJ+1e-12,"INSUFFICIENT_ELECTRICAL_STORE");
 const next=copy(state);
 next.coldK-=r.coldHeatW*seconds/next.heatCapacityColdJperK;
 next.hotK+=r.hotHeatW*seconds/next.heatCapacityHotJperK;
 next.electricalJ-=work;
 check(next.coldK>0&&next.hotK>0,"nonphysical temperature after integration");
 const ds=entropy(next.coldK,next.hotK,next)-state.entropyJperK;
 check(ds>=-1e-10,"negative entropy for proposed finite integration step");
 next.entropyJperK+=ds;
 next.lastMode=decision.mode;
 append(next,"CONTROL_STEP",{
  mode:decision.mode,sign:decision.sign,reason:decision.reason,seconds,
  currentA:config.currentA,conductanceWperK:config.conductanceWperK,
  coldHeatW:r.coldHeatW,hotHeatW:r.hotHeatW,electricalW:r.electricalW,
  entropyIncrementJperK:ds,physicalPlateCount:3
 });
 audit(next);return next;
}
export function attempt(state,seconds=1,override=null){
 try{return {state:step(state,seconds,override),accepted:true,reason:"ACCEPTED"}}
 catch(e){
  const next=copy(state);append(next,"REJECT",{reason:String(e.message),seconds:String(seconds),override});
  audit(next);return {state:next,accepted:false,reason:String(e.message)};
 }
}
export function iterate(state,maxSteps=100,seconds=1){
 check(Number.isSafeInteger(maxSteps)&&maxSteps>=0&&maxSteps<=10000,"invalid limit");
 let current=state,steps=0,reason="BUDGET";
 for(let k=0;k<maxSteps;k++){
  const decision=choose(current);
  if(decision.mode==="STOP"){reason=decision.reason;break}
  const attemptResult=attempt(current,seconds);
  current=attemptResult.state;
  if(!attemptResult.accepted){reason=attemptResult.reason;break}
  steps++;
 }
 return {state:current,steps,reason,audit:audit(current)};
}
export function demonstration(){
 const start=initialize(),first=choose(start);
 const progressed=iterate(start,100,1);
 return {first,progressed};
}
