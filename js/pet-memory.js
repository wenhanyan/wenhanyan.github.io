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
    recordVisit(){                                  // 页面进入时调用：visitCount+1、更新 lastVisit、首次写 firstVisit
      const now = Date.now();
      if(!data.firstVisit) data.firstVisit = now;
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
    get(){ return data; }
  };
})();
