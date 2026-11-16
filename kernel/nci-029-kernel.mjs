/**
 * NCI-029: issuer-verified provisioning and calibration chain for NCI-028.
 * An ECDSA signature authenticates a declarative credential, not hardware.
 * No physical witness can be certified by this software-only demo.
 */
import {begin as beginReceipts,register as registerSensor,acquire as acquireReceipt,
 inspect as inspectReceipts,audit as auditReceipts,generateSigner,publicKeyJwk,
 signPacket} from "./nci-028-kernel.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const enc=x=>new TextEncoder().encode(x);
const ok=(x,m)=>{if(!x)throw Error(m)};
const id=x=>typeof x==="string"&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const subtle=()=>{ok(globalThis.crypto?.subtle,"WebCrypto unavailable");return globalThis.crypto.subtle};
const toHex=buf=>Array.from(new Uint8Array(buf)).map(n=>n.toString(16).padStart(2,"0")).join("");
const fromHex=s=>Uint8Array.from(s.match(/../g)||[],n=>parseInt(n,16));
function publicKeyValid(jwk){return jwk?.kty==="EC"&&jwk.crv==="P-256"&&
 typeof jwk.x==="string"&&typeof jwk.y==="string"}
export function certificateFields(c){
 return {schema:"NCI-029-CERT-V1",issuerId:c.issuerId,sensorId:c.sensorId,
 rootId:c.rootId,devicePublicJwk:c.devicePublicJwk,
 upstreamRoots:c.upstreamRoots,calibrationId:c.calibrationId,
 minK:c.minK,maxK:c.maxK,uncertaintyK:c.uncertaintyK,
 validFromMs:c.validFromMs,validUntilMs:c.validUntilMs,
 instrumentClass:c.instrumentClass,hardwareAttestation:c.hardwareAttestation};
}
export function canonicalCertificate(c){return JSON.stringify(certificateFields(c))}
function validateCertificate(c){
 ok(c&&["issuerId","sensorId","rootId","calibrationId","instrumentClass"].every(k=>id(c[k])),"invalid certificate IDs");
 ok(publicKeyValid(c.devicePublicJwk),"invalid device public key");
 ok(Array.isArray(c.upstreamRoots)&&c.upstreamRoots.every(id)&&
 new Set(c.upstreamRoots).size===c.upstreamRoots.length,"invalid upstream ancestry");
 ok([c.minK,c.maxK,c.uncertaintyK].every(finite)&&c.minK>0&&c.maxK>c.minK&&
 c.uncertaintyK>=0,"invalid calibration range");
 ok(Number.isSafeInteger(c.validFromMs)&&Number.isSafeInteger(c.validUntilMs)&&
 c.validFromMs>=0&&c.validUntilMs>c.validFromMs,"invalid certificate validity");
 ok(c.hardwareAttestation==="UNVERIFIED","unsupported hardware attestation claim");
 ok(typeof c.signatureHex==="string"&&/^[0-9a-f]+$/.test(c.signatureHex)&&c.signatureHex.length%2===0,"invalid certificate signature");
}
export async function signCertificate(fields,issuerPrivateKey){
 const c={...clone(fields),schema:"NCI-029-CERT-V1",hardwareAttestation:"UNVERIFIED",signatureHex:"00"};
 validateCertificate(c);
 const signature=await subtle().sign({name:"ECDSA",hash:"SHA-256"},issuerPrivateKey,enc(canonicalCertificate(c)));
 return {...c,signatureHex:toHex(signature)};
}
export function begin({nowMs=100000,toleranceK=.05,maxSkewMs=1000,maxAgeMs=5000}={}){
 return {receipts:beginReceipts({nowMs,toleranceK,maxSkewMs,maxAgeMs}),
  issuers:{},certificates:{},events:[],sequence:0,checks:[],seal:null};
}
function append(s,type,details){
 s.sequence++;s.events.push({seq:s.sequence,type,...clone(details)});return s;
}
export function pinIssuer(s,{issuerId,publicJwk,trustDomain}){
 ok(id(issuerId)&&id(trustDomain)&&publicKeyValid(publicJwk),"invalid issuer trust anchor");
 ok(!Object.hasOwn(s.issuers,issuerId),"issuer already pinned");
 const next=clone(s);
 next.issuers[issuerId]={issuerId,trustDomain,publicJwk:clone(publicJwk),
  rootOfTrust:"EXPLICIT_OPERATOR_PIN",hardwareValidated:false};
 return append(next,"PIN_ISSUER",{issuerId,trustDomain});
}
export async function provision(s,certificate){
 let next=clone(s),accepted=false,reason="ACCEPTED";
 try{
  validateCertificate(certificate);
  const issuer=s.issuers[certificate.issuerId];
  ok(issuer,"unknown issuing authority");
  ok(!Object.hasOwn(s.certificates,certificate.sensorId),"device already provisioned");
  ok(certificate.validFromMs<=s.receipts.nowMs&&
   s.receipts.nowMs<=certificate.validUntilMs,"expired or premature calibration");
  const pub=await subtle().importKey("jwk",issuer.publicJwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
  ok(await subtle().verify({name:"ECDSA",hash:"SHA-256"},pub,
    fromHex(certificate.signatureHex),enc(canonicalCertificate(certificate))),"invalid issuer signature");
  next.receipts=registerSensor(next.receipts,{sensorId:certificate.sensorId,rootId:certificate.rootId,
   publicJwk:certificate.devicePublicJwk,upstreamRoots:certificate.upstreamRoots,
   credentialIssuer:certificate.issuerId});
  next.certificates[certificate.sensorId]=clone(certificate);accepted=true;
 }catch(e){reason=String(e.message||e)}
 append(next,accepted?"PROVISION":"REJECT",{sensorId:String(certificate?.sensorId??""),reason,accepted});
 return {state:next,accepted,reason};
}
export async function acquire(s,packet){
 const next=clone(s),cert=s.certificates[packet?.sensorId];
 let result;
 if(!cert || packet?.valueK<cert.minK || packet?.valueK>cert.maxK ||
    packet?.timestampMs<cert.validFromMs || packet?.timestampMs>cert.validUntilMs){
  result={state:next.receipts,accepted:false,reason:"UNPROVISIONED_OR_OUTSIDE_CALIBRATION"};
 }else{
  result=await acquireReceipt(next.receipts,packet);
  next.receipts=result.state;
 }
 append(next,result.accepted?"CALIBRATED_RECEIPT":"REJECT",
  {sensorId:String(packet?.sensorId??""),reason:result.reason,accepted:result.accepted});
 return {...result,state:next};
}
export function inspect(s,eventId){
 const base=inspectReceipts(s.receipts,eventId);
 if(base.count!==3)return {...base,calibrationVerified:false,
  issuerDomains:[],separateIssuerDomains:false,eligible:false,trusted:false};
 const readings=s.receipts.receipts.filter(p=>p.eventId===eventId);
 const certs=readings.map(p=>s.certificates[p.sensorId]);
 const issuers=certs.map(c=>s.issuers[c.issuerId]);
 const domains=issuers.map(i=>i.trustDomain);
 const separateIssuerDomains=new Set(domains).size===3;
 const certificateRoots=certs.map(c=>[c.rootId,...c.upstreamRoots]);
 const sharedMeasurement=readings.some((p,i)=>readings.some((q,j)=>i<j&&p.measurementId===q.measurementId));
 const calibrationVerified=certs.every((c,i)=>readings[i].valueK>=c.minK&&
  readings[i].valueK<=c.maxK&&readings[i].timestampMs>=c.validFromMs&&
  readings[i].timestampMs<=c.validUntilMs);
 const eligible=base.eligible&&separateIssuerDomains&&!sharedMeasurement&&calibrationVerified;
 return {...base,calibrationVerified,issuerDomains:domains,
  separateIssuerDomains,sharedMeasurement,certificateRoots,eligible,
  status:!base.eligible?base.status:!separateIssuerDomains?"SHARED_ISSUER_DOMAIN":
    sharedMeasurement?"SHARED_MEASUREMENT":"CHAIN_VERIFIED",
  // Signed issuer attestations cannot prove the existence/independence of hardware.
  physicalHardwareAttested:false,trusted:false,seal:null};
}
export function checkpoint(s,eventId){
 const gate=inspect(s,eventId),next=clone(s);
 const record={eventId,status:gate.status,eligible:gate.eligible,
    physicalHardwareAttested:false,trusted:false,seal:null};
 next.checks.push({...record,seq:next.sequence+1});
 append(next,"CHECKPOINT",record);next.seal=null;
 return {state:next,gate};
}
export function audit(s){
 auditReceipts(s.receipts);
 ok(s.sequence===s.events.length&&s.events.every((e,i)=>e.seq===i+1),"chain gap");
 ok(s.checks.every(c=>c.trusted===false&&c.seal===null),"false physical trust");
 ok(s.events.filter(e=>e.type==="PROVISION").length===Object.keys(s.certificates).length,"provision mismatch");
 return {valid:true,issuerCount:Object.keys(s.issuers).length,
  deviceCount:Object.keys(s.certificates).length,receiptCount:s.receipts.receipts.length,
  events:s.events.length,checkpoints:s.checks.length,physicalTrust:false,seal:null};
}
/** Ephemeral software signers; independent names are only simulated domains. */
export async function demo({sharedDomain=false,tamperCertificate=false,expired=false,disagree=false}={}){
 let s=begin();const devices=[];
 for(let i=0;i<3;i++){
  const issuer=await generateSigner(),device=await generateSigner();
  const issuerId="ISSUER-"+i,sensorId="S-"+i;
  s=pinIssuer(s,{issuerId,trustDomain:sharedDomain?"DOMAIN-SHARED":"DOMAIN-"+i,
   publicJwk:await publicKeyJwk(issuer)});
  const cert=await signCertificate({issuerId,sensorId,rootId:"ROOT-"+i,
   devicePublicJwk:await publicKeyJwk(device),upstreamRoots:[],
   calibrationId:"CAL-"+i,minK:280,maxK:320,uncertaintyK:.01,
   validFromMs:expired&&i===2?1:90000,validUntilMs:expired&&i===2?90001:110000,
   instrumentClass:"SYNTHETIC-THERMOMETER"},issuer.privateKey);
  if(tamperCertificate&&i===2)cert.uncertaintyK=.005;
  const result=await provision(s,cert);s=result.state;
  devices.push({device,result});
 }
 for(let i=0;i<3;i++){
  const {device,result}=devices[i];
  if(!result.accepted)continue;
  const p=await signPacket({eventId:"THERM-029",sensorId:"S-"+i,
    rootId:"ROOT-"+i,measurementId:"MEAS-"+i,upstreamRoots:[],
    valueK:disagree&&i===2?300:290+i*.005,
    timestampMs:99000+i*100,nonce:"NONCE-"+i},device.privateKey);
  s=(await acquire(s,p)).state;
 }
 const done=checkpoint(s,"THERM-029");
 return {...done,audit:audit(done.state)};
}
