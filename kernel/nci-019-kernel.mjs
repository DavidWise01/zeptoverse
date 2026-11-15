import {genesis,evidence,choices,select,microscopicSignature,validateWorld} from "./nci-017-kernel.mjs";
import {protonLedger} from "./nci-015-kernel.mjs";
const copy=x=>JSON.parse(JSON.stringify(x));
function rule(ok,message){if(!ok)throw Error(message)}
function bond(a,b){return [a,b].sort().join(":")}
function permutations(items){
 if(items.length===0)return [[]];
 return items.flatMap((v,i)=>permutations(items.filter((_,j)=>j!==i)).map(rest=>[v,...rest]));
}
/** Strict directed-graph isomorphism: topology and donor arrows must match. */
export function findMapping(source,target){
 const a=Object.keys(source.inventory).sort(),b=Object.keys(target.inventory).sort();
 if(a.length!==b.length||a.length>7)return null; // exhaustive bounded proof search
 for(const p of permutations(b)){
  const map=Object.fromEntries(a.map((id,i)=>[id,p[i]]));
  let valid=true;
  for(const x of a)for(const y of a){
   if(x>=y)continue;
   const old=source.orientation[bond(x,y)],now=target.orientation[bond(map[x],map[y])];
   if((!!source.edges[bond(x,y)])!==(!!target.edges[bond(map[x],map[y])]))){valid=false;break}
   if((!!old)!==(!!now) || (old&&(now[0]!==map[old[0]]||now[1]!==map[old[1]]))){valid=false;break}
  }
  if(valid)return map;
 }
 return null;
}
export function renameSurrogate(state,renames){
 const result=copy(state),roots=Object.keys(result.inventory),mapped=roots.map(x=>renames[x]);
 rule(mapped.every(x=>typeof x==="string"&&x)&&new Set(mapped).size===roots.length,"invalid rename map");
 const translate=x=>renames[x];
 result.inventory=Object.fromEntries(roots.map(x=>[translate(x),state.inventory[x]]));
 result.nodes=Object.fromEntries(roots.map(x=>[translate(x),{label:translate(x),roots:[translate(x)],units:state.inventory[x]}]));
 result.active=roots.map(translate);
 result.edges={};result.orientation={};
 for(const endpoints of Object.values(state.edges)){const [a,b]=endpoints.map(translate);result.edges[bond(a,b)]=[a,b]}
 for(const oriented of Object.values(state.orientation)){const [a,b]=oriented.map(translate);result.orientation[bond(a,b)]=[a,b]}
 result.events=[];result.checkpoints=[];result.serial=0;
 return result;
}
/**
 * Imported feedback retains original witness root. Re-importing the same
 * packet cannot inflate independent corroboration or add a second score.
 */
export function transfer(sourceWorld,targetWorld,{sourceId="NCI-019-SOURCE-1"}={}){
 validateWorld(sourceWorld);validateWorld(targetWorld);
 rule(typeof sourceId==="string"&&sourceId.trim().length>0,"missing provenance");
 const mapping=findMapping(sourceWorld.physical,targetWorld.physical);
 if(!mapping)return {world:copy(targetWorld),accepted:false,reason:"NON_ISOMORPHIC"};
 const oldSignature=microscopicSignature(sourceWorld.physical);
 let target=copy(targetWorld),imported=0,duplicates=0;
 for(const old of sourceWorld.policy.events.filter(e=>e.type==="POLICY_FEEDBACK"&&e.at===oldSignature)){
  const raw=old.action.split(">").map(node=>mapping[node]);
  const pivot=raw.indexOf([...raw].sort()[0]);
  const translated=[...raw.slice(pivot),...raw.slice(0,pivot)];
  rule(translated.every(x=>x),"lost origin mapping");
  const fingerprint=sourceId+"#"+old.seq;
  if(target.policy.events.some(e=>e.evidenceRoot===fingerprint)){duplicates++;continue}
  const possible=choices(target).some(candidate=>candidate.key===translated.join(">"));
  if(!possible)return {world:copy(targetWorld),accepted:false,reason:"UNMAPPED_ACTION"};
  target=evidence(target,translated,old.outcome,"import of "+fingerprint);
  target.policy.events[target.policy.events.length-1].evidenceRoot=fingerprint;
  target.policy.events[target.policy.events.length-1].sourceAncestry={sourceId,sequence:old.seq,originalAction:old.action};
  target.policy.events[target.policy.events.length-1].independentWitness=false;
  imported++;
 }
 return {world:target,accepted:true,reason:"STRUCTURE_MATCH",mapping,imported,duplicates};
}
export function demonstrate(){
 const s=genesis();
 const first=select(s),experienced=evidence(s,first.path,"failure","synthetic failed choice");
 const renamed=renameSurrogate(s.physical,{A:"P",B:"Q",C:"R",D:"S",E:"T"});
 const target=genesis(renamed);
 const imported=transfer(experienced,target,{sourceId:"TRAINING-ROOT"});
 return {sourceFirst:first.key,targetBefore:select(target)?.key,
  targetAfter:select(imported.world)?.key,imported,microstatePreserved:
  microscopicSignature(imported.world.physical)===microscopicSignature(target.physical)};
}
export function checkTransfer(world){
 validateWorld(world);
 rule(protonLedger(world.physical).iceRule.valid,"ice-rule lost");
 const receipts=world.policy.events.filter(e=>e.evidenceRoot);
 rule(new Set(receipts.map(e=>e.evidenceRoot)).size===receipts.length,"double counted source packet");
 rule(receipts.every(e=>e.independentWitness===false&&!!e.sourceAncestry),"lost ancestry");
 return true;
}
