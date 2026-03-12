/**
 * 视频模块 - 知识库静态内容
 * 用于「知识库」Tab：镜头类型、运镜方式、转场效果、BGM 风格等讲解
 */

/** 镜头类型（景别与角度）详解 */
export const SHOT_TYPES_KNOWLEDGE = [
  { id: 'ews', abbr: 'EWS', cn: '远景/全景', en: 'Extreme Wide Shot', desc: { cn: '展示整体环境，人物极小，用于建立空间感与氛围。', en: 'Shows the full environment with subjects very small; establishes space and mood.' } },
  { id: 'ws', abbr: 'WS', cn: '全景', en: 'Wide Shot', desc: { cn: '展示完整场景，人物全身可见，适合动作与走位。', en: 'Full scene with full body visible; good for action and blocking.' } },
  { id: 'mws', abbr: 'MWS', cn: '中全景', en: 'Medium Wide Shot', desc: { cn: '从膝部以上取景，兼顾环境与人物。', en: 'Framed from knees up; balances environment and character.' } },
  { id: 'ms', abbr: 'MS', cn: '中景', en: 'Medium Shot', desc: { cn: '从腰部以上取景，常用对话与互动。', en: 'Waist up; common for dialogue and interaction.' } },
  { id: 'mcu', abbr: 'MCU', cn: '中近景', en: 'Medium Close-up', desc: { cn: '从胸部以上取景，突出表情与上半身动作。', en: 'Chest up; emphasizes expression and upper body.' } },
  { id: 'cu', abbr: 'CU', cn: '近景/特写', en: 'Close-up', desc: { cn: '面部或物体细节，表达情绪、制造紧张或亲密感。', en: 'Face or object detail; conveys emotion, tension or intimacy.' } },
  { id: 'ecu', abbr: 'ECU', cn: '大特写', en: 'Extreme Close-up', desc: { cn: '极致细节（眼睛、手指等），强化符号与情绪。', en: 'Extreme detail (eyes, hands); reinforces symbolism and emotion.' } },
  { id: 'ots', abbr: 'OTS', cn: '过肩镜头', en: 'Over-the-shoulder', desc: { cn: '从一个角色肩后拍另一角色，常用于对话与关系。', en: 'Over one character\'s shoulder to another; common for dialogue and relationship.' } },
  { id: 'bev', abbr: 'BEV', cn: '鸟瞰', en: 'Bird\'s Eye View', desc: { cn: '正上方俯拍，强调布局、路径或渺小感。', en: 'Directly above; emphasizes layout, path or scale.' } },
  { id: 'la', abbr: 'LA', cn: '低角度', en: 'Low Angle', desc: { cn: '仰拍，凸显力量感、权威或压迫感。', en: 'Looking up; suggests power, authority or threat.' } },
  { id: 'ha', abbr: 'HA', cn: '高角度', en: 'High Angle', desc: { cn: '俯拍，凸显弱小、渺小或被动感。', en: 'Looking down; suggests vulnerability or passivity.' } },
  { id: 'da', abbr: 'DA', cn: '荷兰角', en: 'Dutch Angle', desc: { cn: '倾斜画面，制造不安、失衡或紧张感。', en: 'Tilted frame; creates unease, disorientation or tension.' } },
  { id: 'pov', abbr: 'POV', cn: 'POV 主观镜头', en: 'Point of View', desc: { cn: '模拟角色视角，增强代入感。', en: 'Simulates character\'s view; increases immersion.' } },
  { id: 'ff', abbr: 'FF', cn: '首帧', en: 'First Frame', desc: { cn: '视频起始画面，通常保持原图或静态构图。', en: 'Opening frame of the video; often holds reference or static composition.' } },
];

/** 运镜方式详解 */
export const CAMERA_MOVEMENT_KNOWLEDGE = [
  { id: 'static', cn: '静止', en: 'Static', desc: { cn: '机位固定，无运动，适合强调对白或稳定情绪。', en: 'Fixed camera; no movement; good for dialogue or calm mood.' } },
  { id: 'push_in', cn: '推进', en: 'Push In', desc: { cn: '镜头向前推进，逐渐聚焦主体，增强紧张或关注。', en: 'Camera moves forward; draws focus to subject; builds tension or focus.' } },
  { id: 'pull_out', cn: '拉远', en: 'Pull Out', desc: { cn: '镜头向后拉远，揭示环境或结束段落。', en: 'Camera pulls back; reveals environment or ends a beat.' } },
  { id: 'pan', cn: '左摇/右摇', en: 'Pan Left/Right', desc: { cn: '机位不动，镜头水平转动，扫过场景或跟随动作。', en: 'Camera rotates horizontally; scans scene or follows action.' } },
  { id: 'tilt', cn: '俯仰', en: 'Tilt Up/Down', desc: { cn: '机位不动，镜头垂直转动，由上到下或由下到上。', en: 'Camera tilts vertically; top to bottom or vice versa.' } },
  { id: 'tracking', cn: '跟踪', en: 'Tracking', desc: { cn: '镜头跟随主体移动，保持主体在画面中的相对位置。', en: 'Camera follows subject; keeps subject framed consistently.' } },
  { id: 'orbit', cn: '环绕', en: 'Orbit', desc: { cn: '围绕主体旋转，多角度展示或营造氛围。', en: 'Camera circles subject; shows multiple angles or builds mood.' } },
  { id: 'handheld', cn: '手持晃动', en: 'Handheld', desc: { cn: '模拟手持摄影的轻微晃动，增加真实感或紧张感。', en: 'Slight shake like handheld; adds realism or tension.' } },
  { id: 'crane', cn: '升降', en: 'Crane/Boom', desc: { cn: '镜头整体升降，从低到高或从高到低，常用于开场或收尾。', en: 'Camera moves up or down; often for opening or closing.' } },
];

/** 转场效果简述 */
export const TRANSITION_KNOWLEDGE = [
  { id: 'cut', cn: '硬切', en: 'Cut', desc: { cn: '直接切换，无过渡，最常用，节奏明快。', en: 'Instant switch; no transition; most common and punchy.' } },
  { id: 'fade', cn: '淡入淡出', en: 'Fade', desc: { cn: '画面渐隐或渐显，常用于时间跳跃或段落分隔。', en: 'Fade to/from black; time jump or act break.' } },
  { id: 'dissolve', cn: '交叉溶解', en: 'Cross Dissolve', desc: { cn: '前后画面重叠过渡，柔和、略带回忆或梦幻感。', en: 'Overlap transition; soft, dreamy or nostalgic.' } },
  { id: 'wipe', cn: '滑入', en: 'Wipe', desc: { cn: '新画面以边界线推进取代旧画面，可带方向感。', en: 'New image wipes over the old; can suggest direction.' } },
  { id: 'flash', cn: '闪白', en: 'Flash White', desc: { cn: '短暂闪白后切到下一镜，常用于冲击或回忆闪回。', en: 'Brief white flash then cut; impact or flashback.' } },
  { id: 'black', cn: '黑场过渡', en: 'Black', desc: { cn: '切到黑屏再切到下一镜，强调段落结束或悬念。', en: 'Cut to black then to next; emphasizes act end or cliffhanger.' } },
];

/** BGM 风格简述（与词库一致，用于知识库展示） */
export const BGM_STYLE_KNOWLEDGE = [
  { id: 'tense', cn: '紧张悬疑', en: 'Tense & Suspenseful', desc: { cn: '低音、稀疏节奏、不和谐音，适合悬念与危机。', en: 'Low tones, sparse rhythm, dissonance; for suspense and crisis.' } },
  { id: 'warm', cn: '温暖治愈', en: 'Warm & Healing', desc: { cn: '柔和和声、中慢板，适合情感与治愈向。', en: 'Soft harmony, mid-slow tempo; emotional and healing.' } },
  { id: 'epic', cn: '史诗宏大', en: 'Epic & Grand', desc: { cn: '管弦、合唱、大动态，适合高潮与史诗感。', en: 'Orchestral, choir, big dynamics; for climax and epic feel.' } },
  { id: 'light', cn: '轻松欢快', en: 'Light & Cheerful', desc: { cn: '明亮旋律、轻快节奏，适合日常与喜剧。', en: 'Bright melody, upbeat; for daily life and comedy.' } },
  { id: 'mysterious', cn: '神秘电子', en: 'Mysterious Electronic', desc: { cn: '合成器、空间感、渐变织体，适合科幻与悬疑。', en: 'Synths, space, evolving texture; sci-fi and mystery.' } },
  { id: 'classical', cn: '古典优雅', en: 'Classical & Elegant', desc: { cn: '古典配器与和声，适合年代、文艺或庄重场景。', en: 'Classical instrumentation; period, literary or formal.' } },
];
