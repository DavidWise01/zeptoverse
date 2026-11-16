/**
 * NCI-022: three coupled ideal-Casimir boundaries with one energy ledger.
 * Diatomic: paired quasistatic gap displacement.
 * Diodic: directional bookkeeping transfer of nonnegative work credits.
 * Divisive: split/join bookkeeping pockets, NOT physical plate division.
 * No self-powering engine and no measured Planck-foam mechanism is claimed.
 */
import {idealCasimir,signOfGap} from "./nci-021-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const ids=["A","B","C"];
const requireRule=(value,message)=>{if(!value)throw Error(message)};
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const tol=x=>Math.max(1e-35,Math.abs(x)*1e-11);
function valid(s){requireRule(s&&ids.every(id=>s.boundaries[id]),"missing boundary")}
function snapshot(s){
 return {gaps:Object.fromEntries(ids.map(id=>[id,s.boundaries[id].gap])),
  accounts:Object.fromEntries(ids.map(id=>[id,clone(s.boundaries[id].pockets)])),
  reservoir:s.reservoir};
}
function physical(s){return sum(ids.map(id=>idealCasimir(s.boundaries[id].gap,s.boundaries[id].area).energy))}
function credit(s){return sum(ids.flatMap(id=>Object.values(s.boundaries[id].pockets)))}
export function startTriad({gap=100e-9,area=1e-12,credits={A:3e-20,B:0,C:0}}={}){
 const boundaries={};
 for(const id of ids){
  const c=credits[id]??0;
  requireRule(Number.isFinite(c)&&c>=0,"initial credits must be finite and nonnegative");
  idealCasimir(gap,area);
  boundaries[id]={id,gap,referenceGap:gap,area,pockets:{main:c},witnessRoot:id};
 }
 const s={boundaries,gates:{"A>B":true,"B>C":true,"C>A":true},
  reservoir:0,initialTotal:0,genesis:null,events:[],generation:0,seal:null};
 s.initialTotal=physical(s)+credit(s);
 s.genesis=snapshot(s);
 auditTriad(s);
 return s;
}
export function auditTriad(s){
 valid(s);
 requireRule(s.events.length===s.generation&&s.events.every((e,i)=>e.seq===i+1),"broken lineage sequence");
 requireRule(ids.every(id=>s.boundaries[id].witnessRoot===id),"source root changed");
 for(const id of ids){
  const b=s.boundaries[id];idealCasimir(b.gap,b.area);
  requireRule(signOfGap(b.gap,b.referenceGap)===ternaryState(s,id),"ternary mismatch");
  requireRule(Object.values(b.pockets).every(v=>Number.isFinite(v)&&v>=-tol(s.initialTotal)),"negative credit");
 }
 const total=physical(s)+credit(s)+s.reservoir,delta=total-s.initialTotal;
 requireRule(Math.abs(delta)<=tol(s.initialTotal),"single-ledger energy failure");
 return {physicalEnergy:physical(s),credits:credit(s),reservoir:s.reservoir,
  total,initialTotal:s.initialTotal,balanceError:delta,
  ternary:Object.fromEntries(ids.map(id=>[id,ternaryState(s,id)])),
  physicalRestored:ids.every(id=>Math.abs(s.boundaries[id].gap-s.genesis.gaps[id])<=1e-12*s.genesis.gaps[id]),
  roots:ids,events:s.events.length,seal:s.seal};
}
export function ternaryState(s,id){
 requireRule(ids.includes(id),"unknown boundary");
 return signOfGap(s.boundaries[id].gap,s.boundaries[id].referenceGap);
}
function append(s,type,payload){
 s.generation++;s.events.push({seq:s.generation,type,payload:clone(payload)});s.seal=null;
 auditTriad(s);return s;
}
export function diatomic(state,first,second,newFirstGap,newSecondGap){
 auditTriad(state);
 requireRule(first!==second&&ids.includes(first)&&ids.includes(second),"two distinct known boundaries needed");
 const next=clone(state),prior=physical(next);
 idealCasimir(newFirstGap,next.boundaries[first].area);
 idealCasimir(newSecondGap,next.boundaries[second].area);
 next.boundaries[first].gap=newFirstGap;
 next.boundaries[second].gap=newSecondGap;
 const delta=physical(next)-prior;
 next.reservoir-=delta;
 return append(next,"DIATOMIC",{pair:[first,second],newGaps:[newFirstGap,newSecondGap],
  casimirDeltaJ:delta,reservoirDeltaJ:-delta});
}
export function diodic(state,from,to,amount,{fromPocket="main",toPocket="main"}={}){
 auditTriad(state);
 requireRule(state.gates[from+">"+to]===true,"reverse or absent diode");
 requireRule(Number.isFinite(amount)&&amount>0,"positive finite transfer required");
 const next=clone(state),a=next.boundaries[from].pockets,b=next.boundaries[to].pockets;
 requireRule(Object.hasOwn(a,fromPocket)&&Object.hasOwn(b,toPocket),"missing pocket");
 requireRule(a[fromPocket]>=amount,"insufficient credit");
 a[fromPocket]-=amount;b[toPocket]+=amount;
 return append(next,"DIODIC",{from,to,fromPocket,toPocket,amountJ:amount,
  evidenceRoot:"NCI-022-ledger",independentWitness:false});
}
export function divisive(state,id,pocket,fraction,left,right){
 auditTriad(state);
 requireRule(ids.includes(id),"unknown branch");
 requireRule(Number.isFinite(fraction)&&fraction>0&&fraction<1,"fraction must be between zero and one");
 const next=clone(state),p=next.boundaries[id].pockets;
 requireRule(Object.hasOwn(p,pocket)&&left!==right&&
  !Object.hasOwn(p,left)&&!Object.hasOwn(p,right),"invalid split IDs");
 const amount=p[pocket],leftEnergy=amount*fraction;
 delete p[pocket];p[left]=leftEnergy;p[right]=amount-leftEnergy;
 return append(next,"DIVISIVE",{branch:id,originalPocket:pocket,
  parts:[left,right],fraction,sourceRoot:id,physicalPlateCount:3});
}
export function join(state,id,left,right,target){
 auditTriad(state);requireRule(ids.includes(id),"unknown branch");
 const next=clone(state),p=next.boundaries[id].pockets;
 requireRule(left!==right&&Object.hasOwn(p,left)&&Object.hasOwn(p,right)&&
  !Object.hasOwn(p,target),"invalid join IDs");
 const value=p[left]+p[right];delete p[left];delete p[right];p[target]=value;
 return append(next,"JOIN",{branch:id,parts:[left,right],target,sourceRoot:id});
}
export function attemptDiodic(state,from,to,amount){
 try{return {state:diodic(state,from,to,amount),accepted:true,reason:"ACCEPTED"}}
 catch(e){
  auditTriad(state);
  const n=clone(state);
  append(n,"REJECT",{operator:"DIODIC",from,to,amountJ:amount,reason:String(e.message)});
  return {state:n,accepted:false,reason:String(e.message)};
 }
}
export function closeTriad(state){
 const before=auditTriad(state),next=clone(state);
 const accountsRestored=ids.every(id=>{
  const a=next.boundaries[id].pockets,b=next.genesis.accounts[id];
  return Object.keys(a).length===Object.keys(b).length &&
   Object.keys(b).every(k=>Object.hasOwn(a,k)&&Math.abs(a[k]-b[k])<=tol(next.initialTotal));
 });
 const workRestored=Math.abs(next.reservoir-next.genesis.reservoir)<=tol(next.initialTotal);
 const restored=before.physicalRestored&&accountsRestored&&workRestored;
 append(next,"CHECKPOINT",{restored,physicalRestored:before.physicalRestored,
  accountsRestored,workRestored});
 next.seal=restored?"1/1 END END":null;
 auditTriad(next);return next;
}
export function sampleRun(){
 let s=startTriad();
 s=diatomic(s,"A","B",50e-9,200e-9);
 s=diodic(s,"A","B",1e-20);
 s=divisive(s,"B","main",0.4,"left","right");
 s=join(s,"B","left","right","main");
 s=diodic(s,"B","C",1e-20);
 s=diodic(s,"C","A",1e-20);
 s=diatomic(s,"A","B",100e-9,100e-9);
 return closeTriad(s);
}
