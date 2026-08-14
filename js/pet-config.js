/* 桌宠 · 集中配置：枚举 + 行为/情绪参数 + storage key + 数据版本。无依赖，必须最先加载。 */
window.PetActivity = Object.freeze({
  IDLE: 'IDLE',
  TALKING: 'TALKING',
  INTERACTION: 'INTERACTION',
  DRAGGING: 'DRAGGING'
});

window.PetEmotion = Object.freeze({
  CALM: 'CALM',
  HAPPY: 'HAPPY',
  CURIOUS: 'CURIOUS',
  SLEEPY: 'SLEEPY'
});

window.PetConfig = Object.freeze({
  version: 1,                    // localStorage 数据版本，未来升级迁移用
  memoryKey: 'delta_pet_memory',
  userKey: 'delta_pet_user',
  behavior: {                    // 阶段3 主动行为使用（本阶段只定义不消费）
    idleTalkMinMs: 25000,        // 首次主动搭话最短间隔
    idleTalkMaxMs: 45000,        // 首次主动搭话最长间隔
    talkCooldownMinMs: 120000,   // 搭话最小冷却
    talkCooldownMaxMs: 300000,   // 搭话最大冷却
    restAfterMs: 180000          // 无操作多久进入休息
  },
  emotion: {                     // 阶段2 情绪使用（本阶段只定义不消费）
    default: PetEmotion.CALM,
    sleepyAfterMs: 180000        // 无互动多久变 SLEEPY
  }
});
