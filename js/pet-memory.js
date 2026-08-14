/* 桌宠 · 记忆（访问记录，localStorage 持久化，不涉及服务器）。依赖：PetConfig。 */
window.PetMemory = (function(){
  if(!window.PetConfig){
    console.error('[PetMemory] 依赖未加载：PetConfig');
  }
  const KEY = window.PetConfig.memoryKey;

  function defaults(){
    return {
      version: window.PetConfig.version,
      firstVisit: null,
      lastVisit: null,
      visitCount: 0,
      lastGap: null,                             // 距上次访问的时长（毫秒），首次为 null
      interactions: { click: 0, drag: 0 }
    };
  }

  let data;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    data = Object.assign(defaults(), (parsed && typeof parsed === 'object') ? parsed : {});
  } catch(e){
    data = defaults();
  }

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
  }

  return {
    recordVisit(){                                  // 页面进入时调用：覆盖 lastVisit 前先捕获离开时长 lastGap
      const now = Date.now();
      if(!data.firstVisit) data.firstVisit = now;
      data.lastGap = data.lastVisit ? (now - data.lastVisit) : null;
      data.lastVisit = now;
      data.visitCount += 1;
      save();
    },
    recordInteraction(type){                        // type: 'click' | 'drag'
      if(type === 'click' || type === 'drag'){
        data.interactions[type] = (data.interactions[type] || 0) + 1;
        save();
      }
    },
    isFirstVisit(){ return data.visitCount === 1; },
    getLastGap(){ return data.lastGap; },          // 距上次访问时长（毫秒），用于回来欢迎语分层
    getVisitCount(){ return data.visitCount; },    // 累计访问次数（熟悉度）
    getRelationshipLevel(){                        // 关系等级：基于累计访问次数
      if(data.visitCount >= 10) return 'friend';
      if(data.visitCount >= 3) return 'familiar';
      return 'stranger';
    },
    get(){ return data; }
  };
})();
