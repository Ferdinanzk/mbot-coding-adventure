import type { Wall } from '@/lib/simulator/engine';

export interface LevelData {
  id: number;
  name: string;
  gridSize: [number, number];
  cellSize: number;
  start: { x: number; y: number; heading: number };
  goal: { x: number; y: number };
  walls: Wall[];
  groundLines?: Wall[];
  hints: string[];
  maxBlocks: number;
  timeLimit: number | null;
  optimalBlocks: number;
  availableBlocks: string[];
}

export interface SecretLevelData extends LevelData {
  difficulty: 'Medium' | 'Hard';
  basePoints: number;
}

export const LEVELS: LevelData[] = [
  {
    id: 1, name: '向前走！', gridSize: [8, 6], cellSize: 60,
    start: { x: 1, y: 3, heading: 0 },
    goal: { x: 6, y: 3 },
    walls: [
      { x1: 0, y1: 0, x2: 8, y2: 0 }, { x1: 0, y1: 6, x2: 8, y2: 6 },
      { x1: 0, y1: 0, x2: 0, y2: 6 }, { x1: 8, y1: 0, x2: 8, y2: 6 },
      { x1: 0, y1: 2, x2: 8, y2: 2 }, { x1: 0, y1: 4, x2: 8, y2: 4 },
    ],
    hints: ['把「前進」方塊拖到工作區，然後點擊執行。', 'Drag the "move forward" block and click Run.'],
    maxBlocks: 3, timeLimit: 30, optimalBlocks: 1,
    availableBlocks: ['move_forward'],
  },
  {
    id: 2, name: '轉彎！', gridSize: [8, 8], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 6, y: 6 },
    walls: [
      { x1: 0, y1: 0, x2: 8, y2: 0 }, { x1: 0, y1: 8, x2: 8, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 8, y1: 0, x2: 8, y2: 8 },
      { x1: 4, y1: 0, x2: 4, y2: 4 }, { x1: 4, y1: 4, x2: 8, y2: 4 },
    ],
    hints: ['前進後要轉彎才能到達目標。', 'Go forward, then turn to reach the goal.'],
    maxBlocks: 5, timeLimit: 45, optimalBlocks: 2,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right'],
  },
  {
    id: 3, name: '彎彎曲曲', gridSize: [10, 6], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 8, y: 4 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 6, x2: 10, y2: 6 },
      { x1: 0, y1: 0, x2: 0, y2: 6 }, { x1: 10, y1: 0, x2: 10, y2: 6 },
      { x1: 3, y1: 0, x2: 3, y2: 3 }, { x1: 6, y1: 3, x2: 6, y2: 6 },
      { x1: 3, y1: 3, x2: 6, y2: 3 },
    ],
    hints: ['連續轉彎可以走過彎曲的路。', 'Multiple turns follow the winding path.'],
    maxBlocks: 7, timeLimit: 60, optimalBlocks: 3,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right'],
  },
  {
    id: 4, name: '重複之路', gridSize: [10, 6], cellSize: 60,
    start: { x: 1, y: 3, heading: 0 },
    goal: { x: 8, y: 3 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 6, x2: 10, y2: 6 },
      { x1: 0, y1: 0, x2: 0, y2: 6 }, { x1: 10, y1: 0, x2: 10, y2: 6 },
      { x1: 5, y1: 2, x2: 5, y2: 4 },
    ],
    hints: ['使用「重複」方塊可以減少方塊數量。', 'Use the "repeat" block to save blocks.'],
    maxBlocks: 5, timeLimit: 60, optimalBlocks: 2,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat'],
  },
  {
    id: 5, name: '畫正方形', gridSize: [8, 8], cellSize: 60,
    start: { x: 2, y: 2, heading: 0 },
    goal: { x: 2, y: 2 },
    walls: [
      { x1: 0, y1: 0, x2: 8, y2: 0 }, { x1: 0, y1: 8, x2: 8, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 8, y1: 0, x2: 8, y2: 8 },
    ],
    groundLines: [
      { x1: 2, y1: 2, x2: 5, y2: 2 },
      { x1: 5, y1: 2, x2: 5, y2: 5 },
      { x1: 5, y1: 5, x2: 2, y2: 5 },
      { x1: 2, y1: 5, x2: 2, y2: 2 },
    ],
    hints: ['重複 4 次：前進、右轉 90 度。', 'Repeat 4 times: forward, turn right 90°.'],
    maxBlocks: 8, timeLimit: 90, optimalBlocks: 4,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat'],
  },
  {
    id: 6, name: '樓梯挑戰', gridSize: [10, 8], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 8, y: 6 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 8, x2: 10, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 10, y1: 0, x2: 10, y2: 8 },
      { x1: 3, y1: 0, x2: 3, y2: 3 }, { x1: 5, y1: 3, x2: 5, y2: 5 },
      { x1: 7, y1: 5, x2: 7, y2: 8 },
    ],
    hints: ['觀察模式，用重複方塊完成樓梯。', 'Find the pattern and use repeat.'],
    maxBlocks: 10, timeLimit: 90, optimalBlocks: 5,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat'],
  },
  {
    id: 7, name: '星星軌跡', gridSize: [10, 10], cellSize: 60,
    start: { x: 5, y: 5, heading: 0 },
    goal: { x: 5, y: 5 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 10, y1: 0, x2: 10, y2: 10 },
    ],
    hints: ['嵌套重複可以畫出複雜圖形。', 'Nested repeats make complex shapes.'],
    maxBlocks: 12, timeLimit: 120, optimalBlocks: 6,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat'],
  },
  {
    id: 8, name: '注意障礙！', gridSize: [10, 8], cellSize: 60,
    start: { x: 1, y: 4, heading: 0 },
    goal: { x: 8, y: 4 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 8, x2: 10, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 10, y1: 0, x2: 10, y2: 8 },
      { x1: 5, y1: 2, x2: 5, y2: 6 },
    ],
    hints: ['使用超音波感測器偵測牆壁。', 'Use the ultrasonic sensor to detect walls.'],
    maxBlocks: 8, timeLimit: 120, optimalBlocks: 4,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
  },
  {
    id: 9, name: '迷宮入門', gridSize: [10, 10], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 8, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 10, y1: 0, x2: 10, y2: 10 },
      { x1: 3, y1: 0, x2: 3, y2: 7 }, { x1: 3, y1: 7, x2: 7, y2: 7 },
      { x1: 7, y1: 3, x2: 7, y2: 7 }, { x1: 5, y1: 3, x2: 5, y2: 5 },
    ],
    hints: ['沿著牆壁走，使用感測器避免碰撞。', 'Follow walls, use sensors to avoid crashes.'],
    maxBlocks: 12, timeLimit: 150, optimalBlocks: 6,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
  },
  {
    id: 10, name: '雙重障礙', gridSize: [12, 8], cellSize: 60,
    start: { x: 1, y: 4, heading: 0 },
    goal: { x: 10, y: 4 },
    walls: [
      { x1: 0, y1: 0, x2: 12, y2: 0 }, { x1: 0, y1: 8, x2: 12, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 12, y1: 0, x2: 12, y2: 8 },
      { x1: 4, y1: 0, x2: 4, y2: 4 }, { x1: 8, y1: 4, x2: 8, y2: 8 },
    ],
    hints: ['需要偵測多個方向的障礙物。', 'Detect obstacles from multiple directions.'],
    maxBlocks: 15, timeLimit: 150, optimalBlocks: 8,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
  },
  {
    id: 11, name: '螺旋之路', gridSize: [12, 12], cellSize: 60,
    start: { x: 6, y: 6, heading: 0 },
    goal: { x: 1, y: 1 },
    walls: [
      { x1: 0, y1: 0, x2: 12, y2: 0 }, { x1: 0, y1: 12, x2: 12, y2: 12 },
      { x1: 0, y1: 0, x2: 0, y2: 12 }, { x1: 12, y1: 0, x2: 12, y2: 12 },
      { x1: 3, y1: 3, x2: 9, y2: 3 }, { x1: 9, y1: 3, x2: 9, y2: 9 },
      { x1: 3, y1: 9, x2: 9, y2: 9 }, { x1: 3, y1: 3, x2: 3, y2: 9 },
    ],
    hints: ['每次前進多一點，畫出螺旋。', 'Go a bit further each time to draw a spiral.'],
    maxBlocks: 16, timeLimit: 180, optimalBlocks: 8,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
  },
  {
    id: 12, name: '十字路口', gridSize: [10, 10], cellSize: 60,
    start: { x: 1, y: 5, heading: 0 },
    goal: { x: 8, y: 2 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 10, y1: 0, x2: 10, y2: 10 },
      { x1: 5, y1: 2, x2: 5, y2: 8 },
    ],
    hints: ['使用「如果...否則」做決定。', 'Use "if...else" to make decisions.'],
    maxBlocks: 14, timeLimit: 180, optimalBlocks: 7,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle', 'if_else'],
  },
  {
    id: 13, name: '長城迷宮', gridSize: [14, 10], cellSize: 50,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 12, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 14, y2: 0 }, { x1: 0, y1: 10, x2: 14, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 14, y1: 0, x2: 14, y2: 10 },
      { x1: 3, y1: 0, x2: 3, y2: 7 }, { x1: 6, y1: 3, x2: 6, y2: 10 },
      { x1: 9, y1: 0, x2: 9, y2: 7 }, { x1: 11, y1: 3, x2: 11, y2: 10 },
    ],
    hints: ['保持冷靜，一步一步解決長迷宮。', 'Stay calm, solve the long maze step by step.'],
    maxBlocks: 20, timeLimit: 240, optimalBlocks: 10,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle', 'if_else'],
  },
  {
    id: 14, name: '黑暗迷宮', gridSize: [12, 10], cellSize: 50,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 10, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 12, y2: 0 }, { x1: 0, y1: 10, x2: 12, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 12, y1: 0, x2: 12, y2: 10 },
      { x1: 3, y1: 0, x2: 3, y2: 5 }, { x1: 6, y1: 5, x2: 6, y2: 10 },
      { x1: 9, y1: 0, x2: 9, y2: 7 },
    ],
    hints: ['視線受限，善用感測器。', 'Visibility is limited, use sensors wisely.'],
    maxBlocks: 22, timeLimit: 240, optimalBlocks: 11,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle', 'if_else'],
  },
  {
    id: 15, name: '終極挑戰', gridSize: [14, 12], cellSize: 50,
    start: { x: 1, y: 6, heading: 0 },
    goal: { x: 12, y: 6 },
    walls: [
      { x1: 0, y1: 0, x2: 14, y2: 0 }, { x1: 0, y1: 12, x2: 14, y2: 12 },
      { x1: 0, y1: 0, x2: 0, y2: 12 }, { x1: 14, y1: 0, x2: 14, y2: 12 },
      { x1: 3, y1: 2, x2: 3, y2: 10 }, { x1: 7, y1: 0, x2: 7, y2: 5 },
      { x1: 7, y1: 7, x2: 7, y2: 12 }, { x1: 10, y1: 3, x2: 10, y2: 9 },
      { x1: 5, y1: 5, x2: 7, y2: 5 }, { x1: 5, y1: 7, x2: 7, y2: 7 },
    ],
    hints: ['運用所有學到的技巧！', 'Use everything you learned!'],
    maxBlocks: 25, timeLimit: 300, optimalBlocks: 12,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle', 'if_else'],
  },
];

export const SECRET_LEVELS: SecretLevelData[] = [
  {
    id: 101, name: '彩虹迷宮', gridSize: [10, 10], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 8, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 10, y1: 0, x2: 10, y2: 10 },
      { x1: 3, y1: 2, x2: 3, y2: 8 }, { x1: 6, y1: 2, x2: 6, y2: 8 },
      { x1: 3, y1: 5, x2: 6, y2: 5 },
    ],
    hints: ['秘密關卡：色彩繽紛的挑戰！', 'Secret: A colorful challenge!'],
    maxBlocks: 15, timeLimit: 120, optimalBlocks: 8,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
    difficulty: 'Medium', basePoints: 550,
  },
  {
    id: 102, name: '速度挑戰', gridSize: [8, 8], cellSize: 60,
    start: { x: 1, y: 4, heading: 0 },
    goal: { x: 6, y: 4 },
    walls: [
      { x1: 0, y1: 0, x2: 8, y2: 0 }, { x1: 0, y1: 8, x2: 8, y2: 8 },
      { x1: 0, y1: 0, x2: 0, y2: 8 }, { x1: 8, y1: 0, x2: 8, y2: 8 },
      { x1: 4, y1: 2, x2: 4, y2: 6 },
    ],
    hints: ['秘密關卡：在時間內完成！', 'Secret: Complete within the time limit!'],
    maxBlocks: 10, timeLimit: 30, optimalBlocks: 5,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
    difficulty: 'Hard', basePoints: 800,
  },
  {
    id: 103, name: '鑽石收集', gridSize: [10, 10], cellSize: 60,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 8, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 10, y1: 0, x2: 10, y2: 10 },
      { x1: 4, y1: 0, x2: 4, y2: 4 }, { x1: 4, y1: 6, x2: 4, y2: 10 },
      { x1: 7, y1: 3, x2: 7, y2: 7 },
    ],
    hints: ['秘密關卡：收集所有鑽石！', 'Secret: Collect all diamonds!'],
    maxBlocks: 18, timeLimit: 150, optimalBlocks: 10,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
    difficulty: 'Medium', basePoints: 600,
  },
  {
    id: 104, name: '幽靈迷宮', gridSize: [12, 10], cellSize: 50,
    start: { x: 1, y: 1, heading: 0 },
    goal: { x: 10, y: 8 },
    walls: [
      { x1: 0, y1: 0, x2: 12, y2: 0 }, { x1: 0, y1: 10, x2: 12, y2: 10 },
      { x1: 0, y1: 0, x2: 0, y2: 10 }, { x1: 12, y1: 0, x2: 12, y2: 10 },
      { x1: 3, y1: 0, x2: 3, y2: 7 }, { x1: 6, y1: 3, x2: 6, y2: 10 },
      { x1: 9, y1: 0, x2: 9, y2: 7 }, { x1: 7, y1: 5, x2: 9, y2: 5 },
    ],
    hints: ['秘密關卡：小心幽靈！', 'Secret: Watch out for ghosts!'],
    maxBlocks: 20, timeLimit: 180, optimalBlocks: 10,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle', 'if_else'],
    difficulty: 'Hard', basePoints: 750,
  },
  {
    id: 105, name: '無限螺旋', gridSize: [12, 12], cellSize: 50,
    start: { x: 6, y: 6, heading: 0 },
    goal: { x: 1, y: 1 },
    walls: [
      { x1: 0, y1: 0, x2: 12, y2: 0 }, { x1: 0, y1: 12, x2: 12, y2: 12 },
      { x1: 0, y1: 0, x2: 0, y2: 12 }, { x1: 12, y1: 0, x2: 12, y2: 12 },
      { x1: 3, y1: 3, x2: 9, y2: 3 }, { x1: 9, y1: 3, x2: 9, y2: 9 },
      { x1: 3, y1: 9, x2: 9, y2: 9 }, { x1: 3, y1: 3, x2: 3, y2: 9 },
    ],
    hints: ['秘密關卡：無盡的螺旋！', 'Secret: An endless spiral!'],
    maxBlocks: 18, timeLimit: 180, optimalBlocks: 9,
    availableBlocks: ['move_forward', 'turn_left', 'turn_right', 'repeat', 'ultrasonic', 'if_obstacle'],
    difficulty: 'Medium', basePoints: 700,
  },
];

export function getLevel(id: number): LevelData | undefined {
  return LEVELS.find((l) => l.id === id) || SECRET_LEVELS.find((l) => l.id === id);
}

export function getPoints(levelId: number, stars: number, blocksUsed: number): number {
  const level = getLevel(levelId);
  if (!level) return 0;
  const base = 100 + (levelId * 25);
  const optimalBonus = blocksUsed <= level.optimalBlocks ? 50 : 0;
  const starBonus = stars === 3 ? 100 : 0;
  const isSecret = levelId >= 100;
  const total = base + optimalBonus + starBonus;
  return isSecret ? total * 2 : total;
}
