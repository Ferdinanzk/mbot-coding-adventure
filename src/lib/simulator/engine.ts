export interface Pose {
  x: number;
  y: number;
  theta: number; // radians, 0 = right
}

export interface RobotState {
  pose: Pose;
  motorL: number;
  motorR: number;
  vL: number;
  vR: number;
  speed: number;
  turnSpeed: number;
}

export interface Wall {
  x1: number; y1: number; x2: number; y2: number;
}

export interface Command {
  action: string;
  params: Record<string, any>;
  blockId?: string;
}

export class Kinematics {
  trackWidth = 24;
  wheelRadius = 6;
  maxSpeed = 60;

  pwmToOmega(pwm: number): number {
    const maxOmega = this.maxSpeed / this.wheelRadius;
    return (pwm / 255) * maxOmega;
  }

  updatePose(pose: Pose, vL: number, vR: number, dt: number): void {
    const avgV = (vL + vR) / 2;
    const diff = vR - vL;

    if (Math.abs(diff) < 0.001) {
      pose.x += avgV * Math.cos(pose.theta) * dt;
      pose.y += avgV * Math.sin(pose.theta) * dt;
    } else {
      const R = (this.trackWidth / 2) * (vL + vR) / diff;
      const iccX = pose.x - R * Math.sin(pose.theta);
      const iccY = pose.y + R * Math.cos(pose.theta);
      const omega = diff / this.trackWidth;

      pose.x = iccX + R * Math.sin(pose.theta + omega * dt);
      pose.y = iccY - R * Math.cos(pose.theta + omega * dt);
      pose.theta += omega * dt;
    }

    pose.theta = Math.atan2(Math.sin(pose.theta), Math.cos(pose.theta));
  }

  computeWheelSpeeds(linear: number, angular: number): { vL: number; vR: number } {
    return {
      vL: linear - (angular * this.trackWidth) / 2,
      vR: linear + (angular * this.trackWidth) / 2,
    };
  }
}

export class CollisionEngine {
  halfW: number;
  halfH: number;

  constructor(robotWidth: number, robotHeight: number) {
    this.halfW = robotWidth / 2;
    this.halfH = robotHeight / 2;
  }

  getAABB(pose: Pose) {
    const cos = Math.cos(pose.theta);
    const sin = Math.sin(pose.theta);
    const corners = [
      { x: this.halfW, y: this.halfH },
      { x: this.halfW, y: -this.halfH },
      { x: -this.halfW, y: -this.halfH },
      { x: -this.halfW, y: this.halfH },
    ].map((p) => ({
      x: pose.x + p.x * cos - p.y * sin,
      y: pose.y + p.x * sin + p.y * cos,
    }));

    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    return {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
    };
  }

  lineIntersectsAABB(x1: number, y1: number, x2: number, y2: number, aabb: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const dx = x2 - x1, dy = y2 - y1;
    const p = [-dx, dx, -dy, dy];
    const q = [x1 - aabb.minX, aabb.maxX - x1, y1 - aabb.minY, aabb.maxY - y1];

    let u1 = 0, u2 = 1;
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return false;
      } else {
        const t = q[i] / p[i];
        if (p[i] < 0) u1 = Math.max(u1, t);
        else u2 = Math.min(u2, t);
      }
    }
    return u1 <= u2;
  }

  checkCollision(pose: Pose, walls: Wall[]): Wall | null {
    const aabb = this.getAABB(pose);
    for (const w of walls) {
      if (this.lineIntersectsAABB(w.x1, w.y1, w.x2, w.y2, aabb)) return w;
    }
    return null;
  }

  isInGoal(pose: Pose, goal: { x: number; y: number }, cellSize: number): boolean {
    const gs = cellSize * 0.8;
    const gx = goal.x * cellSize + (cellSize - gs) / 2;
    const gy = goal.y * cellSize + (cellSize - gs) / 2;
    return pose.x >= gx && pose.x <= gx + gs && pose.y >= gy && pose.y <= gy + gs;
  }
}

export class SensorSystem {
  raySegmentIntersect(rx: number, ry: number, rxe: number, rye: number, x1: number, y1: number, x2: number, y2: number) {
    const r_dx = rxe - rx, r_dy = rye - ry;
    const s_dx = x2 - x1, s_dy = y2 - y1;
    const denom = r_dx * s_dy - r_dy * s_dx;
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - rx) * s_dy - (y1 - ry) * s_dx) / denom;
    const u = ((x1 - rx) * r_dy - (y1 - ry) * r_dx) / denom;

    if (t >= 0 && u >= 0 && u <= 1) {
      return {
        distance: t * Math.sqrt(r_dx * r_dx + r_dy * r_dy),
        point: { x: rx + t * r_dx, y: ry + t * r_dy },
      };
    }
    return null;
  }

  readUltrasonic(pose: Pose, walls: Wall[]): number {
    const sensorX = pose.x + 14 * Math.cos(pose.theta);
    const sensorY = pose.y + 14 * Math.sin(pose.theta);
    const maxRange = 400;

    let minDist = maxRange;
    for (const w of walls) {
      const hit = this.raySegmentIntersect(
        sensorX, sensorY,
        sensorX + maxRange * Math.cos(pose.theta),
        sensorY + maxRange * Math.sin(pose.theta),
        w.x1, w.y1, w.x2, w.y2
      );
      if (hit && hit.distance < minDist) minDist = hit.distance;
    }
    return Math.round(minDist / 2);
  }

  readLineFollower(pose: Pose, groundLines: Wall[] | undefined): [number, number] {
    const offset = 3.2;
    const cos = Math.cos(pose.theta);
    const sin = Math.sin(pose.theta);

    const sensors = [
      { x: pose.x + (8 * cos - offset * sin), y: pose.y + (8 * sin + offset * cos) },
      { x: pose.x + (8 * cos + offset * sin), y: pose.y + (8 * sin - offset * cos) },
    ];

    return sensors.map((s) => {
      for (const line of groundLines || []) {
        const dist = this.pointToSegmentDist(s.x, s.y, line.x1, line.y1, line.x2, line.y2);
        if (dist < 2) return 1;
      }
      return 0;
    }) as [number, number];
  }

  pointToSegmentDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1, dy = y2 - y1;
    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
}

export class CommandProcessor {
  robot: RobotState;
  kinematics: Kinematics;
  currentCommand: Command | null = null;
  commandProgress: any = null;
  onComplete?: () => void;

  constructor(robot: RobotState, kinematics: Kinematics) {
    this.robot = robot;
    this.kinematics = kinematics;
  }

  startCommand(cmd: Command, onComplete?: () => void) {
    this.currentCommand = cmd;
    this.commandProgress = null;
    this.onComplete = onComplete;

    switch (cmd.action) {
      case 'forward': {
        const dist = (cmd.params.distance || 0) * 6;
        this.commandProgress = { target: dist, accumulated: 0, dir: 1 };
        this.robot.motorL = this.robot.speed * 1;
        this.robot.motorR = this.robot.speed * 1;
        break;
      }
      case 'backward': {
        const dist = (cmd.params.distance || 0) * 6;
        this.commandProgress = { target: dist, accumulated: 0, dir: -1 };
        this.robot.motorL = -this.robot.speed * 1;
        this.robot.motorR = -this.robot.speed * 1;
        break;
      }
      case 'turn_left': {
        const rad = ((cmd.params.degrees || 0) * Math.PI) / 180;
        this.commandProgress = { target: rad, accumulated: 0, dir: -1 };
        this.robot.motorL = -this.robot.turnSpeed;
        this.robot.motorR = this.robot.turnSpeed;
        break;
      }
      case 'turn_right': {
        const rad = ((cmd.params.degrees || 0) * Math.PI) / 180;
        this.commandProgress = { target: rad, accumulated: 0, dir: 1 };
        this.robot.motorL = this.robot.turnSpeed;
        this.robot.motorR = -this.robot.turnSpeed;
        break;
      }
      case 'wait': {
        this.commandProgress = { targetMs: (cmd.params.seconds || 0) * 1000, started: performance.now() };
        this.robot.motorL = 0;
        this.robot.motorR = 0;
        break;
      }
      case 'set_motor': {
        const pwm = cmd.params.speed || 0;
        if (cmd.params.motor === 'LEFT') this.robot.motorL = pwm;
        else if (cmd.params.motor === 'RIGHT') this.robot.motorR = pwm;
        else { this.robot.motorL = pwm; this.robot.motorR = pwm; }
        this.finishCommand();
        return;
      }
      case 'stop': {
        this.robot.motorL = 0;
        this.robot.motorR = 0;
        this.finishCommand();
        return;
      }
      default:
        this.finishCommand();
    }

    // Update wheel speeds after setting motors
    this.robot.vL = this.kinematics.pwmToOmega(this.robot.motorL) * this.kinematics.wheelRadius;
    this.robot.vR = this.kinematics.pwmToOmega(this.robot.motorR) * this.kinematics.wheelRadius;
  }

  update(dt: number) {
    if (!this.currentCommand) return;
    const prog = this.commandProgress;

    switch (this.currentCommand.action) {
      case 'forward':
      case 'backward': {
        const speed = Math.abs(this.robot.vL);
        prog.accumulated += speed * dt;
        if (prog.accumulated >= prog.target) {
          this.robot.motorL = 0;
          this.robot.motorR = 0;
          this.robot.vL = 0;
          this.robot.vR = 0;
          this.finishCommand();
        }
        break;
      }
      case 'turn_left':
      case 'turn_right': {
        const omega = Math.abs(this.robot.vR - this.robot.vL) / this.kinematics.trackWidth;
        prog.accumulated += omega * dt;
        if (prog.accumulated >= prog.target) {
          this.robot.motorL = 0;
          this.robot.motorR = 0;
          this.robot.vL = 0;
          this.robot.vR = 0;
          this.finishCommand();
        }
        break;
      }
      case 'wait': {
        if (performance.now() - prog.started >= prog.targetMs) {
          this.finishCommand();
        }
        break;
      }
    }
  }

  finishCommand() {
    const cb = this.onComplete;
    this.currentCommand = null;
    this.commandProgress = null;
    cb?.();
  }

  stop() {
    this.currentCommand = null;
    this.commandProgress = null;
    this.robot.motorL = 0;
    this.robot.motorR = 0;
    this.robot.vL = 0;
    this.robot.vR = 0;
  }
}
