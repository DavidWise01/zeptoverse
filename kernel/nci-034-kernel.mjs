/**
 * NCI-034 — CANONICAL LOCK:
 * {brace/gyro[box(torroid)]}
 * Fixed box boundary and variable periodic T^3 inner mode, modeled by a
 * two-mode effective Hermitian energy matrix with gyro orientation.
 *
 * Scalar eigenmodes are drawn from NCI-033. This is an explicit effective
 * coupling MODEL, NOT the spectrum of a physically solved nested cavity,
 * rotating quantum vacuum, or verified Planck-scale spacetime.
 */
import {spectrum} from "./nci-033-kernel.mjs";
import {PLANCK_M,CMB_K} from "./nci-032-kernel.mjs";
const requireRule=(v,m)=>{if(!v)throw Error(m)};
const finite=x=>typeof x==="number"&&Number.isFinite(x);
export const CANONICAL_GEOMETRY="{brace/gyro[box(torroid)]}";
export const OPERANTS=Object.freeze([-1,0,1]);
export const ROLES=Object.freeze(["COSMIC_BACKGROUND","REFERENCE_SINGLET","POSITIVE_DEPARTURE"]);
/** angle changes coupling only when coupling's anisotropy is nonzero. */
export function coupledModes({
 sideM=1e-21,angleRad=0,coupling=0.1,anisotropy=0.3,
 innerScale=0.8
}={}){
 requireRule([sideM,angleRad,coupling,anisotropy,innerScale].every(finite),
  "finite geometry parameters required");
 requireRule(sideM>0&&innerScale>0&&innerScale<=1&&coupling>=0&&coupling<1&&
  anisotropy>=0&&anisotropy<=1&&coupling*(1+anisotropy)<1,
  "unstable or invalid coupling geometry");
 // The box is fixed at sideM; only the interior T^3 scale varies.
 const box=spectrum({sideM,maxIndex:1,geometry:"DIRICHLET_BOX"});
 const tor=spectrum({sideM:sideM*innerScale,maxIndex:1,geometry:"PERIODIC_T3"});
 const boxEnergyJ=box.fundamental.oneQuantumEnergyJ;
 const innerEnergyJ=tor.fundamental.oneQuantumEnergyJ;
 const effectiveCoupling=coupling*(1+anisotropy*Math.cos(2*angleRad));
 const offDiagonalJ=effectiveCoupling*Math.sqrt(boxEnergyJ*innerEnergyJ);
 const centerJ=(boxEnergyJ+innerEnergyJ)/2;
 const splitJ=Math.hypot((boxEnergyJ-innerEnergyJ)/2,offDiagonalJ);
 const lowerJ=centerJ-splitJ,upperJ=centerJ+splitJ;
 requireRule(lowerJ>0&&upperJ>lowerJ,"nonpositive or degenerate coupled energies");
 const traceResidualJ=(lowerJ+upperJ)-(boxEnergyJ+innerEnergyJ);
 const detResidualJ=(lowerJ*upperJ)-(boxEnergyJ*innerEnergyJ-offDiagonalJ**2);
 const mixingAngleRad=0.5*Math.atan2(2*offDiagonalJ,boxEnergyJ-innerEnergyJ);
 return {
  geometry:CANONICAL_GEOMETRY,frame:OPERANTS.map((sign,i)=>({sign,role:ROLES[i]})),
  backgroundK:CMB_K,sideM,innerSideM:sideM*innerScale,innerScale,
  gyroAngleRad:angleRad,coupling,anisotropy,effectiveCoupling,
  matrixJ:[[boxEnergyJ,offDiagonalJ],[offDiagonalJ,innerEnergyJ]],
  uncoupledEnergiesJ:[boxEnergyJ,innerEnergyJ],
  eigenvaluesJ:[lowerJ,upperJ],splittingJ:2*splitJ,mixingAngleRad,
  traceResidualJ,detResidualJ,
  plane:"symmetric two-mode real Hermitian subspace",
  limitations:"phenomenological two-mode coupling, no full nested PDE solution, no rotating-frame dynamics, no vacuum renormalization",
  validatedPhysicalPrediction:false,planckExtrapolation:sideM<=100*PLANCK_M};
}
export function rotate({sideM=1e-21,coupling=.1,anisotropy=.3,innerScale=.8,
 steps=12}={}){
 requireRule(Number.isSafeInteger(steps)&&steps>=2&&steps<=360,"invalid gyro steps");
 const points=Array.from({length:steps+1},(_,i)=>coupledModes({
  sideM,coupling,anisotropy,innerScale,angleRad:i*2*Math.PI/steps}));
 const extrema=points.map(x=>x.splittingJ);
 return {geometry:CANONICAL_GEOMETRY,points,
  minSplittingJ:Math.min(...extrema),maxSplittingJ:Math.max(...extrema),
  orientationSensitive:anisotropy>0&&coupling>0,
  statement:"Orientation effects enter through an explicitly anisotropic interaction, not rigid rotation alone."};
}
export function audit(p){
 requireRule(p.geometry===CANONICAL_GEOMETRY,"geometry lock violated");
 requireRule(p.frame.map(x=>x.sign).join(",")==="-1,0,1","ternary frame violated");
 const E=p.uncoupledEnergiesJ,ev=p.eigenvaluesJ;
 const scale=Math.max(...E);
 requireRule(Math.abs(p.traceResidualJ)<=scale*1e-12,"trace nonconservation");
 requireRule(Math.abs(p.detResidualJ)<=scale*scale*1e-11,"determinant mismatch");
 requireRule(ev[0]>0&&ev[1]>ev[0],"invalid coupled eigenvalues");
 return {valid:true,canonical:CANONICAL_GEOMETRY,traceConserved:true,
  gyroscopicModelOnly:true,zeroModeExcluded:true,physicalEvidenceClaimed:false};
}
