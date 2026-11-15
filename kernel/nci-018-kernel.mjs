import {genesis, choices, select, act, inverse, evidence, microscopicSignature, validateWorld} from "./nci-017-kernel.mjs";
import {protonLedger} from "./nci-015-kernel.mjs";

const copy=x=>JSON.parse(JSON.stringify(x));
function requireRule(condition, message){if(!condition)throw Error(message)}
const key=path=>path.join(">");
/**
 * NCI-018: bounded, deterministic closed-loop policy calibration.
 * The test objective is explicit and synthetic: the chosen path must
 * match a fixed target cycle. A trial must return to the identical
 * microscopic configuration before feedback is credited.
 */
export function objectiveFor(world){
 const entries=choices(world);
 requireRule(entries.length>=2,"need at least two candidate cycles");
 return {type:"EXACT_PATH",target:entries[entries.length-1].key,version:"NCI-018-TOY-1"};
}
export function score(action,objective){
 requireRule(objective?.type==="EXACT_PATH"&&typeof objective.target==="string","unknown objective");
 return action===objective.target?1:-1;
}
export function trial(world,objective){
 validateWorld(world);
 const before=microscopicSignature(world.physical),selected=select(world);
 if(!selected)return {world:copy(world),attempted:false,reason:"NO_CANDIDATE"};
 const result=act(world);
 requireRule(result.accepted,"candidate was not physically legal");
 const recovered=inverse(result.world,selected.path);
 const after=microscopicSignature(recovered.physical);
 requireRule(after===before,"trial did not restore microscopic orientation");
 const gain=score(selected.key,objective);
 const calibrated=evidence(recovered,selected.path,gain>0?"success":"failure",
   "synthetic exact-path task score="+gain);
 requireRule(microscopicSignature(calibrated.physical)===before,"feedback changed physics");
 const next=copy(calibrated);next.policy.sequence++;
 next.policy.events.push({seq:next.policy.sequence,type:"GENERATION_EVALUATION",
  at:before,action:selected.key,objective:objective.version,score:gain,restored:true,
  observedOutcome:"synthetic",physicalUnchanged:true});
 validateWorld(next);
 return {world:next,attempted:true,action:selected.key,score:gain,restored:true,
   generation:next.policy.events.filter(e=>e.type==="GENERATION_EVALUATION").length};
}
export function train(world,objective,maxGenerations=3){
 requireRule(Number.isSafeInteger(maxGenerations)&&maxGenerations>=0&&maxGenerations<=10000,"invalid generation budget");
 let current=copy(world),log=[],reason="BUDGET";
 const initial=select(current)?.key??null;
 for(let i=0;i<maxGenerations;i++){
  const step=trial(current,objective);
  if(!step.attempted){reason=step.reason;break}
  current=step.world;log.push({generation:i+1,action:step.action,score:step.score,
    restored:step.restored,next:select(current)?.key??null});
  if(step.score>0){reason="TARGET_REACHED";break}
 }
 return {world:current,initial,final:select(current)?.key??null,history:log,
   bestObserved:log.length?Math.max(...log.map(x=>x.score)):null,stop:reason,
   improved:log.length>=2&&log.some((x,i)=>i>0&&x.score>log[0].score)};
}
export function audit(world){
 validateWorld(world);
 const reports=world.policy.events.filter(e=>e.type==="GENERATION_EVALUATION");
 const result={generationCount:reports.length,physicalMatchesGenesis:microscopicSignature(world.physical)===world.origin,
  iceRuleValid:protonLedger(world.physical).iceRule.valid,
  everyTrialRestored:reports.every(e=>e.restored&&e.physicalUnchanged),
  successes:reports.filter(e=>e.score===1).length,failures:reports.filter(e=>e.score===-1).length};
 requireRule(result.iceRuleValid&&result.everyTrialRestored&&result.physicalMatchesGenesis,
  "training physics invariant broken");
 return result;
}
export function demonstration(){
 const first=genesis(),objective=objectiveFor(first);
 return {objective,run:train(first,objective,4)};
}
