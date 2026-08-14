/* Live2D 桌宠 · 鼠标跟随（轻微旋转模拟关注，rAF 平滑插值）。依赖：PetState。 */
window.PetFollow = (function(){
  if(!window.PetState){
    console.error('[PetFollow] 依赖未加载：PetState');
  }

  const MAX = 4;       // 最大倾斜角度（度），避免旋转过大显得违和
  let target = 0;      // 目标角度（度）
  let current = 0;     // 当前角度（度）
  let raf = null;

  function update(){
    current += (target - current) * 0.03;
    if(Math.abs(target - current) < 0.01){
      current = target;
      raf = null;
    }
    const pet = window.PetState.getPet();
    if(pet) pet.setModelRotation(current);
    if(raf) raf = requestAnimationFrame(update);
  }
  function onMove(e){
    if(window.PetState.getState() === 'DRAGGING') return;   // 拖动时不跟随
    const cx = window.innerWidth / 2;
    target = ((e.clientX - cx) / cx) * MAX;
    if(!raf) raf = requestAnimationFrame(update);
  }
  function onLeave(){
    target = 0;                                             // 鼠标离开 → 恢复正面
    if(!raf) raf = requestAnimationFrame(update);
  }

  function init(){
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
  }

  return { init };
})();
