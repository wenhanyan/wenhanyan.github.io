/* Live2D 桌宠 · 拖动 + 点击检测（4px 阈值区分）。依赖：PetState、PetEmotion、PetDialogue。 */
window.PetDrag = (function(){
  if(!window.PetState){
    console.error('[PetDrag] 依赖未加载：PetState');
  }
  if(!window.PetEmotion){
    console.error('[PetDrag] 依赖未加载：PetEmotion');
  }
  if(!window.PetDialogue){
    console.error('[PetDrag] 依赖未加载：PetDialogue');
  }

  let drag = null;

  /* oh-my-live2d 本身不支持自由拖动，这里手动实现：按住模型画布拖动整个桌宠。
     拖动与点击共用一个 pointer 事件，用 4px 阈值区分：超阈值=拖动，未超=点击互动。 */
  function init(){
    document.addEventListener('pointerdown', function(e){
      if(!e.target || !e.target.closest) return;
      if(!e.target.closest('#oml2d-canvas')) return;
      const stage = e.target.closest('#oml2d-stage');
      if(!stage) return;
      const r = stage.getBoundingClientRect();
      drag = { stage: stage, sx: e.clientX, sy: e.clientY, l: r.left, t: r.top, moved: false };
    });
    document.addEventListener('pointermove', function(e){
      if(!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if(!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      drag.moved = true;
      window.PetState.setActivity(window.PetActivity.DRAGGING);                 // 超过阈值 = 拖动
      const s = drag.stage;
      s.style.left = (drag.l + dx) + 'px';
      s.style.top = (drag.t + dy) + 'px';
      s.style.right = 'auto';
      s.style.bottom = 'auto';
    });
    function endDrag(){
      if(drag && !drag.moved){ // 未超过阈值 = 点击互动：先更新情绪，再按新情绪选台词
        window.PetEmotion.onInteraction();
        window.PetDialogue.say('click');
      }
      drag = null;
      if(window.PetState.getActivity() === window.PetActivity.DRAGGING) window.PetState.setActivity(window.PetActivity.IDLE); // 拖动结束 → 恢复待机
    }
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', function(){ // 触摸被中断（如滚动）时只清理，不触发点击
      drag = null;
      if(window.PetState.getActivity() === window.PetActivity.DRAGGING) window.PetState.setActivity(window.PetActivity.IDLE);
    });
  }

  return { init };
})();
