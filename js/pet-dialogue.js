/* Live2D 桌宠 · 台词（意图 + 情绪选词 → 气泡）。依赖：PetState、PetProfile、PetPersonality。 */
window.PetDialogue = (function(){
  if(!window.PetState){
    console.error('[PetDialogue] 依赖未加载：PetState');
  }
  if(!window.PetProfile){
    console.error('[PetDialogue] 依赖未加载：PetProfile');
  }
  if(!window.PetPersonality){
    console.error('[PetDialogue] 依赖未加载：PetPersonality');
  }

  const DURATION = 3000;   // 气泡显示时长（毫秒）
  let talkTimer = null;

  /* 意图 + 当前情绪选词：
     - 平铺数组（welcome）→ 直接随机
     - 情绪分层对象（click/idleTalk）→ 按 PetState.getEmotion() 取，缺省回退 CALM */
  function pickLine(intent){
    const group = window.PetPersonality.lines[intent];
    if(!group) return null;
    let pool;
    if(Array.isArray(group)){
      pool = group;
    } else {
      const emotion = window.PetState.getEmotion();
      pool = group[emotion] || group[window.PetEmotionType.CALM];
    }
    if(!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* 说话：台词 → 气泡（INTERACTION → TALKING），时长结束自动消失并回到 IDLE */
  function say(intent){
    const pet = window.PetState.getPet();
    if(!pet) return;
    const line = pickLine(intent);
    if(!line) return;
    window.PetState.setActivity(window.PetActivity.INTERACTION);
    pet.tipsMessage(line, DURATION);
    window.PetState.setActivity(window.PetActivity.TALKING);
    if(talkTimer) clearTimeout(talkTimer);
    talkTimer = setTimeout(function(){
      pet.clearTips();
      window.PetState.setActivity(window.PetActivity.IDLE);
      talkTimer = null;
    }, DURATION);
  }

  return { say };
})();
