/* Live2D 桌宠 · 拖动 + 点击检测（4px 阈值区分）。依赖：PetState、PetEmotion、PetDialogue、PetMemory。 */
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
  if(!window.PetMemory){
    console.error('[PetDrag] 依赖未加载：PetMemory');
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
      window.PetState.touch();                  // 任何与桌宠的接触都算互动，重置空闲计时
      drag = { stage: stage, sx: e.clientX, sy: e.clientY, l: r.left, t: r.top, moved: false };
    });
    document.addEventListener('pointermove', function(e){
      if(!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if(!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      drag.moved = true;
      window.PetMemory.recordInteraction('drag');                              // 记录一次拖动
      window.PetState.setActivity(window.PetActivity.DRAGGING);                 // 超过阈值 = 拖动
      const s = drag.stage;
      s.style.left = (drag.l + dx) + 'px';
      s.style.top = (drag.t + dy) + 'px';
      s.style.right = 'auto';
      s.style.bottom = 'auto';
    });
    function endDrag(){
      if(drag && !drag.moved){ // 未超过阈值 = 点击互动：记录 + 先更新情绪，再按互动层级选台词
        window.PetEmotion.onInteraction();
        // 互动反馈：第一次点击 → first；老朋友 → friend；否则按情绪选词（保持人格一致）。
        // 记忆调用整体 try/catch 兜底：旧缓存 pet-memory.js 缺方法（recordInteraction/get/getRelationshipLevel）
        // 时安全回退到情绪选词，绝不阻断 say('click')。
        let variant = null;
        try {
          window.PetMemory.recordInteraction('click');
          const clicks = (window.PetMemory.get().interactions || {}).click || 0;
          if(clicks === 1) variant = 'first';
          else if(typeof window.PetMemory.getRelationshipLevel === 'function' &&
                  window.PetMemory.getRelationshipLevel() === 'friend') variant = 'friend';
        } catch(e) {
          variant = null;
        }
        window.PetDialogue.say('click', variant);
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
