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

  /* 手感参数：位置阻尼跟随 + 速度驱动倾斜，让角色像有重量一样被“拽着走”。 */
  const FEEL = {
    posK: 0.3,      // 位置追随手指数（越小越“沉”，延迟越明显）
    tiltK: 0.2,     // 倾斜角回正/跟随速度（越小越“甩”）
    tiltV: 0.5,     // 横向移动速度 → 倾斜角换算系数
    tiltMax: 12,    // 最大倾斜角（度）
  };

  /* rAF 追帧状态：只负责把“目标”平滑搬到“渲染位置/倾斜”，不碰业务逻辑。 */
  const anim = {
    on: false,
    stage: null,   // 追帧期间持有 stage 引用（drag 置空后仍用于回正）
    tx: 0, ty: 0,  // 目标位置（手指指向）
    cx: 0, cy: 0,  // 当前渲染位置
    tilt: 0,       // 当前倾斜角
    targetTilt: 0  // 目标倾斜角（由横向速度驱动）
  };

  function ensureLoop(){
    if(anim.on) return;
    anim.on = true;
    requestAnimationFrame(step);
  }

  function step(){
    const s = anim.stage;
    const dragging = !!(drag && drag.moved);
    const residual = Math.abs(anim.tx - anim.cx) + Math.abs(anim.ty - anim.cy);

    // 位置：拖动中 / 松手后残余追赶，都向目标做阻尼逼近（自然延迟 + 到点即停）
    if(s && (dragging || residual > 0.5)){
      anim.cx += (anim.tx - anim.cx) * FEEL.posK;
      anim.cy += (anim.ty - anim.cy) * FEEL.posK;
      s.style.left = anim.cx + 'px';
      s.style.top = anim.cy + 'px';
      s.style.right = 'auto';
      s.style.bottom = 'auto';
    }

    // 倾斜：向目标角阻尼逼近（松手后目标角=0，自然回正）
    anim.tilt += (anim.targetTilt - anim.tilt) * FEEL.tiltK;

    if(s){
      if(dragging || Math.abs(anim.tilt) > 0.05){
        s.style.transform = 'rotate(' + anim.tilt.toFixed(2) + 'deg)';
      } else {
        s.style.transform = ''; // 回正到位，移除内联 transform
      }
    }

    if(dragging || residual > 0.5 || Math.abs(anim.tilt) > 0.05){
      requestAnimationFrame(step);
    } else {
      anim.on = false;
      anim.stage = null;
    }
  }

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
      drag = { stage: stage, sx: e.clientX, sy: e.clientY, l: r.left, t: r.top, moved: false, lastX: e.clientX };
      // 预热追帧：以当前渲染位置为起点，避免首帧从 0 跳变
      anim.stage = stage;
      anim.tx = anim.cx = r.left;
      anim.ty = anim.cy = r.top;
      anim.targetTilt = 0;
    });
    document.addEventListener('pointermove', function(e){
      if(!drag) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if(!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      if(!drag.moved){
        drag.moved = true;
        // 进入拖动：关掉库自带 transition，交给 rAF 阻尼，避免双重延迟/抖动
        drag.prevTransition = drag.stage.style.transition;
        drag.stage.style.transition = 'none';
        window.PetMemory.recordInteraction('drag');                              // 记录一次拖动
        window.PetState.setActivity(window.PetActivity.DRAGGING);                 // 超过阈值 = 拖动
      }
      // 目标位置 = 起始 + 位移；倾斜由横向速度驱动（方向一变目标角随之翻转，由阻尼产生延迟）
      anim.tx = drag.l + dx;
      anim.ty = drag.t + dy;
      anim.targetTilt = Math.max(-FEEL.tiltMax, Math.min(FEEL.tiltMax, (e.clientX - drag.lastX) * FEEL.tiltV));
      drag.lastX = e.clientX;
      ensureLoop();
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
      // 松开：恢复 transition，倾斜目标归零，由 rAF 把位置/倾斜自然收尾
      if(drag){
        anim.targetTilt = 0;
        if(drag.prevTransition !== undefined){
          drag.stage.style.transition = drag.prevTransition;
        }
        if(drag.moved) ensureLoop();
      }
      drag = null;
      if(window.PetState.getActivity() === window.PetActivity.DRAGGING) window.PetState.setActivity(window.PetActivity.IDLE); // 拖动结束 → 恢复待机
    }
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', function(){ // 触摸被中断（如滚动）时只清理，不触发点击
      if(drag){
        anim.targetTilt = 0;
        if(drag.prevTransition !== undefined){
          drag.stage.style.transition = drag.prevTransition;
        }
        if(drag.moved) ensureLoop();
      }
      drag = null;
      if(window.PetState.getActivity() === window.PetActivity.DRAGGING) window.PetState.setActivity(window.PetActivity.IDLE);
    });
  }

  return { init };
})();
