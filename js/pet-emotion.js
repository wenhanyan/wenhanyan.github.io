/* 桌宠 · 情绪状态机（读写 PetState，不单独持久化）。依赖：PetConfig（PetEmotionType 枚举）、PetState。 */
window.PetEmotion = (function(){
  if(!window.PetEmotionType){
    console.error('[PetEmotion] 依赖未加载：PetEmotionType');
  }
  if(!window.PetState){
    console.error('[PetEmotion] 依赖未加载：PetState');
  }

  const T = window.PetEmotionType;

  function get(){
    return window.PetState.getEmotion();
  }

  function set(emotion){
    if(!T[emotion]){
      console.error('[PetEmotion] 非法情绪：', emotion);
      return;
    }
    window.PetState.setEmotion(emotion);
  }

  // 用户点击：睡眠中 → 醒来恢复平静；否则随机 HAPPY/CURIOUS
  function onInteraction(){
    if(get() === T.SLEEPY){
      set(T.CALM);
    } else {
      set(Math.random() < 0.5 ? T.HAPPY : T.CURIOUS);
    }
  }

  // 长时间无互动 → SLEEPY（阶段3 行为调度器调用，本阶段预留）
  function onIdle(){
    set(T.SLEEPY);
  }

  // 睡眠后重新互动 → 随机 CALM/HAPPY（阶段3 行为调度器调用，本阶段预留）
  function onWake(){
    set(Math.random() < 0.5 ? T.CALM : T.HAPPY);
  }

  return { get, set, onInteraction, onIdle, onWake };
})();
