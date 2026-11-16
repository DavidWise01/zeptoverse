/**
 * NCI-033 — scalar Laplacian eigenmodes of a Dirichlet cube vs a
 * three-periodic cube (flat T^3). Identical side length L.
 * This is scalar field spectral mathematics, not electromagnetic Casimir
 * stress, literal doughnut embedding, or quantum-gravity prediction.
 *
 * Fixed operator frame: -1 cosmic background, 0 singlet reference,
 * +1 excited mode. All three are categorical, not Kelvin signs.
 */
import {HBAR,C} from "./nci-021-kernel.mjs";
import {PLANCK_M,CMB_K} from "./nci-032-kernel.mjs";
const requireRule=(x,msg)=>{if(!x)throw Error(msg)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
export const FRAME=Object.freeze([
 Object.freeze({sign:-1,role:"COSMIC_BACKGROUND"}),
 Object.freeze({sign:0,role:"REFERENCE_SINGLET"}),
 Object.freeze({sign:1,role:"FIELD_EXCITATION"})]);
export const GEOMETRIES=Object.freeze(["DIRICHLET_BOX","PERIODIC_T3"]);
export function spectrum({sideM=1e-21,maxIndex=3,geometry="DIRICHLET_BOX"}={}){
 requireRule(finite(sideM)&&sideM>0&&Number.isSafeInteger(maxIndex)&&maxIndex>=1&&maxIndex<=8,"invalid dimensions or cutoff");
 requireRule(GEOMETRIES.includes(geometry),"invalid boundary geometry");
 const periodic=geometry==="PERIODIC_T3",start=periodic?-maxIndex:1;
 const multiplier=(periodic?2:1)*Math.PI/sideM;
 const modes=[];let zeroMode=null;
 for(let nx=start;nx<=maxIndex;nx++)
 for(let ny=start;ny<=maxIndex;ny++)
 for(let nz=start;nz<=maxIndex;nz++){
  const n2=nx*nx+ny*ny+nz*nz;
  if(n2===0){
   zeroMode={indices:[0,0,0],frequencyHz:0,
    status:"PERIODIC_MASSLESS_ZERO_MODE_REQUIRES_SEPARATE_IR_TREATMENT"};
   continue;
  }
  const k=multiplier*Math.sqrt(n2),energyJ=HBAR*C*k;
  requireRule(finite(k)&&finite(energyJ),"mode outside numerical range");
  modes.push({indices:[nx,ny,nz],n2,wavenumberPerM:k,
   angularFrequencyRadPerS:C*k,oneQuantumEnergyJ:energyJ,
   sign:1});
 }
 modes.sort((a,b)=>a.n2-b.n2||
   a.indices[0]-b.indices[0]||a.indices[1]-b.indices[1]||a.indices[2]-b.indices[2]);
 const shells=[];
 for(const m of modes){
  let shell=shells.at(-1);
  if(!shell||shell.n2!==m.n2){
   shell={n2:m.n2,degeneracy:0,oneQuantumEnergyJ:m.oneQuantumEnergyJ};
   shells.push(shell);
  }
  shell.degeneracy++;
 }
 return {sideM,maxIndex,geometry,frame:FRAME.map(x=>({...x})),cmbK:CMB_K,
  zeroMode,excitedModeCount:modes.length,modes,shells,
  fundamental:modes[0],
  physics:"massless scalar Laplacian with ideal mathematical boundaries",
  limitations:"finite index cutoff, no vacuum renormalization, no stress tensor, no literal curved torus embedding"};
}
export function compare(options={}){
 const box=spectrum({...options,geometry:"DIRICHLET_BOX"});
 const torus=spectrum({...options,geometry:"PERIODIC_T3"});
 return {box,torus,lowestEnergyRatioTorusToBox:
   torus.fundamental.oneQuantumEnergyJ/box.fundamental.oneQuantumEnergyJ,
   expectedRatio:2/Math.sqrt(3),
   boxMinimumDegeneracy:box.shells[0].degeneracy,
   torusMinimumDegeneracy:torus.shells[0].degeneracy,
   periodicZeroModePresent:!!torus.zeroMode,
   physicalCasimirEnergyClaimed:false};
}
export function scaleTest({sideM=1e-21,ratio=10,maxIndex=2}={}){
 requireRule(finite(ratio)&&ratio>1,"invalid scale ratio");
 const a=compare({sideM,maxIndex});
 const b=compare({sideM:sideM/ratio,maxIndex});
 const checks=[
  ["box",a.box.fundamental.oneQuantumEnergyJ,b.box.fundamental.oneQuantumEnergyJ],
  ["torus",a.torus.fundamental.oneQuantumEnergyJ,b.torus.fundamental.oneQuantumEnergyJ]
 ].map(([geometry,ea,eb])=>({geometry,energyRatio:eb/ea,
   expected:ratio,relativeError:Math.abs(eb/ea/ratio-1)}));
 return {checks,passed:checks.every(x=>x.relativeError<1e-10),
  statement:"For fixed dimensionless mode indices, E = hbar c k scales as 1/L"};
}
export function audit(s){
 const result=compare(s);
 requireRule(result.box.fundamental.n2===3,"Dirichlet ground mode must be 111");
 requireRule(result.torus.fundamental.n2===1,"periodic first nonzero shell n2=1");
 requireRule(result.box.shells[0].degeneracy===1&&result.torus.shells[0].degeneracy===6,
  "incorrect minimal-shell degeneracy");
 requireRule(Math.abs(result.lowestEnergyRatioTorusToBox/(2/Math.sqrt(3))-1)<1e-12,"geometry ratio changed");
 requireRule(result.box.frame.map(x=>x.sign).join(",")==="-1,0,1","ternary frame changed");
 return {valid:true,lowestBoxMode:[1,1,1],lowestPeriodicN2:1,
  firstPeriodicDegeneracy:6,periodicZeroModeHandledSeparately:true,
  scaleLAbovePlanck:s.sideM>=PLANCK_M,
  claimedPhysicalPlanckPrediction:false};
}
