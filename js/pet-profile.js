/* 桌宠 · 自身资料（名字 + 基础资料，代码内静态定义，不进 localStorage）。无依赖。 */
window.PetProfile = (function(){
  const name = '小D';                   // 桌宠自身名字（唯一来源，与用户名字分离，禁止硬编码）
  const identity = '个人网站数字伙伴';
  const version = '1.0.0';              // 桌宠资料版本
  const avatarDescription = '陪伴主人浏览网页的小型 AI 伙伴';
  const personalityVersion = '1.0';     // 人格版本
  return { name, identity, version, avatarDescription, personalityVersion };
})();
