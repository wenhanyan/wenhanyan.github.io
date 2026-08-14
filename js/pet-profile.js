/* 桌宠 · 自身资料（名字 + 基础资料，代码内静态定义，不进 localStorage）。无依赖。 */
window.PetProfile = (function(){
  const name = 'Delta';              // 桌宠自身名字（唯一来源，与用户名字分离）
  const identity = '个人网站数字伙伴';
  const version = '1.0.0';           // 桌宠资料版本
  return { name, identity, version };
})();
