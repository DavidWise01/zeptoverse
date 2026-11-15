import { createKernel, capture, validate, iceRule } from "./nci-013-kernel.mjs";

/**
 * NCI-014: deterministic adjacency-constrained recursive capture.
 * A composite is a grouping of persistent lattice sites, not the fusion of atoms.
 * Micro-site topology and bond orientation remain immutable during capture.
 */
const copy = value => JSON.parse(JSON.stringify(value));
const sorted = xs => [...xs].sort((a,b)=>a.localeCompare(b));
function boundary(state, left, right) {
  const ls = new Set(state.nodes[left].roots), rs = new Set(state.nodes[right].roots);
  return Object.values(state.edges).filter(([a,b]) =>
    (ls.has(a)&&rs.has(b))||(ls.has(b)&&rs.has(a))).length;
}
function endpointCheck(state, labels) {
  const all = [...new Set(labels.flatMap(label=>state.nodes[label].roots))];
  const checks = iceRule(state,all);
  return {valid:all.every(root=>checks[root].valid), failures:all.filter(root=>!checks[root].valid)};
}
function recordRejection(state,attempt,reason,details={}) {
  const out = copy(state);
  out.serial += 1;
  out.events.push({seq:out.serial,type:"REJECT",payload:{...attempt,reason,...details},active:copy(out.active)});
  validate(out); return out;
}
export function candidates(state,anchor,config={}) {
  validate(state);
  if (!state.active.includes(anchor)) throw Error("inactive anchor");
  const maxUnits=config.maxUnits??Infinity;
  return state.active.filter(id=>id!==anchor).map(id=>({
    id,edges:boundary(state,anchor,id),
    combinedUnits:state.nodes[anchor].units+state.nodes[id].units,
    underCap:state.nodes[anchor].units+state.nodes[id].units<=maxUnits
  })).filter(x=>x.edges>0).sort((a,b)=>
    b.edges-a.edges||a.combinedUnits-b.combinedUnits||a.id.localeCompare(b.id));
}
export function attempt(state,anchor,neighbor,options={}) {
  validate(state);
  const context={anchor,neighbor};
  if(!state.active.includes(anchor)||!state.active.includes(neighbor)||anchor===neighbor)
    return {state:recordRejection(state,context,"INACTIVE_OR_IDENTICAL"),accepted:false,reason:"INACTIVE_OR_IDENTICAL"};
  if(boundary(state,anchor,neighbor)===0)
    return {state:recordRejection(state,context,"NOT_NEIGHBORS"),accepted:false,reason:"NOT_NEIGHBORS"};
  const check=endpointCheck(state,[anchor,neighbor]);
  if (!check.valid)
    return {state:recordRejection(state,context,"ICE_RULE", {sites:check.failures}),accepted:false,reason:"ICE_RULE"};
  const cap=options.maxUnits??Infinity,units=state.nodes[anchor].units+state.nodes[neighbor].units;
  if(units>cap)
    return {state:recordRejection(state,context,"CAPACITY",{units,maxUnits:cap===Infinity?"infinite":cap}),accepted:false,reason:"CAPACITY"};
  const label=options.label??nextLabel(state);
  if(state.nodes[label])
    return {state:recordRejection(state,context,"LABEL_COLLISION",{label}),accepted:false,reason:"LABEL_COLLISION"};
  const out=capture(state,anchor,neighbor,label);
  return {state:out,accepted:true,reason:"ACCEPTED",label,edges:boundary(state,anchor,neighbor)};
}
export function nextLabel(state) {
  let n=1;while(state.nodes["C"+String(n).padStart(4,"0")])n++;
  return "C"+String(n).padStart(4,"0");
}
export function selectAndCapture(state,anchor,options={}) {
  let out=state;
  const ranked=candidates(state,anchor,options);
  for(const candidate of ranked) {
    const result=attempt(out,anchor,candidate.id,options);
    out=result.state;
    if(result.accepted) return {...result,considered:ranked.map(x=>x.id)};
  }
  out=recordRejection(out,{anchor},"NO_LEGAL_CAPTURE",{candidates:ranked.map(x=>x.id)});
  return {state:out,accepted:false,reason:"NO_LEGAL_CAPTURE",considered:ranked.map(x=>x.id)};
}
export function iterate(state,anchor,options={}) {
  const maxSteps=options.maxSteps??state.active.length-1;
  if(!Number.isSafeInteger(maxSteps)||maxSteps<0||maxSteps>10000)throw Error("invalid step limit");
  let out=state,steps=0,rejections=0,stop="STEP_LIMIT";
  for(;steps<maxSteps;){
    const result=selectAndCapture(out,anchor,options);
    out=result.state;
    if(!result.accepted){stop=result.reason;break}
    anchor=result.label;steps++;
    if(out.active.length===1){stop="SINGLE_COMPOSITE";break}
  }
  return {state:out,steps,rejections:out.events.filter(e=>e.type==="REJECT").length-state.events.filter(e=>e.type==="REJECT").length,stop,anchor};
}
/** A mathematical 4-regular, 2-in/2-out graph. Not an Ice IX crystal lattice. */
export function makeDemo(){
  const sites=["A","B","C","D","E"],edges=[];
  for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)edges.push([sites[i],sites[j]]);
  let s=createKernel(sites.map(id=>({id,units:1})),edges);
  // Cyclic regular tournament: each root has exactly two outgoing arcs.
  for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){
    const forward=([1,2].includes((j-i+5)%5));
    const a=forward?sites[i]:sites[j],b=forward?sites[j]:sites[i];
    s.orientation[[sites[i],sites[j]].sort().join(":")]=[a,b];
  }
  validate(s);
  return s;
}
