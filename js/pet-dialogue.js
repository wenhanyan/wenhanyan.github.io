/* Live2D 桌宠 · 互动台词（独立配置 + 随机气泡）。依赖：PetState。 */
window.PetDialogue = (function(){
  if(!window.PetState){
    console.error('[PetDialogue] 依赖未加载：PetState');
  }

  /* 互动台词配置（独立配置，不硬编码在主逻辑里） */
  const config = {
    lines: [                     // 点击时随机取一条
      '你好呀，我是 Delta 的桌宠～',
      '今天也要元气满满哦！',
      '要不要去看看阅读书单呀？',
      '我在右下角，按住可以拖动我～',
      '有什么想聊的吗？',
      '加油加油，你最棒！'
    ],
    motion: 'tap',               // 预留扩展字段：未来库支持按名播放动作时使用；当前点击走模型自带 tap 动作
    duration: 3000               // 气泡显示时长（毫秒）
  };

  let talkTimer = null;

  /* 点击互动：随机台词 → 气泡（TALKING），时长结束自动消失并回到 IDLE；tap 动作由库自动播放 */
  function sayRandom(){
    const pet = window.PetState.getPet();
    if(!pet) return;
    const line = config.lines[Math.floor(Math.random() * config.lines.length)];
    window.PetState.setActivity(window.PetActivity.INTERACTION);
    pet.tipsMessage(line, config.duration);
    window.PetState.setActivity(window.PetActivity.TALKING);
    if(talkTimer) clearTimeout(talkTimer);
    talkTimer = setTimeout(function(){
      pet.clearTips();
      window.PetState.setActivity(window.PetActivity.IDLE);
      talkTimer = null;
    }, config.duration);
  }

  return { config, sayRandom };
})();
