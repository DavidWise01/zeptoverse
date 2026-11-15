import {demo, protonLedger, findDirectedCycles, reverseCycle} from "./nci-015-kernel.mjs";
import {fingerprint} from "./nci-016-kernel.mjs";

/** NCI-017: a separate, append-only policy ledger. No changes to physical state. */
const copy=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function microscopicSignature(s){
 return JSON.stringify(Object.keys(s.edges).sort().map(edge=>[edge,s.orientation[edge]]));
}
function must(v,msg){if(!v)throw Error(msg)}
function key(path){return path.join(">")}
export function genesis(state=demo()){
 must(protonLedger(state).iceRule.valid,"bad initial ice rule");
 return {physical:copy(state),policy:{events:[],sequence:0},origin:microscopicSignature(state)};
}
export function evidence(world,path,kind,reason){
 must(["failure","success"].includes(kind),"unknown feedback");
 const choices=findDirectedCycles(world.physical).map(key);
 must(choices.includes(key(path)),"feedback needs a legal candidate in the current physical state");
 const next=copy(world);
 const e={seq:next.policy.sequence+1,type:"POLICY_FEEDBACK",at:microscopicSignature(next.physical),
  action:key(path),outcome:kind,reason:String(reason||"unspecified")};
 next.policy.sequence=e.seq;next.policy.events.push(e);
 must(same(next.physical,world.physical),"feedback changed physics");
 return next;
}
export function choices(world){
 const signature=microscopicSignature(world.physical);
 const paths=findDirectedCycles(world.physical);
 return paths.map(path=>{
  const matching=world.policy.events.filter(e=>e.at===signature&&e.action===key(path));
  const failures=matching.filter(e=>e.outcome==="failure").length;
  const successes=matching.filter(e=>e.outcome==="success").length;
  return {path,key:key(path),failures,successes,score:successes-failures*2};
 }).sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key));
}
export function select(world){return choices(world)[0]??null}
export function act(world){
 const selected=select(world);
 if(!selected)return {world:copy(world),accepted:false,reason:"NO_LEGAL_CYCLE"};
 const physicalResult=reverseCycle(world.physical,selected.path);
 const next=copy(world);
 next.physical=physicalResult.state;
 next.policy.sequence++;
 next.policy.events.push({seq:next.policy.sequence,type:"EXECUTION",
  at:microscopicSignature(world.physical),action:selected.key,
  result:physicalResult.reason,after:microscopicSignature(next.physical),
  physicalEventSeq:physicalResult.state.serial});
 return {world:next,accepted:physicalResult.accepted,reason:physicalResult.reason,chosen:selected.key};
}
export function inverse(world,path){
 const result=reverseCycle(world.physical,[...path].reverse());
 must(result.accepted,"reverse operation failed");
 const next=copy(world);next.physical=result.state;next.policy.sequence++;
 next.policy.events.push({seq:next.policy.sequence,type:"INVERSE",
  at:microscopicSignature(world.physical),action:key([...path].reverse()),
  result:result.reason,after:microscopicSignature(next.physical),
  physicalEventSeq:result.state.serial});
 return next;
}
export function validateWorld(world){
 must(protonLedger(world.physical).iceRule.valid,"physical ice-rule failure");
 must(world.policy.sequence===world.policy.events.length,"policy event gap");
 must(world.policy.events.every((event,i)=>event.seq===i+1),"policy sequence broken");
 must(world.policy.events.every(e=>e.type!=="POLICY_FEEDBACK"||["failure","success"].includes(e.outcome)),"invalid feedback");
 return true;
}
/** Demonstrate path-dependence: same physical orientation, different policy. */
export function witness(){
 const plain=genesis(),primary=select(plain);
 must(primary,"no initial legal candidate");
 const experienced=evidence(plain,primary.path,"failure","observed failure in a separate trial");
 const second=select(experienced);
 return {plain,experienced,primary,second,
  samePhysics:microscopicSignature(plain.physical)===microscopicSignature(experienced.physical),
  differentChoice:primary.key!==second?.key};
}
