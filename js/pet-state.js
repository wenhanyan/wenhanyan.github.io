/* Live2D 桌宠 · 共享状态中枢（pet 实例 + 当前状态）。无依赖，必须最先加载。 */
window.PetState = (function(){
  let pet = null;          // oh-my-live2d 实例（loadOml2d 返回值）
  let state = 'IDLE';      // IDLE / TALKING / INTERACTION / DRAGGING
  return {
    getPet(){ return pet; },
    setPet(p){ pet = p; },
    getState(){ return state; },
    setState(s){ state = s; }
  };
})();
