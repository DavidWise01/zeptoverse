import {validate} from "./nci-013-kernel.mjs";
import {demo,protonLedger,findDirectedCycles,reverseCycle} from "./nci-015-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
function assert(test,msg){if(!test)throw Error(msg)}
function canonical(state){
 validate(state);
 return JSON.stringify({
  roots:Object.keys(state.inventory).sort().map(id=>[id,state.inventory[id]]),
  active:[...state.active].sort().map(id=>[id,[...state.nodes[id].roots].sort(),state.nodes[id].units]),
  bonds:Object.keys(state.edges).sort().map(id=>[id,state.orientation[id]?.join(">")??"UNASSIGNED"])
 });
}
/** Deterministic FNV-1a 32-bit state fingerprint for regression, not a cryptographic proof. */
export function fingerprint(state){
 const string=canonical(state);let hash=2166136261;
 for(let i=0;i<string.length;i++){hash^=string.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0}
 return hash.toString(16).padStart(8,"0");
}
export function beginMemory(state=demo()){
 const ledger=protonLedger(state);
 assert(ledger.iceRule.valid,"initial ice-rule violation");
 return {state:clone(state),genesis:fingerprint(state),history:[],generation:0};
}
export function transition(memory,path){
 const old=memory.state,prior=fingerprint(old),result=reverseCycle(old,path);
 const next=clone(memory);
 next.generation++;
 next.state=result.state;
 next.history.push({
  generation:next.generation,operator:"REVERSE_CYCLE",path:[...path],
  status:result.accepted?"ACCEPT":"REJECT",reason:result.reason,
  before:prior,after:fingerprint(result.state)
 });
 assert(protonLedger(next.state).iceRule.valid,"ice-rule lost");
 assert(next.history.length===next.generation,"history discontinuity");
 if(!result.accepted)assert(prior===fingerprint(result.state),"rejection mutated microscopic state");
 return next;
}
export function reverseLast(memory){
 const last=[...memory.history].reverse().find(e=>e.status==="ACCEPT");
 if(!last)throw Error("no accepted cycle to reverse");
 return transition(memory,[...last.path].reverse());
}
export function settle(memory){
 const state=memory.state,now=fingerprint(state);
 const returned=now===memory.genesis;
 const next=clone(memory);
 next.generation++;
 next.history.push({generation:next.generation,operator:"CHECKPOINT",status:returned?"RESTORED":"OPEN",
   before:now,after:now,seal:returned?"1/1 END END":null});
 next.checkpoint={generation:next.generation,restored:returned,genesis:memory.genesis,current:now};
 return next;
}
export function firstCycle(memory){return findDirectedCycles(memory.state)[0]??null}
export function verifyMemory(memory){
 assert(memory.history.length===memory.generation,"generation/history mismatch");
 assert(memory.history.every((e,i)=>e.generation===i+1),"missing generation");
 assert(memory.history.every((e,i)=>!i||memory.history[i-1].after===e.before),"broken witness chain");
 assert(memory.history.every(e=>e.status!=="REJECT"||e.before===e.after),"counterexample changed state");
 assert(memory.history.length===0||memory.history.at(-1).after===fingerprint(memory.state),"head mismatch");
 assert(protonLedger(memory.state).iceRule.valid,"ice-rule violation");
 return true;
}
