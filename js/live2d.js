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

  function boot(){
    window.PetMemory.recordVisit(); // 记录本次访问（不依赖 OML2D，CDN 失败也照常记录）
    if(!window.OML2D) return; // CDN 加载失败时静默跳过，不影响网站其余功能
    window.PetState.setPet(OML2D.loadOml2d({
      dockedPosition: 'right', // 默认是 left（会跑到左下角），这里改成右下角
      models: [
        {
          path: 'https://model.hacxy.cn/HK416-1-normal/model.json',
          position: [0, 60],
          scale: 0.08,
          stageStyle: { height: 450, zIndex: 150 }
        }
      ]
    }));
    window.PetFollow.init();
  }

  window.PetDrag.init();

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
