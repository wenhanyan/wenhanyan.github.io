/* 桌宠 · 行为调度器（生命周期 + 空闲检测 + 主动行为 + 回来检测）。
   依赖：PetConfig、PetState、PetEmotion、PetDialogue、PetMemory。
   原则：行为必须有原因（时长阈值驱动），禁止随机说话/高频打扰。 */
window.PetBehavior = (function(){
  if(!window.PetConfig){
    console.error('[PetBehavior] 依赖未加载：PetConfig');
  }
  if(!window.PetState){
    console.error('[PetBehavior] 依赖未加载：PetState');
  }
  if(!window.PetEmotion){
    console.error('[PetBehavior] 依赖未加载：PetEmotion');
  }
  if(!window.PetDialogue){
    console.error('[PetBehavior] 依赖未加载：PetDialogue');
  }
  if(!window.PetMemory){
    console.error('[PetBehavior] 依赖未加载：PetMemory');
  }
  if(!window.PetPersonality){
    console.error('[PetBehavior] 依赖未加载：PetPersonality');
  }
  if(!window.PetContext){
    console.error('[PetBehavior] 依赖未加载：PetContext');
  }

  const CFG = window.PetConfig.behavior;   // 时间参数集中于此，禁止硬编码
  const EMOTION = window.PetEmotionType;

  let heartbeat = null;    // 空闲心跳定时器
  let restTimer = null;    // 休息后提醒主人的延时器
  let hiddenAt = null;     // 页面隐藏时刻（计算离开时长）
  let initialized = false;
  let slept = false;       // 本次空闲段是否已触发困倦（互动后重置）
  let rested = false;      // 本次空闲段是否已触发休息（互动后重置）
  let context = null;      // 未来：用户浏览区域（home/project/about/ai），setContext 预留
  let contextTimer = null; // 环境感知：进入区域后延时说话
  let lastContextAt = 0;   // 上次环境话时间戳（冷却用）
  let contextOff = null;   // PetContext.onChange 解绑函数

  function idleMs(){
    return Date.now() - window.PetState.getLastActivity();
  }

  // 空闲心跳：按"无互动时长"确定性推进；每个阈值只触发一次
  function tick(){
    const idle = idleMs();

    if(idle < CFG.sleepyAfterMs){
      // 用户近期有互动：重置一次性标志；若仍困倦则醒来
      slept = false;
      rested = false;
      if(restTimer){ clearTimeout(restTimer); restTimer = null; }
      if(window.PetEmotion.get() === EMOTION.SLEEPY){
        window.PetEmotion.onWake();
      }
      return;
    }

    if(idle >= CFG.restAfterMs){
      if(!rested){
        rested = true;
        slept = true;
        window.PetEmotion.onIdle();              // 保持困倦
        window.PetDialogue.say('sleep');         // 进入休息
        restTimer = setTimeout(function(){       // 错开上一条气泡后提醒主人
          window.PetDialogue.say('restReminder');
          restTimer = null;
        }, CFG.restReminderDelayMs);
      }
    } else if(idle >= CFG.sleepyAfterMs){
      if(!slept){
        slept = true;
        window.PetEmotion.onIdle();              // CALM → SLEEPY
        window.PetDialogue.say('idle');          // 发呆/打哈欠
      }
    }
  }

  // 页面进入：按关系等级决定欢迎语（stranger/familiar/friend）+ 长时间离开 longBack
  function welcomeBack(){
    const level = window.PetMemory.getRelationshipLevel();   // stranger / familiar / friend
    const gap = window.PetMemory.getLastGap();
    if(level !== 'stranger' && gap != null && gap >= CFG.longBackMs){
      window.PetDialogue.say('welcome', 'longBack');        // 老朋友久别重逢
    } else {
      window.PetDialogue.say('welcome', level);             // 按关系等级欢迎
    }
  }

  // 环境感知：进入有台词的区域（project/ai）后，停留片刻再说话；有冷却，不打扰
  function onSectionChange(section){
    if(contextTimer){ clearTimeout(contextTimer); contextTimer = null; }
    if(!section) return;                                            // 离开已知区域：取消
    const group = window.PetPersonality.lines.context;              // { project:[...], ai:[...] }
    if(!group || !group[section]) return;                           // 该区域无台词：不打扰
    if((Date.now() - lastContextAt) < CFG.contextCooldownMs) return; // 冷却中
    contextTimer = setTimeout(function(){
      if(window.PetContext.get().section === section){              // 确认仍在原区域才说
        window.PetDialogue.say('context', section);
        lastContextAt = Date.now();
      }
      contextTimer = null;
    }, CFG.contextDelayMs);
  }

  // 页面隐藏/恢复：隐藏时暂停心跳（省资源），恢复时欢迎回来
  function onVisibility(){
    if(document.hidden){
      hiddenAt = Date.now();
      if(heartbeat){ clearInterval(heartbeat); heartbeat = null; }
    } else {
      const gap = hiddenAt ? (Date.now() - hiddenAt) : null;
      hiddenAt = null;
      window.PetState.touch();                    // 回来后重置空闲计时
      if(gap != null){                            // 切回标签页：按离开时长欢迎
        if(gap >= CFG.longBackMs){
          window.PetDialogue.say('welcome', 'longBack');
        } else {
          window.PetDialogue.say('welcome', 'back');
        }
      }
      if(window.PetEmotion.get() === EMOTION.SLEEPY){
        window.PetEmotion.onWake();               // 困倦中醒来
      }
      if(initialized && !heartbeat){              // 重启心跳
        heartbeat = setInterval(tick, CFG.heartbeatMs);
      }
    }
  }

  function init(){
    if(initialized) return;                        // 只允许初始化一次
    initialized = true;
    welcomeBack();                                 // 页面加载：欢迎
    heartbeat = setInterval(tick, CFG.heartbeatMs);
    document.addEventListener('visibilitychange', onVisibility);
    contextOff = window.PetContext.onChange(onSectionChange);  // 环境感知订阅
  }

  function destroy(){
    if(!initialized) return;
    initialized = false;
    if(heartbeat){ clearInterval(heartbeat); heartbeat = null; }
    if(restTimer){ clearTimeout(restTimer); restTimer = null; }
    if(contextTimer){ clearTimeout(contextTimer); contextTimer = null; }
    if(contextOff){ contextOff(); contextOff = null; }
    document.removeEventListener('visibilitychange', onVisibility);
    slept = false;
    rested = false;
  }

  // 未来：小D 感知用户浏览区域（当前只存不消费，接入 AI 时再实现逻辑）
  function setContext(section){ context = section; }

  return { init, destroy, setContext };
})();
