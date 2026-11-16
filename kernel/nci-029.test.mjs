import assert from "node:assert/strict";
import {begin,generateSigner,publicKeyJwk,signPacket} from "./nci-028-kernel.mjs";
import {begin as beginChain,pinIssuer,signCertificate,provision,acquire,inspect,checkpoint,audit,demo} from "./nci-029-kernel.mjs";
const d=await demo();
assert.equal(d.gate.status,"CHAIN_VERIFIED");
assert.equal(d.gate.eligible,true);
assert.equal(d.gate.physicalHardwareAttested,false);
assert.equal(d.gate.trusted,false);
assert.equal(d.audit.issuerCount,3);
assert.equal(d.audit.deviceCount,3);
assert.equal(d.audit.receiptCount,3);
assert.equal(d.state.checks[0].seal,null);
assert.equal((await demo({sharedDomain:true})).gate.status,"SHARED_ISSUER_DOMAIN");
assert.equal((await demo({tamperCertificate:true})).gate.status,"COUNT_MISMATCH");
assert.equal((await demo({expired:true})).gate.status,"COUNT_MISMATCH");
assert.equal((await demo({disagree:true})).gate.status,"READING_DISAGREEMENT");
const issuer=await generateSigner(),dev=await generateSigner();
let s=beginChain();s=pinIssuer(s,{issuerId:"CA",trustDomain:"DOM",publicJwk:await publicKeyJwk(issuer)});
const cert=await signCertificate({issuerId:"CA",sensorId:"SENSOR",rootId:"ROOT",
 devicePublicJwk:await publicKeyJwk(dev),upstreamRoots:[],calibrationId:"CAL",
 minK:280,maxK:320,uncertaintyK:.01,validFromMs:90000,validUntilMs:110000,
 instrumentClass:"SIMULATED"},issuer.privateKey);
const registered=await provision(s,cert);
assert.equal(registered.accepted,true);s=registered.state;
assert.equal((await provision(s,cert)).accepted,false);
const packet=await signPacket({eventId:"E",sensorId:"SENSOR",rootId:"ROOT",
 measurementId:"M",upstreamRoots:[],valueK:290,timestampMs:99000,nonce:"N"},dev.privateKey);
const first=await acquire(s,packet);
assert.equal(first.accepted,true);
assert.equal((await acquire(first.state,packet)).accepted,false);
assert.equal((await acquire(s,{...packet,valueK:400})).accepted,false);
assert.equal(audit(first.state).receiptCount,1);
const fake=JSON.parse(JSON.stringify(d.state));fake.checks[0].trusted=true;
assert.throws(()=>audit(fake),/false physical trust/);
console.log("NCI-029 PASS: issuer signatures, certificate calibration, domains, tamper, replay and trust veto");
