/**
 * NCI-027: sensor evidence acquisition, ancestry, replay and checkpoint gate.
 * No network or hardware inputs. Packet origin/clock/roots are unverified
 * declarations unless future authenticated adapters prove them.
 * Structural independence != authenticated independent witnesses.
 */
const copy=x=>JSON.parse(JSON.stringify(x));
const requireRule=(condition,message)=>{if(!condition)throw Error(message)};
const validName=x=>typeof x==="string"&&x.trim().length>0;
const finite=x=>typeof x==="number"&&Number.isFinite(x);
export function begin({toleranceK=0.05,maxSkewMs=1000,origin="NCI-027-SYNTHETIC"}={}){
 requireRule(finite(toleranceK)&&toleranceK>=0&&finite(maxSkewMs)&&maxSkewMs>=0,"invalid tolerances");
 requireRule(validName(origin),"invalid event origin");
 return {origin,toleranceK,maxSkewMs,packets:[],events:[],generation:0,checkpoints:[],seal:null};
}
export function makePacket({eventId="thermal-transition-1",sensorId,rootId,
 upstreamRoots=[],valueK,timestampMs,nonce,origin="DECLARED",authentication="NONE"}){
 requireRule([eventId,sensorId,rootId,nonce,origin].every(validName),"missing identity");
 requireRule(finite(valueK)&&valueK>0&&Number.isSafeInteger(timestampMs),"invalid measurement or timestamp");
 requireRule(Array.isArray(upstreamRoots)&&upstreamRoots.every(validName),"invalid upstream roots");
 requireRule(validName(authentication),"invalid authentication");
 return {eventId,sensorId,rootId,upstreamRoots:[...new Set(upstreamRoots)],
  valueK,timestampMs,nonce,origin,authentication};
}
export function acquire(state,packet){
 const next=copy(state);
 const duplicate=state.packets.some(p=>p.sensorId===packet.sensorId&&p.nonce===packet.nonce);
 const duplicateSensorEvent=state.packets.some(p=>p.sensorId===packet.sensorId&&p.eventId===packet.eventId);
 let accepted=true,reason="ACCEPTED";
 try{makePacket(packet)}catch(e){accepted=false;reason="INVALID_PACKET: "+e.message}
 if(accepted&&duplicate){accepted=false;reason="REPLAY"}
 if(accepted&&duplicateSensorEvent){accepted=false;reason="DUPLICATE_SENSOR_EVENT"}
 if(accepted)next.packets.push(copy(packet));
 next.generation++;
 next.events.push({seq:next.generation,type:accepted?"ACQUIRE":"REJECT",
  sensorId:String(packet?.sensorId??""),eventId:String(packet?.eventId??""),nonce:String(packet?.nonce??""),
  reason,packetIndex:accepted?next.packets.length-1:null});
 return {state:next,accepted,reason};
}
function ancestryRoots(p){return [...new Set([p.rootId,...p.upstreamRoots])];}
function connected(a,b){
 const x=new Set(ancestryRoots(a));
 return ancestryRoots(b).some(z=>x.has(z));
}
export function inspect(state,eventId){
 requireRule(validName(eventId),"event ID required");
 const packets=state.packets.filter(p=>p.eventId===eventId);
 if(packets.length!==3)return {status:"COUNT_MISMATCH",eventId,count:packets.length,
   structurallyIndependent:false,authenticated:false,trusted:false,seal:null};
 const distinctSensors=new Set(packets.map(x=>x.sensorId)).size===3;
 const values=packets.map(x=>x.valueK),stamps=packets.map(x=>x.timestampMs);
 const spreadK=Math.max(...values)-Math.min(...values);
 const skewMs=Math.max(...stamps)-Math.min(...stamps);
 const adjacency=packets.map((p,i)=>packets.map((q,j)=>i!==j&&connected(p,q)));
 const hasSharedRoots=adjacency.some(row=>row.some(Boolean));
 const structurallyIndependent=distinctSensors&&!hasSharedRoots;
 const valuesAgree=spreadK<=state.toleranceK,timeAgree=skewMs<=state.maxSkewMs;
 const authenticated=false; // No trusted keys, attestation, or clock validation in this version.
 const eligible=structurallyIndependent&&valuesAgree&&timeAgree;
 const status=!distinctSensors?"DUPLICATE_SENSORS":hasSharedRoots?"SHARED_ANCESTRY":
  !timeAgree?"TIME_SKEW":!valuesAgree?"VALUE_DISAGREEMENT":"STRUCTURALLY_ELIGIBLE";
 return {status,eventId,count:3,distinctSensors,hasSharedRoots,
  rootSets:packets.map(ancestryRoots),adjacency,spreadK,skewMs,valuesAgree,timeAgree,
  structurallyIndependent,eligible,authenticated,trusted:false,seal:null,
  // A verified physical instrument, signed packet and trusted clock are future work.
  witnesses:packets.map(p=>({sensorId:p.sensorId,rootId:p.rootId,
    upstreamRoots:[...p.upstreamRoots],authentication:p.authentication}))};
}
export function checkpoint(state,eventId){
 const decision=inspect(state,eventId),next=copy(state);
 next.generation++;
 const entry={seq:next.generation,type:"CHECKPOINT",eventId,
  status:decision.status,structurallyIndependent:decision.structurallyIndependent,
  trusted:false,seal:null,reason:"NO_AUTHENTICATED_EXTERNAL_ROOTS"};
 next.events.push(entry);next.checkpoints.push(copy(entry));next.seal=null;
 return {state:next,decision};
}
export function audit(state){
 requireRule(state.events.length===state.generation&&state.events.every((e,i)=>e.seq===i+1),"event sequence broken");
 requireRule(state.checkpoints.every(e=>e.type==="CHECKPOINT"&&e.trusted===false&&e.seal===null),"unearned checkpoint seal");
 const accepted=state.events.filter(e=>e.type==="ACQUIRE").length;
 requireRule(accepted===state.packets.length,"packet receipt mismatch");
 const seen=new Set();
 for(const p of state.packets){
  const id=p.sensorId+"\u0000"+p.nonce;
  requireRule(!seen.has(id),"replayed evidence");seen.add(id);
 }
 return {valid:true,receipts:state.packets.length,events:state.generation,
  checks:state.checkpoints.length,authenticatedExternalRoots:0,trusted:false};
}
export function demoPackets({shared=false,skew=false,disagree=false}={}){
 return ["A","B","C"].map((id,i)=>makePacket({
  eventId:"therm-001",sensorId:"SENSOR-"+id,rootId:shared?"ROOT-MIRROR":"ROOT-"+id,
  upstreamRoots:shared?["UPSTREAM-COMMON"]:[],nonce:"event-001-"+id,
  valueK:290+((disagree&&i===2)?1:i*0.005),timestampMs:100000+i*(skew?1200:100),
  origin:"SYNTHETIC-FIXTURE",authentication:"NONE"}));
}
export function demonstration(options={}){
 let s=begin();
 for(const packet of demoPackets(options))s=acquire(s,packet).state;
 const result=checkpoint(s,"therm-001");return {...result,report:audit(result.state)};
}
