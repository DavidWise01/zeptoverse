/** NCI-013. Deterministic append-only lineage kernel; conceptual, not molecular physics. */
const clone=x=>JSON.parse(JSON.stringify(x));
const unique=a=>[...new Set(a)];
function requireRule(ok,message){if(!ok)throw Error(message)}
export function createKernel(roots,edges=[]){
 requireRule(roots.length>0&&unique(roots.map(r=>r.id)).length===roots.length&&roots.every(r=>r.id&&Number.isSafeInteger(r.units)&&r.units>=0),"invalid roots");
 const inventory=Object.fromEntries(roots.map(r=>[r.id,r.units]));
 const nodes=Object.fromEntries(roots.map(r=>[r.id,{label:r.id,roots:[r.id],units:r.units}]));
 const lattice={};for(const [a,b] of edges){const key=[a,b].sort().join(":");requireRule(a!==b&&nodes[a]&&nodes[b]&&!lattice[key],"invalid edge");lattice[key]=[a,b]}
 return {inventory,nodes,active:roots.map(r=>r.id),edges:lattice,orientation:{},events:[],checkpoints:[],serial:0}
}
export function validate(s){
 const roots=s.active.flatMap(k=>s.nodes[k]?.roots||[]);
 requireRule(roots.length===Object.keys(s.inventory).length&&unique(roots).length===roots.length&&roots.every(k=>k in s.inventory),"lineage conservation");
 for(const k of s.active)requireRule(s.nodes[k].units===s.nodes[k].roots.reduce((n,r)=>n+s.inventory[r],0),"units conservation");
 requireRule(Object.keys(s.orientation).every(k=>s.edges[k]),"illegal orientation");return true
}
function event(s,type,payload){s.serial++;s.events.push({seq:s.serial,type,payload:clone(payload),active:clone(s.active)});validate(s);return s}
export function pair(state,a,b){const s=clone(state);requireRule(a!==b&&s.active.includes(a)&&s.active.includes(b),"inactive pair");return event(s,"DIATOMIC",{a,b})}
export function capture(state,a,b,label){
 const s=clone(state);requireRule(a!==b&&s.active.includes(a)&&s.active.includes(b),"inactive capture");
 requireRule(label&&!s.nodes[label],"reused label");
 const roots=[...s.nodes[a].roots,...s.nodes[b].roots];s.nodes[label]={label,roots,units:s.nodes[a].units+s.nodes[b].units};
 s.active=s.active.filter(k=>k!==a&&k!==b).concat(label);
 return event(s,"DIODIC",{from:a,grab:b,result:label,roots})
}
export function divide(state,parent,leftRoots,leftLabel,rightLabel){
 const s=clone(state);requireRule(s.active.includes(parent),"inactive parent");
 requireRule(leftLabel&&rightLabel&&leftLabel!==rightLabel&&!s.nodes[leftLabel]&&!s.nodes[rightLabel],"reused labels");
 const roots=s.nodes[parent].roots,left=unique(leftRoots),right=roots.filter(k=>!left.includes(k));
 requireRule(left.length&&right.length&&left.length===leftRoots.length&&left.every(k=>roots.includes(k)),"invalid split");
 for(const [label,parts] of [[leftLabel,left],[rightLabel,right]])s.nodes[label]={label,roots:parts,units:parts.reduce((n,k)=>n+s.inventory[k],0)};
 s.active=s.active.filter(k=>k!==parent).concat(leftLabel,rightLabel);
 return event(s,"DIVISIVE",{parent,left:leftLabel,right:rightLabel})
}
export function orient(state,from,to){
 const s=clone(state),key=[from,to].sort().join(":");requireRule(!!s.edges[key],"not a lattice edge");
 s.orientation[key]=[from,to];return event(s,"ORIENT",{from,to})
}
export function iceRule(state,vertices){
 return Object.fromEntries(vertices.map(v=>{
 const edges=Object.values(state.edges).filter(e=>e.includes(v));
 const directed=Object.values(state.orientation).filter(e=>e.includes(v));
 const outgoing=directed.filter(e=>e[0]===v).length,incoming=directed.filter(e=>e[1]===v).length;
 return [v,{degree:edges.length,outgoing,incoming,valid:edges.length===4&&directed.length===4&&outgoing===2&&incoming===2}]
 }))
}
export function checkpoint(state,name){
 const s=clone(state);validate(s);
 s.checkpoints.push({name,seq:s.serial,active:clone(s.active),lineage:Object.fromEntries(s.active.map(k=>[k,clone(s.nodes[k].roots)])),seal:"1/1 END END"});
 return s
}
export function replay(roots,edges,actions){
 let s=createKernel(roots,edges);
 for(const [operator,...args] of actions){const ops={pair,capture,divide,orient,checkpoint};requireRule(operator in ops,"unknown operator");s=ops[operator](s,...args)}
 return s
}
