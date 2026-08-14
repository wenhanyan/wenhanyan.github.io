/* 桌宠 · 情绪状态机（读写 PetState，不单独持久化）。依赖：PetConfig（PetEmotionType 枚举）、PetState。 */
window.PetEmotion = (function(){
  if(!window.PetEmotionType){
    console.error('[PetEmotion] 依赖未加载：PetEmotionType');
  }
  if(!window.PetState){
    console.error('[PetEmotion] 依赖未加载：PetState');
  }

  const T = window.PetEmotionType;
  const listeners = [];   // 情绪变化订阅（通用事件钩子，供 UI 层监听，非 UI 逻辑）

  function get(){
    return window.PetState.getEmotion();
  }

  function set(emotion){
    if(!T[emotion]){
      console.error('[PetEmotion] 非法情绪：', emotion);
      return;
    }
    const prev = window.PetState.getEmotion();
    if(prev === emotion) return;
    window.PetState.setEmotion(emotion);
    listeners.forEach(function(fn){ try{ fn(emotion); }catch(e){} });
  }

  // 订阅情绪变化，返回解绑函数（方便 UI 层清理）
  function onChange(fn){
    if(typeof fn !== 'function') return function(){};
    listeners.push(fn);
    return function(){ const i = listeners.indexOf(fn); if(i >= 0) listeners.splice(i, 1); };
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

  return { get, set, onChange, onInteraction, onIdle, onWake };
})();
