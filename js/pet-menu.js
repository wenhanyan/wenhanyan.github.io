/* 桌宠 · 交互面板 UI 层（情绪 → #oml2d-stage 类名，视觉由 pet-menu.css 实现）。
   依赖：PetEmotion、PetEmotionType。只桥接状态到 UI，不写视觉细节。 */
window.PetMenu = (function(){
  if(!window.PetEmotion){
    console.error('[PetMenu] 依赖未加载：PetEmotion');
  }
  if(!window.PetEmotionType){
    console.error('[PetMenu] 依赖未加载：PetEmotionType');
  }

  const KEYS = Object.keys(window.PetEmotionType);  // 情绪枚举值（不硬编码）
  let initialized = false;

  function applyEmotionClass(emotion){
    const stage = document.getElementById('oml2d-stage');
    if(!stage) return;
    KEYS.forEach(function(k){ stage.classList.remove('pet-emotion-' + k.toLowerCase()); });
    stage.classList.add('pet-emotion-' + String(emotion).toLowerCase());
  }

  function init(){
    if(initialized) return;                         // 只初始化一次
    initialized = true;
    if(!window.PetEmotion) return;
    applyEmotionClass(window.PetEmotion.get());     // 初始情绪
    window.PetEmotion.onChange(applyEmotionClass);  // 情绪变化时同步
  }

  return { init };
})();
