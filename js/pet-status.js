/* 桌宠 · 状态徽章（关系等级 + 情绪，可视化观察小D的生命状态；点击可手动切换情绪）。
   依赖：PetMemory（等级）、PetEmotion / PetEmotionType（情绪）。
   徽章挂在 #oml2d-stage 内，随桌宠一起拖动；只桥接状态到 UI，视觉由 pet-menu.css 实现。 */
window.PetStatus = (function(){
  if(!window.PetMemory){
    console.error('[PetStatus] 依赖未加载：PetMemory');
  }
  if(!window.PetEmotion){
    console.error('[PetStatus] 依赖未加载：PetEmotion');
  }
  if(!window.PetEmotionType){
    console.error('[PetStatus] 依赖未加载：PetEmotionType');
  }

  const LEVEL_LABEL = { stranger: '陌生人', familiar: '熟悉', friend: '老朋友' };   // 关系等级 → 中文
  const EMOTION_LABEL = { CALM: '平静', HAPPY: '开心', CURIOUS: '好奇', SLEEPY: '困' }; // 情绪 → 中文
  const EMOTION_ORDER = ['CALM', 'HAPPY', 'CURIOUS', 'SLEEPY'];   // 手动切换顺序
  const EMOTIONS = Object.keys(window.PetEmotionType);            // 情绪枚举值（切换颜色 class 用）

  let el = null;
  let levelValue = null;
  let emotionValue = null;
  let initialized = false;

  function getLevel(){
    // 守卫：旧缓存 pet-memory.js 可能缺 getRelationshipLevel（Step4 才加入），缺省回退 stranger
    return (typeof window.PetMemory.getRelationshipLevel === 'function')
      ? window.PetMemory.getRelationshipLevel() : 'stranger';
  }

  function render(){
    if(!el) return;
    const level = LEVEL_LABEL[getLevel()] || getLevel();
    const emotion = window.PetEmotion.get();
    if(levelValue) levelValue.textContent = level;
    if(emotionValue) emotionValue.textContent = EMOTION_LABEL[emotion] || emotion;
    // 情绪色点：切换 class，颜色由 CSS 决定（happy 红 / curious 琥珀 / sleepy 灰 / calm 蓝）
    EMOTIONS.forEach(function(k){ el.classList.remove('pet-status-emotion-' + k.toLowerCase()); });
    el.classList.add('pet-status-emotion-' + String(emotion).toLowerCase());
  }

  // 手动调节：按 CALM → HAPPY → CURIOUS → SLEEPY 循环切换
  function cycleEmotion(){
    const current = window.PetEmotion.get();
    let idx = EMOTION_ORDER.indexOf(current);
    if(idx < 0) idx = 0;
    window.PetEmotion.set(EMOTION_ORDER[(idx + 1) % EMOTION_ORDER.length]);
  }

  // 把徽章挂到 #oml2d-stage（随桌宠拖动）；stage 由 oh-my-live2d 创建，未就绪则返回 false
  function attachToStage(){
    if(!el) return false;
    const stage = document.getElementById('oml2d-stage');
    if(!stage) return false;
    stage.appendChild(el);
    return true;
  }

  function init(){
    if(initialized) return;
    initialized = true;

    el = document.createElement('div');
    el.id = 'pet-status';
    el.title = '点击切换心情';

    // 等级行：等级 + 值
    const levelRow = document.createElement('div');
    levelRow.className = 'pet-status-row';
    const levelLabel = document.createElement('span');
    levelLabel.className = 'pet-status-label';
    levelLabel.textContent = '等级';
    levelValue = document.createElement('span');
    levelRow.appendChild(levelLabel);
    levelRow.appendChild(levelValue);
    el.appendChild(levelRow);

    // 情绪行：情绪 + 色点 + 值
    const emoRow = document.createElement('div');
    emoRow.className = 'pet-status-row';
    const emoLabel = document.createElement('span');
    emoLabel.className = 'pet-status-label';
    emoLabel.textContent = '情绪';
    const dot = document.createElement('i');   // 色点：颜色由 emotion class 控制
    dot.className = 'dot';
    emotionValue = document.createElement('span');
    emoRow.appendChild(emoLabel);
    emoRow.appendChild(dot);
    emoRow.appendChild(emotionValue);
    el.appendChild(emoRow);

    el.addEventListener('click', function(e){
      e.stopPropagation();   // 徽章点击只切换心情，不冒泡触发桌宠其它逻辑
      cycleEmotion();
    });

    render();
    window.PetEmotion.onChange(render);   // 情绪变化实时刷新

    // 挂到 stage；若 Live2D 尚未建好 stage（异步），用 MutationObserver 等待其出现
    if(!attachToStage()){
      const obs = new MutationObserver(function(){
        if(attachToStage()){ obs.disconnect(); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
