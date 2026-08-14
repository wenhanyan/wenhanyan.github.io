/* Live2D 桌宠 · 入口：创建 oh-my-live2d 实例 + 组装跟随/拖动 + 记录访问。依赖：PetState、PetMemory、PetFollow、PetDrag。 */
(function(){
  if(!window.PetState){
    console.error('[Live2D] 依赖未加载：PetState');
  }
  if(!window.PetMemory){
    console.error('[Live2D] 依赖未加载：PetMemory');
  }
  if(!window.PetFollow){
    console.error('[Live2D] 依赖未加载：PetFollow');
  }
  if(!window.PetDrag){
    console.error('[Live2D] 依赖未加载：PetDrag');
  }
  if(!window.PetBehavior){
    console.error('[Live2D] 依赖未加载：PetBehavior');
  }
  if(!window.PetMenu){
    console.error('[Live2D] 依赖未加载：PetMenu');
  }

  function boot(){
    window.PetMemory.recordVisit(); // 记录本次访问（不依赖 OML2D，CDN 失败也照常记录）
    if(!window.OML2D) return; // CDN 加载失败时静默跳过，不影响网站其余功能
    if(window.PetContext) window.PetContext.set('home'); // 页面加载默认在主页，同步上下文
    const oml = OML2D.loadOml2d({
      dockedPosition: 'right', // 默认是 left（会跑到左下角），这里改成右下角
      // 底部菜单：过滤掉"关于"按钮（默认会 window.open("https://oml2d.com") 跳外站），保留休息/切换衣服/切换模型
      menus: {
        items: (defaults) => defaults.filter((item) => item.id !== 'About')
      },
      models: [
        {
          path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
          position: [0, 60],
          scale: 0.08,
          stageStyle: { height: 450, zIndex: 150 }
        }
      ]
    });
    window.PetState.setPet(oml);
    window.PetFollow.init();
    window.PetMenu.init(); // 交互面板：情绪 → stage 类名（#oml2d-stage 同步已存在）
    // 欢迎/行为须等模型加载完成、气泡 DOM 就绪后再触发，否则 tipsMessage 会静默失效
    oml.onStageSlideIn(function(){
      window.PetBehavior.init(); // 内部有 initialized 守卫，多次触发安全
    });
  }

  window.PetDrag.init();

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
