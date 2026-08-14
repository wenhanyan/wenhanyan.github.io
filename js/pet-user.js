/* 桌宠 · 用户身份（昵称，localStorage 持久化）。依赖：PetConfig。 */
window.PetUser = (function(){
  if(!window.PetConfig){
    console.error('[PetUser] 依赖未加载：PetConfig');
  }
  const KEY = window.PetConfig.userKey;

  let name = null;
  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed.name === 'string') ? parsed.name : null;
    } catch(e){ return null; }
  }
  function save(){
    try {
      const obj = { version: window.PetConfig.version, name: name || null };
      localStorage.setItem(KEY, JSON.stringify(obj));
    } catch(e){}
  }
  name = load();

  return {
    getName(){ return name; },                      // 获取昵称（未来 AI 唯一用户身份来源）
    getDisplayName(){ return name || '朋友'; },     // 未设置时显示"朋友"，避免 null
    setName(n){                                     // 设置/修改昵称：trim + 转字符串 + 立即生效
      const v = (n == null) ? '' : String(n).trim();
      name = v || null;
      save();
      return name;
    },
    clear(){                                        // 删除昵称
      name = null;
      try { localStorage.removeItem(KEY); } catch(e){}
    }
  };
})();
