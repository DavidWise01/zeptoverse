/**
 * NCI-028 — signed witness receipts (ECDSA P-256 / SHA-256).
 * Registry entries are pinned BY the test operator, not discovered from packets.
 * Credential verification alone does not authenticate physical sensor independence.
 * No private keys, secrets, or test credentials are committed.
 */
const clone=x=>JSON.parse(JSON.stringify(x));
const check=(condition,message)=>{if(!condition)throw Error(message)};
const valid=x=>typeof x==="string"&&x.length>0;
const subtle=()=>{check(globalThis.crypto?.subtle,"WebCrypto unavailable");return globalThis.crypto.subtle};
const bytes=x=>new TextEncoder().encode(x);
const name=/^[A-Za-z0-9_.:-]{1,128}$/;
function identifier(x){return valid(x)&&name.test(x)}
function payload(p){
 return {schema:"NCI-028-P256-V1",eventId:p.eventId,sensorId:p.sensorId,
 rootId:p.rootId,measurementId:p.measurementId,valueK:p.valueK,
 timestampMs:p.timestampMs,nonce:p.nonce,upstreamRoots:p.upstreamRoots};
}
export function canonical(p){return JSON.stringify(payload(p))}
function validate(p){
 check(p&&["eventId","sensorId","rootId","measurementId","nonce"].every(k=>identifier(p[k])),"invalid IDs");
 check(typeof p.valueK==="number"&&Number.isFinite(p.valueK)&&p.valueK>0,"invalid kelvin reading");
 check(Number.isSafeInteger(p.timestampMs)&&p.timestampMs>=0,"invalid timestamp");
 check(Array.isArray(p.upstreamRoots)&&p.upstreamRoots.every(identifier)&&
   new Set(p.upstreamRoots).size===p.upstreamRoots.length,"invalid dependency roots");
 check(valid(p.signatureHex)&&/^[0-9a-f]+$/.test(p.signatureHex),"invalid signature encoding");
 return true;
}
const hex=arr=>Array.from(new Uint8Array(arr)).map(n=>n.toString(16).padStart(2,"0")).join("");
const unhex=s=>Uint8Array.from(s.match(/../g)||[],n=>parseInt(n,16));
export async function generateSigner(){
 return subtle().generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
}
export async function publicKeyJwk(pair){
 const jwk=await subtle().exportKey("jwk",pair.publicKey);
 return {kty:"EC",crv:"P-256",x:jwk.x,y:jwk.y,ext:true,key_ops:["verify"]};
}
export async function signPacket(fields,privateKey){
 const p={...clone(fields),schema:"NCI-028-P256-V1",signatureHex:"0"};
 validate(p);
 const signature=await subtle().sign({name:"ECDSA",hash:"SHA-256"},privateKey,bytes(canonical(p)));
 return {...p,signatureHex:hex(signature)};
}
export function begin({nowMs=100000,toleranceK=.05,maxSkewMs=1000,maxAgeMs=5000}={}){
 check(Number.isSafeInteger(nowMs)&&nowMs>=0&&
 [toleranceK,maxSkewMs,maxAgeMs].every(x=>Number.isFinite(x)&&x>=0),"invalid gate configuration");
 return {nowMs,toleranceK,maxSkewMs,maxAgeMs,
  registry:{},receipts:[],events:[],checkpoints:[],sequence:0,seal:null};
}
export function register(state,{sensorId,rootId,publicJwk,upstreamRoots=[],credentialIssuer="OPERATOR"}){
 check(identifier(sensorId)&&identifier(rootId)&&identifier(credentialIssuer),"invalid registry IDs");
 check(!Object.hasOwn(state.registry,sensorId),"sensor already pinned");
 check(Array.isArray(upstreamRoots)&&upstreamRoots.every(identifier)&&
 new Set(upstreamRoots).size===upstreamRoots.length,"invalid registry ancestry");
 check(publicJwk?.kty==="EC"&&publicJwk.crv==="P-256"&&valid(publicJwk.x)&&valid(publicJwk.y),"invalid P-256 key");
 const next=clone(state);
 next.registry[sensorId]={sensorId,rootId,publicJwk:clone(publicJwk),upstreamRoots:[...upstreamRoots],credentialIssuer,
 credentialOrigin:"PINNED_OPERATOR_CONFIGURATION",hardwareAttested:false};
 next.sequence++;next.events.push({seq:next.sequence,type:"REGISTER",sensorId,rootId,credentialIssuer});
 return next;
}
async function verifySigned(state,packet){
 validate(packet);
 const owner=state.registry[packet.sensorId];
 check(owner,"unregistered sensor");
 check(owner.rootId===packet.rootId,"sensor/root mismatch");
 check(JSON.stringify(owner.upstreamRoots)===JSON.stringify(packet.upstreamRoots),"ancestry mismatch");
 const key=await subtle().importKey("jwk",owner.publicJwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
 const matched=await subtle().verify({name:"ECDSA",hash:"SHA-256"},key,
 unhex(packet.signatureHex),bytes(canonical(packet)));
 check(matched,"signature verification failed");
 check(packet.timestampMs<=state.nowMs&&state.nowMs-packet.timestampMs<=state.maxAgeMs,"stale or future timestamp");
 check(!state.receipts.some(p=>p.sensorId===packet.sensorId&&p.nonce===packet.nonce),"replayed nonce");
 check(!state.receipts.some(p=>p.sensorId===packet.sensorId&&p.eventId===packet.eventId),"duplicate sensor for event");
 check(!state.receipts.some(p=>p.measurementId===packet.measurementId),"duplicated measurement ancestry");
 return owner;
}
export async function acquire(state,packet){
 const next=clone(state);let accepted=false,reason="ACCEPTED";
 try{await verifySigned(state,packet);accepted=true;}catch(e){reason=String(e.message||e)}
 if(accepted)next.receipts.push(clone(packet));
 next.sequence++;
 next.events.push({seq:next.sequence,type:accepted?"SIGNED_RECEIPT":"REJECT",
  sensorId:String(packet?.sensorId??""),eventId:String(packet?.eventId??""),
  reason,credentialVerified:accepted});
 return {state:next,accepted,reason};
}
function setsOverlap(a,b){return a.some(x=>b.includes(x))}
export function inspect(state,eventId){
 check(identifier(eventId),"invalid event ID");
 const packets=state.receipts.filter(x=>x.eventId===eventId);
 if(packets.length!==3)return {status:"COUNT_MISMATCH",count:packets.length,eligible:false,seal:null,physicallyIndependent:false};
 const sets=packets.map(p=>[p.rootId,...state.registry[p.sensorId].upstreamRoots]);
 const shared=sets.some((x,i)=>sets.some((y,j)=>i<j&&setsOverlap(x,y)));
 const readings=packets.map(p=>p.valueK),times=packets.map(p=>p.timestampMs);
 const spreadK=Math.max(...readings)-Math.min(...readings);
 const skewMs=Math.max(...times)-Math.min(...times);
 const valuesAgree=spreadK<=state.toleranceK,clocksAgree=skewMs<=state.maxSkewMs;
 const physicallyIndependent=false;
 const status=shared?"SHARED_ROOT":!clocksAgree?"CLOCK_DISAGREEMENT":
 !valuesAgree?"READING_DISAGREEMENT":"CREDENTIAL_VERIFIED";
 return {status,count:3,eligible:!shared&&valuesAgree&&clocksAgree,
   signatureVerified:true,structuralIndependence:!shared,physicallyIndependent,
   roots:sets,spreadK,skewMs,valuesAgree,clocksAgree,
   // Identity keys were pinned by an operator. Hardware provenance remains unverified.
   trustedPhysicalObservation:false,seal:null};
}
export function checkpoint(state,eventId){
 const gate=inspect(state,eventId),next=clone(state);
 const result={seq:next.sequence+1,type:"CHECKPOINT",eventId,status:gate.status,
  eligible:gate.eligible??false,credentialVerified:gate.signatureVerified??false,
  trustedPhysicalObservation:false,seal:null};
 next.sequence++;next.events.push(result);next.checkpoints.push(clone(result));next.seal=null;
 return {state:next,gate};
}
export function audit(state){
 check(state.events.length===state.sequence&&state.events.every((e,i)=>e.seq===i+1),"event gap");
 check(state.receipts.length===state.events.filter(e=>e.type==="SIGNED_RECEIPT").length,"receipt ledger mismatch");
 check(state.checkpoints.every(p=>p.trustedPhysicalObservation===false&&p.seal===null),"unearned physical trust");
 return {valid:true,registrations:Object.keys(state.registry).length,
 receipts:state.receipts.length,events:state.sequence,checks:state.checkpoints.length,
 physicalWitnessesAuthenticated:0,seal:state.seal};
}
export async function syntheticDemo({shared=false,disagree=false,skew=false,tamper=false}={}){
 let state=begin();const pairs=[];
 for(let i=0;i<3;i++){
  const pair=await generateSigner(),sensorId="S-"+i,rootId=shared?"ROOT-SHARED":"ROOT-"+i;
  state=register(state,{sensorId,rootId,publicJwk:await publicKeyJwk(pair),
   upstreamRoots:shared?["SHARED-DATA-PIPELINE"]:[]});pairs.push(pair);
 }
 for(let i=0;i<3;i++){
  const packet=await signPacket({eventId:"THERM-1",sensorId:"S-"+i,
   rootId:shared?"ROOT-SHARED":"ROOT-"+i,measurementId:"MEASURE-"+i,
   upstreamRoots:shared?["SHARED-DATA-PIPELINE"]:[],
   valueK:290+((disagree&&i===2)?1:0.005*i),
   timestampMs:(skew?97000+800*i:99000+100*i),nonce:"nonce-"+i},pairs[i].privateKey);
  if(tamper&&i===2)packet.valueK+=1;
  state=(await acquire(state,packet)).state;
 }
 return {state,...checkpoint(state,"THERM-1")};
}
