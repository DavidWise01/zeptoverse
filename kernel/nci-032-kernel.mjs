/**
 * NCI-032 — Zeptoverse scale physics, anchored to user's fixed ternary frame.
 * -1 cosmic background; 0 reference singlet; +1 positive departure.
 * This state code is dimensionless, not a signed temperature or force.
 * Ideal Casimir formulas are evaluated algebraically but NOT asserted
 * to predict physically realizable plates at zepto/Planck separations.
 */
import {HBAR,C,idealCasimir} from "./nci-021-kernel.mjs";
const valid=(x,msg)=>{if(!x)throw Error(msg)};
export const G=6.67430e-11; // m^3 kg^-1 s^-2, CODATA 2022
export const KB=1.380649e-23; // J/K exact
export const CMB_K=2.7255; // Kelvin, illustrative mean cosmic background
export const PLANCK_M=Math.sqrt(HBAR*G/C**3);
export const OPERANTS=Object.freeze({"-1":"COSMIC_BACKGROUND","0":"REFERENCE_SINGLET","1":"POSITIVE_DEPARTURE"});
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const clone=x=>JSON.parse(JSON.stringify(x));
export function frame({backgroundK=CMB_K,referenceK=CMB_K,departureK=.001}={}){
 valid([backgroundK,referenceK,departureK].every(finite)&&backgroundK>0&&referenceK>0&&departureK>0,"invalid Kelvin frame");
 const result={operants:"{-1, [0, (+1)]}",states:[
  {sign:-1,role:"COSMIC_BACKGROUND",kelvin:backgroundK},
  {sign:0,role:"REFERENCE_SINGLET",kelvin:referenceK},
  {sign:1,role:"POSITIVE_DEPARTURE",kelvin:referenceK+departureK}],
  thermalContext:"CMB as external reference environment, not a Planck-scale local thermostat"};
 valid(result.states[2].kelvin>result.states[1].kelvin,"departure must exceed reference");
 return result;
}
export function sample(gapM,{areaM2=1e-12,backgroundK=CMB_K}={}){
 valid(finite(gapM)&&gapM>0&&finite(areaM2)&&areaM2>0&&finite(backgroundK)&&backgroundK>0,"positive finite physical input required");
 const ideal=idealCasimir(gapM,areaM2);
 const alphaG=(PLANCK_M/gapM)**2;
 const thermalRatio=KB*backgroundK*gapM/(HBAR*C); // kBT / (hbar c / L)
 const interpretation=gapM<=10*PLANCK_M?"PLANCK_REGIME_EXTRAPOLATION":
  gapM<1e-9?"BELOW_CONTINUUM_MATERIAL_VALIDITY":"IDEAL_PLATE_APPROXIMATION_ONLY";
 return {gapM,areaM2,idealEnergyJ:ideal.energy,idealPressurePa:ideal.pressure,
  forceN:ideal.force,alphaG,thermalRatio,
  interpretation,physicalPredictionValidated:false,
  geometry:"ideal parallel-plate field model",
  assumptions:"zero-temperature perfect conductors, plane boundaries, external CMB comparison only"};
}
export function sweep({startM=1e-21,steps=15,ratio=10,areaM2=1e-12}={}){
 valid(finite(startM)&&startM>PLANCK_M&&Number.isSafeInteger(steps)&&steps>=1&&steps<=100&&
 finite(ratio)&&ratio>1,"invalid scale sweep");
 const points=[];
 for(let i=0;i<steps;i++){
  const gapM=Math.max(PLANCK_M,startM/ratio**i);
  points.push({...sample(gapM,{areaM2}),generation:i});
  if(gapM===PLANCK_M)break;
 }
 return {frame:frame(),points,scaleRule:"L_next = max(L_P, L_current / ratio)",
   categories:{background:-1,reference:0,positiveDeparture:1},
   planckLengthM:PLANCK_M,
   note:"No observational or experimental claim at zepto-to-Planck separations"};
}
export function scalingInvariant(a,b){
 const left=sample(a),right=sample(b),ratio=a/b;
 const pressureRatio=right.idealPressurePa/left.idealPressurePa;
 const energyRatio=right.idealEnergyJ/left.idealEnergyJ;
 const gravitationalRatio=right.alphaG/left.alphaG;
 const relative=(actual,expected)=>Math.abs(actual/expected-1);
 return {ratio,pressureRatio,energyRatio,gravitationalRatio,
  inverseFourthError:relative(pressureRatio,ratio**4),
  inverseThirdError:relative(energyRatio,ratio**3),
  inverseSecondGravityError:relative(gravitationalRatio,ratio**2),
  passed:[relative(pressureRatio,ratio**4),relative(energyRatio,ratio**3),
    relative(gravitationalRatio,ratio**2)].every(x=>x<1e-10),
  units:"m, Pa, J, dimensionless alphaG"};
}
export function audit(state){
 valid(state.frame.states.map(x=>x.sign).join(",")==="-1,0,1","ternary frame changed");
 valid(state.points.every((p,i)=>p.generation===i&&p.gapM>=PLANCK_M&&p.idealPressurePa<0&&
   p.alphaG>0&&p.physicalPredictionValidated===false),"invalid physics sweep");
 valid(state.points.every((p,i)=>i===0||p.gapM<state.points[i-1].gapM),"nonshrinking scale");
 return {valid:true,generations:state.points.length,planckLengthM:PLANCK_M,
  smallestM:state.points.at(-1)?.gapM??null,
  physicalEvidenceClaimed:false,ternaryRoles:clone(state.categories)};
}
