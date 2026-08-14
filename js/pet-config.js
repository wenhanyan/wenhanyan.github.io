/* 桌宠 · 集中配置：枚举 + 行为/情绪参数 + storage key + 数据版本。无依赖，必须最先加载。 */
window.PetActivity = Object.freeze({
  IDLE: 'IDLE',
  TALKING: 'TALKING',
  INTERACTION: 'INTERACTION',
  DRAGGING: 'DRAGGING'
});

window.PetEmotionType = Object.freeze({
  CALM: 'CALM',
  HAPPY: 'HAPPY',
  CURIOUS: 'CURIOUS',
  SLEEPY: 'SLEEPY'
});

window.PetConfig = Object.freeze({
  version: 1,                    // localStorage 数据版本，未来升级迁移用
  memoryKey: 'delta_pet_memory',
  userKey: 'delta_pet_user',
  behavior: {                    // 阶段3 行为调度使用
    heartbeatMs: 10000,          // 空闲心跳检查间隔
    sleepyAfterMs: 180000,       // 无互动 3 分钟 → SLEEPY（发呆/打哈欠）
    restAfterMs: 360000,         // 无互动 6 分钟 → 进入休息
    restReminderDelayMs: 4000,   // 休息行为后多久提醒主人起身（错开上一条气泡）
    shortBackMs: 1800000,        // 离开 ≤ 30 分钟 = 短时间回来
    longBackMs: 86400000,        // 离开 ≥ 24 小时 = 长时间回来
    contextCooldownMs: 120000,   // 同一区域至少间隔 2 分钟才再说话
    welcomePriorityMs: 3000      // 欢迎语优先级窗口：欢迎气泡展示期间不触发环境介绍
  },
  emotion: {                     // 情绪参数
    default: PetEmotionType.CALM
  }
});
