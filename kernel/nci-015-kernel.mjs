import {iceRule, validate} from "./nci-013-kernel.mjs";
import {makeDemo} from "./nci-014-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const edge=(a,b)=>[a,b].sort().join(":");
function invariant(s){validate(s);const sites=Object.keys(s.inventory);const rules=iceRule(s,sites);return {valid:sites.every(x=>rules[x].valid),failures:sites.filter(x=>!rules[x].valid),rules};}
function reject(s,reason,details={}){const n=clone(s);n.serial++;n.events.push({seq:n.serial,type:"PROTON_REJECT",payload:{reason,...details},active:clone(n.active)});return {state:n,accepted:false,reason}}
/** Each graph edge represents exactly one assigned proton nearest its donor site. */
export function protonLedger(state){const sites=Object.keys(state.inventory),r=invariant(state);return {iceRule:r,protons:Object.entries(state.orientation).sort(([a],[b])=>a.localeCompare(b)).map(([id,[donor,acceptor]])=>({edge:id,donor,acceptor})),numberOfBondProtons:Object.keys(state.orientation).length,siteCount:sites.length,geometry:"surrogate 4-regular K5, NOT Ice IX crystallography"}}
export function reverseBond(state,a,b){
 const key=edge(a,b);
 if(!state.edges[key]||!state.orientation[key])return reject(state,"MISSING_BOND",{a,b});
 const n=clone(state);n.orientation[key]=[...n.orientation[key]].reverse();
 const r=invariant(n);
 if(!r.valid)return reject(state,"ICE_RULE_VIOLATION",{bond:key,sites:r.failures});
 n.serial++;n.events.push({seq:n.serial,type:"PROTON_BOND_FLIP",payload:{edge:key},active:clone(n.active)});
 return {state:n,accepted:true,reason:"ACCEPTED"};
}
function validDirectedCycle(state,path){if(!Array.isArray(path)||path.length<3||new Set(path).size!==path.length)return false;
 for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length],o=state.orientation[edge(a,b)];if(!o||o[0]!==a||o[1]!==b)return false}return true}
export function reverseCycle(state,path){
 if(!validDirectedCycle(state,path))return reject(state,"NOT_A_DIRECTED_CYCLE",{path});
 const n=clone(state);for(let i=0;i<path.length;i++){const key=edge(path[i],path[(i+1)%path.length]);n.orientation[key]=[...n.orientation[key]].reverse()}
 const r=invariant(n);if(!r.valid)return reject(state,"ICE_RULE_VIOLATION",{sites:r.failures});
 n.serial++;n.events.push({seq:n.serial,type:"PROTON_CYCLE_REVERSAL",payload:{path:[...path],edgeCount:path.length},active:clone(n.active)});
 return {state:n,accepted:true,reason:"ACCEPTED"};
}
export function findDirectedCycles(state,length=3){const sites=Object.keys(state.inventory).sort(),results=[];
 const walk=(path)=>{if(path.length===length){if(validDirectedCycle(state,path)){const canonical=[...path];if(canonical[0]===canonical.slice().sort()[0])results.push(canonical)}return}
 for(const v of sites){if(!path.includes(v))walk([...path,v])}};
 walk([]);return results.sort((a,b)=>a.join(":").localeCompare(b.join(":"))) }
export function evolve(state,steps=1){if(!Number.isSafeInteger(steps)||steps<0||steps>10000)throw Error("invalid steps");let current=state,accepted=0;
 for(let n=0;n<steps;n++){const cycles=findDirectedCycles(current);
 if(!cycles.length){current=reject(current,"NO_DIRECTED_TRIANGLE").state;break}
 const result=reverseCycle(current,cycles[0]);current=result.state;if(!result.accepted)break;accepted++}
 return {state:current,accepted}}
export const demo=()=>makeDemo();
