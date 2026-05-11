export interface Translations {
  appName: string;
  home: {
    playNow: string;
    studentLogin: string;
    createAccount: string;
    enterName: string;
    enterPin: string;
    login: string;
    back: string;
    welcome: string;
    subtitle: string;
    guest: string;
  };
  characterSelect: {
    title: string;
  };
  levelSelect: {
    title: string;
    locked: string;
    secretLevels: string;
    mastered: string;
  };
  game: {
    run: string;
    reset: string;
    pause: string;
    resume: string;
    blocks: string;
    time: string;
    level: string;
    hints: string;
    speed: string;
    secret: string;
    secretUnlocked: string;
  };
  results: {
    perfect: string;
    great: string;
    complete: string;
    retry: string;
    nextLevel: string;
    menu: string;
    blocksUsed: string;
    timeTaken: string;
    points: string;
    streak: string;
    streakBonus: string;
  };
  pause: {
    resume: string;
    restart: string;
    quit: string;
  };
  blocks: {
    when_run: string;
    move_forward: string;
    move_backward: string;
    turn_left: string;
    turn_right: string;
    stop_motors: string;
    wait: string;
    repeat: string;
    if_obstacle: string;
    if_else: string;
    ultrasonic: string;
    read_color: string;
    times: string;
    seconds: string;
    degrees: string;
    cm: string;
  };
  blocklyCategories: {
    motion: string;
    control: string;
    sensing: string;
    events: string;
  };
  errors: {
    tooManyBlocks: string;
    timeout: string;
    collision: string;
    invalidPin: string;
    nameTaken: string;
  };
  avatars: Record<string, string>;
  levels: Record<number, { name: string; hint: string }>;
}

export const zhTW: Translations = {
  appName: 'mBot 程式冒險',
  home: {
    playNow: '開始遊戲',
    studentLogin: '學生登入',
    createAccount: '建立帳號',
    enterName: '輸入名字',
    enterPin: '輸入 PIN',
    login: '登入',
    back: '返回',
    welcome: '歡迎來到 mBot 程式冒險！',
    subtitle: '拖曳方塊，控制機器人，完成挑戰！',
    guest: '訪客遊玩',
  },
  characterSelect: {
    title: '選擇你的機器人！',
  },
  levelSelect: {
    title: '選擇關卡',
    locked: '鎖定',
    secretLevels: '秘密關卡',
    mastered: '你已經征服所有秘密關卡！',
  },
  game: {
    run: '執行',
    reset: '重置',
    pause: '暫停',
    resume: '繼續',
    blocks: '方塊',
    time: '時間',
    level: '關卡',
    hints: '提示',
    speed: '速度',
    secret: '秘密',
    secretUnlocked: '解鎖秘密關卡！',
  },
  results: {
    perfect: '完美！',
    great: '做得好！',
    complete: '關卡完成',
    retry: '重試',
    nextLevel: '下一關',
    menu: '選單',
    blocksUsed: '使用方塊',
    timeTaken: '花費時間',
    points: '得分',
    streak: '連勝',
    streakBonus: '連勝獎勵',
  },
  pause: {
    resume: '繼續遊戲',
    restart: '重新開始',
    quit: '離開',
  },
  blocks: {
    when_run: '▶ 開始',
    move_forward: '前進 {distance} 公分',
    move_backward: '後退 {distance} 公分',
    turn_left: '向左轉 {degrees} 度',
    turn_right: '向右轉 {degrees} 度',
    stop_motors: '停止馬達',
    wait: '等待 {seconds} 秒',
    repeat: '重複 {times} 次',
    if_obstacle: '如果前方有障礙物',
    if_else: '如果 {condition} 否則',
    ultrasonic: '超音波距離',
    read_color: '顏色感測器',
    times: '次',
    seconds: '秒',
    degrees: '度',
    cm: '公分',
  },
  blocklyCategories: {
    motion: '動作',
    control: '控制',
    sensing: '感測',
    events: '事件',
  },
  errors: {
    tooManyBlocks: '方塊太多！',
    timeout: '時間到！',
    collision: '撞到牆壁！',
    invalidPin: 'PIN 錯誤',
    nameTaken: '名字已被使用',
  },
  avatars: {
    'robot-1': '閃電',
    'robot-2': '齒輪',
    'robot-3': '火箭',
    'robot-4': '像素',
    'robot-5': '機器人',
    'robot-6': '迴聲',
  },
  levels: {
    1: { name: '向前走！', hint: '把「前進」方塊拖到工作區，然後點擊執行。' },
    2: { name: '轉彎！', hint: '前進後要轉彎才能到達目標。' },
    3: { name: '彎彎曲曲', hint: '連續轉彎可以走過彎曲的路。' },
    4: { name: '重複之路', hint: '使用「重複」方塊可以減少方塊數量。' },
    5: { name: '畫正方形', hint: '重複 4 次：前進、右轉 90 度。' },
    6: { name: '樓梯挑戰', hint: '觀察模式，用重複方塊完成樓梯。' },
    7: { name: '星星軌跡', hint: '嵌套重複可以畫出複雜圖形。' },
    8: { name: '注意障礙！', hint: '使用超音波感測器偵測牆壁。' },
    9: { name: '迷宮入門', hint: '沿著牆壁走，使用感測器避免碰撞。' },
    10: { name: '雙重障礙', hint: '需要偵測多個方向的障礙物。' },
    11: { name: '螺旋之路', hint: '每次前進多一點，畫出螺旋。' },
    12: { name: '十字路口', hint: '使用「如果...否則」做決定。' },
    13: { name: '長城迷宮', hint: '保持冷靜，一步一步解決長迷宮。' },
    14: { name: '黑暗迷宮', hint: '視線受限，善用感測器。' },
    15: { name: '終極挑戰', hint: '運用所有學到的技巧！' },
    101: { name: '彩虹迷宮', hint: '秘密關卡：色彩繽紛的挑戰！' },
    102: { name: '速度挑戰', hint: '秘密關卡：在時間內完成！' },
    103: { name: '鑽石收集', hint: '秘密關卡：收集所有鑽石！' },
    104: { name: '幽靈迷宮', hint: '秘密關卡：小心幽靈！' },
    105: { name: '無限螺旋', hint: '秘密關卡：無盡的螺旋！' },
  },
};

export const en: Translations = {
  appName: 'mBot Coding Adventure',
  home: {
    playNow: 'Play Now',
    studentLogin: 'Student Login',
    createAccount: 'Create Account',
    enterName: 'Enter your name',
    enterPin: 'Enter PIN',
    login: 'Login',
    back: 'Back',
    welcome: 'Welcome to mBot Coding Adventure!',
    subtitle: 'Drag blocks, control the robot, complete challenges!',
    guest: 'Play as Guest',
  },
  characterSelect: {
    title: 'Choose Your Robot!',
  },
  levelSelect: {
    title: 'Select Level',
    locked: 'Locked',
    secretLevels: 'Secret Levels',
    mastered: 'You have conquered all secret levels!',
  },
  game: {
    run: 'Run',
    reset: 'Reset',
    pause: 'Pause',
    resume: 'Resume',
    blocks: 'Blocks',
    time: 'Time',
    level: 'Level',
    hints: 'Hints',
    speed: 'Speed',
    secret: 'Secret',
    secretUnlocked: 'Secret Level Unlocked!',
  },
  results: {
    perfect: 'Perfect!',
    great: 'Great Job!',
    complete: 'Level Complete',
    retry: 'Retry',
    nextLevel: 'Next Level',
    menu: 'Menu',
    blocksUsed: 'Blocks Used',
    timeTaken: 'Time Taken',
    points: 'Points',
    streak: 'Streak',
    streakBonus: 'Streak Bonus',
  },
  pause: {
    resume: 'Resume',
    restart: 'Restart',
    quit: 'Quit',
  },
  blocks: {
    when_run: '▶ Run',
    move_forward: 'move forward {distance} cm',
    move_backward: 'move backward {distance} cm',
    turn_left: 'turn left {degrees} degrees',
    turn_right: 'turn right {degrees} degrees',
    stop_motors: 'stop motors',
    wait: 'wait {seconds} seconds',
    repeat: 'repeat {times} times',
    if_obstacle: 'if obstacle ahead',
    if_else: 'if {condition} else',
    ultrasonic: 'ultrasonic distance',
    read_color: 'color sensor',
    times: 'times',
    seconds: 'seconds',
    degrees: 'degrees',
    cm: 'cm',
  },
  blocklyCategories: {
    motion: 'Motion',
    control: 'Control',
    sensing: 'Sensing',
    events: 'Events',
  },
  errors: {
    tooManyBlocks: 'Too many blocks!',
    timeout: 'Time\'s up!',
    collision: 'You hit a wall!',
    invalidPin: 'Invalid PIN',
    nameTaken: 'Name already taken',
  },
  avatars: {
    'robot-1': 'Bolt',
    'robot-2': 'Gear',
    'robot-3': 'Rocket',
    'robot-4': 'Pixel',
    'robot-5': 'Robot',
    'robot-6': 'Echo',
  },
  levels: {
    1: { name: 'Go Forward!', hint: 'Drag the "move forward" block and click Run.' },
    2: { name: 'Turn!', hint: 'Go forward, then turn to reach the goal.' },
    3: { name: 'Zigzag', hint: 'Use multiple turns to follow the winding path.' },
    4: { name: 'Repeat Road', hint: 'Use the "repeat" block to save blocks.' },
    5: { name: 'Draw Square', hint: 'Repeat 4 times: forward, turn right 90°.' },
    6: { name: 'Stair Challenge', hint: 'Find the pattern and use repeat.' },
    7: { name: 'Star Trail', hint: 'Nested repeats make complex shapes.' },
    8: { name: 'Watch Out!', hint: 'Use the ultrasonic sensor to detect walls.' },
    9: { name: 'Maze Entry', hint: 'Follow walls, use sensors to avoid crashes.' },
    10: { name: 'Double Obstacle', hint: 'Detect obstacles from multiple directions.' },
    11: { name: 'Spiral Road', hint: 'Each time go a bit further to draw a spiral.' },
    12: { name: 'Crossroads', hint: 'Use "if...else" to make decisions.' },
    13: { name: 'Great Wall', hint: 'Stay calm, solve the long maze step by step.' },
    14: { name: 'Dark Maze', hint: 'Visibility is limited, use sensors wisely.' },
    15: { name: 'Final Challenge', hint: 'Use everything you learned!' },
    101: { name: 'Rainbow Maze', hint: 'Secret: A colorful challenge!' },
    102: { name: 'Speed Run', hint: 'Secret: Complete within the time limit!' },
    103: { name: 'Diamond Hunt', hint: 'Secret: Collect all diamonds!' },
    104: { name: 'Ghost Maze', hint: 'Secret: Watch out for ghosts!' },
    105: { name: 'Infinite Spiral', hint: 'Secret: An endless spiral!' },
  },
};
