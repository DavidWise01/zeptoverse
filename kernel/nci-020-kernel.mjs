/** NCI-020: signed balanced-ternary nested-foam computational kernel.
 * Signs are dimensionless relative deviations, never physical kelvin.
 * Casimir and quantum foam are analogies; no physics derived here.
 */
export const STATES=Object.freeze([-1,0,1]);
export const SYMBOLS=Object.freeze({"-1":"−","0":"0","1":"+"});
const clone=x=>JSON.parse(JSON.stringify(x));
function ensure(ok,message){if(!ok)throw Error(message)}
const sum=xs=>xs.reduce((a,b)=>a+b,0);
export function balancedDigits(value){
 ensure(Number.isSafeInteger(value),"integer required");
 const out=[];let n=value;
 do{let r=((n+1)%3+3)%3-1;out.push(r);n=(n-r)/3}while(n!==0);
 return out;
}
export function decodeDigits(digits){
 ensure(Array.isArray(digits)&&digits.length>0&&digits.every(x=>STATES.includes(x)),"invalid ternary digits");
 return digits.reduce((total,digit,index)=>total+digit*3**index,0);
}
export function newFoam({depth=1,root="i",units=1}={}){
 ensure(Number.isSafeInteger(depth)&&depth>=0&&depth<=7,"depth outside finite bound");
 ensure(typeof root==="string"&&root.length>0,"root name required");
 ensure(Number.isSafeInteger(units)&&units>=0,"nonnegative integer units required");
 const cells={},order=[];
 function birth(id,level,parent,sign){
  cells[id]={id,level,parent,sign,children:[],witnessRoot:root};
  order.push(id);
  if(level===depth)return;
  for(const [suffix,d] of [["n",-1],["z",0],["p",1]]){
   const child=id+"/"+suffix;
   cells[id].children.push(child);birth(child,level+1,id,d);
  }
 }
 birth(root,0,null,0);
 return {root,units,depth,cells,order,events:[],generation:0,operator:"{-1, [0, (+1)]}",seal:null};
}
export function verifyFoam(foam){
 ensure(foam.cells[foam.root]?.parent===null,"missing root");
 ensure(foam.order.length===Object.keys(foam.cells).length&&new Set(foam.order).size===foam.order.length,"address collision");
 ensure(foam.order.every(id=>foam.cells[id].witnessRoot===foam.root),"source ancestry changed");
 for(const id of foam.order){
  const n=foam.cells[id];
  ensure(STATES.includes(n.sign),"out-of-band sign");
  if(!n.children.length)continue;
  ensure(n.children.length===3,"broken triad");
  const signs=n.children.map(c=>foam.cells[c]?.sign);
  ensure(signs.every(x=>STATES.includes(x))&&sum(signs)===0,"triad not balanced");
  ensure(n.children.every(c=>foam.cells[c].parent===id),"broken parent edge");
 }
 ensure(foam.events.length===foam.generation,"generation gap");
 ensure(foam.events.every((e,i)=>e.seq===i+1),"event sequence changed");
 return true;
}
function record(foam,type,payload){
 const next=clone(foam);next.generation++;
 next.events.push({seq:next.generation,type,payload:clone(payload)});
 verifyFoam(next);return next;
}
/** A pair of sister cells exchanges +1/-1 while its parent keeps zero net. */
export function redistribute(foam,left,right){
 verifyFoam(foam);
 const a=foam.cells[left],b=foam.cells[right];
 if(!a||!b||left===right||a.parent!==b.parent||!a.parent)
  return record(foam,"REJECT",{reason:"NOT_SIBLINGS",left,right});
 const t=clone(foam),x=t.cells[left],y=t.cells[right];
 if(x.sign===0&&y.sign===0){
  x.sign=-1;y.sign=1;
 }else if(x.sign===-1&&y.sign===1){
  x.sign=0;y.sign=0;
 }else{
  return record(foam,"REJECT",{reason:"INVALID_TRANSFER",left,right});
 }
 const parent=t.cells[x.parent];
 if(sum(parent.children.map(id=>t.cells[id].sign))!==0)
  return record(foam,"REJECT",{reason:"UNBALANCED",left,right});
 return record(t,"REDISTRIBUTE",{left,right,before:[a.sign,b.sign],after:[x.sign,y.sign]});
}
/** Swap two sibling labels' signs: a diodic direction change, not new matter. */
export function rotate(foam,parent,direction=1){
 verifyFoam(foam);
 const p=foam.cells[parent];
 if(!p||p.children.length!==3||![1,-1].includes(direction))
  return record(foam,"REJECT",{reason:"INVALID_ROTATION",parent,direction});
 const next=clone(foam),ids=next.cells[parent].children;
 const signs=ids.map(id=>next.cells[id].sign);
 for(let k=0;k<3;k++)next.cells[ids[k]].sign=signs[(k-direction+3)%3];
 return record(next,"ROTATE",{parent,direction});
}
export function terminate(foam){
 verifyFoam(foam);
 const leaves=foam.order.filter(id=>foam.cells[id].children.length===0);
 const leafBalance=sum(leaves.map(id=>foam.cells[id].sign));
 ensure(leafBalance===0,"unbalanced terminal");
 const next=record(foam,"CHECKPOINT",{leafBalance,units:foam.units});
 next.seal="1/1 END END";return next;
}
export function audit(foam){
 verifyFoam(foam);
 const levels={};for(const id of foam.order){const n=foam.cells[id];levels[n.level]??={cells:0,balance:0};levels[n.level].cells++;levels[n.level].balance+=n.sign}
 const allBalanced=Object.values(levels).every(x=>x.balance===0);
 ensure(allBalanced,"depth balance changed");
 return {levels,totalCells:foam.order.length,rootUnits:foam.units,witnessRoots:[foam.root],
   rejected:foam.events.filter(e=>e.type==="REJECT").length,
   events:foam.events.length,allBalanced,seal:foam.seal};
}
