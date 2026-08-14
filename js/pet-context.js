/* 桌宠 · 网站上下文感知（保存当前浏览区域，localStorage 持久化，不涉服务器）。
   依赖：PetConfig。区域：home / project / about / ai。 */
window.PetContext = (function(){
  if(!window.PetConfig){
    console.error('[PetContext] 依赖未加载：PetConfig');
  }
  const KEY = 'delta_pet_context';   // 独立 key，不动 PetMemory 数据结构
  const VALID = ['home', 'project', 'about', 'ai'];
  // 视图名 → 规范区域（网站 nav 用 "projects"，这里规范化为 "project"）
  const VIEW_MAP = { home: 'home', projects: 'project', project: 'project', about: 'about', ai: 'ai' };

  const listeners = [];              // 区域变化订阅（供行为层感知环境）
  let section = 'home';              // 默认主页

  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if(parsed && VALID.indexOf(parsed.section) >= 0) section = parsed.section;
  } catch(e){ section = 'home'; }

  function set(s){
    const next = (VIEW_MAP[s] != null) ? VIEW_MAP[s] : null;  // 未知区域（reading/games/resume）→ null
    const prev = section;
    section = next;
    try { localStorage.setItem(KEY, JSON.stringify({ version: window.PetConfig.version, section: section })); } catch(e){}
    if(section !== prev){
      listeners.forEach(function(fn){ try{ fn(section, prev); }catch(e){} });
    }
    return { section: section };
  }

  function get(){ return { section: section }; }

  // 订阅区域变化，返回解绑函数（供 PetBehavior 感知环境）
  function onChange(fn){
    if(typeof fn !== 'function') return function(){};
    listeners.push(fn);
    return function(){ const i = listeners.indexOf(fn); if(i >= 0) listeners.splice(i, 1); };
  }

  return { set, get, onChange };
})();
