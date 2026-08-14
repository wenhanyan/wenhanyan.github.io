/* Live2D 桌宠 · 共享状态中枢（pet 实例 + 交互活动 + 情绪）。依赖：PetConfig 的枚举。 */
window.PetState = (function(){
  if(!window.PetActivity || !window.PetEmotionType){
    console.error('[PetState] 依赖未加载：PetActivity / PetEmotionType');
  }

  let pet = null;                          // oh-my-live2d 实例（loadOml2d 返回值）
  let activity = window.PetActivity.IDLE;  // 交互活动：IDLE / TALKING / INTERACTION / DRAGGING
  let emotion = window.PetEmotionType.CALM; // 情绪：CALM / HAPPY / CURIOUS / SLEEPY
  let lastActivity = Date.now();           // 最近一次用户互动时间戳（阶段3行为用）

  return {
    getPet(){ return pet; },
    setPet(p){ pet = p; },
    getActivity(){ return activity; },
    setActivity(a){ activity = a; },
    getEmotion(){ return emotion; },
    setEmotion(e){ emotion = e; },
    touch(){ lastActivity = Date.now(); },
    getLastActivity(){ return lastActivity; }
  };
})();
