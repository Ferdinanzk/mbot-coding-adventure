// Custom Blockly blocks for mBot Coding Adventure
// Loaded after Blockly is available on window

export function defineCustomBlocks(Blockly: any) {
  const blocks = Blockly.Blocks;

  // Move Forward
  blocks['move_forward'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('前進')
        .appendField(new Blockly.FieldNumber(10, 1, 100), 'DISTANCE')
        .appendField('公分');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
      this.setTooltip('讓機器人前進指定的距離');
    },
  };

  // Move Backward
  blocks['move_backward'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('後退')
        .appendField(new Blockly.FieldNumber(10, 1, 100), 'DISTANCE')
        .appendField('公分');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(160);
      this.setTooltip('讓機器人後退指定的距離');
    },
  };

  // Turn Left
  blocks['turn_left'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('向左轉')
        .appendField(new Blockly.FieldNumber(90, 1, 360), 'DEGREES')
        .appendField('度');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(200);
      this.setTooltip('讓機器人向左轉指定的角度');
    },
  };

  // Turn Right
  blocks['turn_right'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('向右轉')
        .appendField(new Blockly.FieldNumber(90, 1, 360), 'DEGREES')
        .appendField('度');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(200);
      this.setTooltip('讓機器人向右轉指定的角度');
    },
  };

  // Stop Motors
  blocks['stop_motors'] = {
    init: function() {
      this.appendDummyInput().appendField('停止馬達');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(0);
      this.setTooltip('停止機器人的馬達');
    },
  };

  // Wait
  blocks['wait'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('等待')
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECONDS')
        .appendField('秒');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(60);
      this.setTooltip('等待指定的時間');
    },
  };

  // Repeat
  blocks['repeat'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('重複')
        .appendField(new Blockly.FieldNumber(2, 1, 20), 'TIMES')
        .appendField('次');
      this.appendStatementInput('DO').setCheck(null);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(120);
      this.setTooltip('重複執行內部的方塊');
    },
  };

  // If Obstacle
  blocks['if_obstacle'] = {
    init: function() {
      this.appendDummyInput().appendField('如果前方有障礙物');
      this.appendStatementInput('DO').setCheck(null);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(210);
      this.setTooltip('如果超音波感測器偵測到障礙物，執行內部的方塊');
    },
  };

  // If Else
  blocks['if_else'] = {
    init: function() {
      this.appendDummyInput().appendField('如果前方有障礙物');
      this.appendStatementInput('DO').setCheck(null).appendField('執行');
      this.appendStatementInput('ELSE').setCheck(null).appendField('否則');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour(210);
      this.setTooltip('根據感測器結果決定執行哪個分支');
    },
  };

  // Ultrasonic value block (expression)
  blocks['ultrasonic'] = {
    init: function() {
      this.appendDummyInput().appendField('超音波距離');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('取得超音波感測器的距離值 (公分)');
    },
  };
}

export type ProgramNode =
  | { type: 'command'; action: string; params: Record<string, any> }
  | { type: 'repeat'; times: number; body: ProgramNode[] }
  | { type: 'if_obstacle'; body: ProgramNode[] }
  | { type: 'if_else'; body: ProgramNode[]; elseBody: ProgramNode[] };

function serializeBlock(block: any): ProgramNode[] {
  const nodes: ProgramNode[] = [];
  while (block) {
    const type = block.type;
    switch (type) {
      case 'move_forward': {
        nodes.push({ type: 'command', action: 'forward', params: { distance: block.getFieldValue('DISTANCE') } });
        break;
      }
      case 'move_backward': {
        nodes.push({ type: 'command', action: 'backward', params: { distance: block.getFieldValue('DISTANCE') } });
        break;
      }
      case 'turn_left': {
        nodes.push({ type: 'command', action: 'turn_left', params: { degrees: block.getFieldValue('DEGREES') } });
        break;
      }
      case 'turn_right': {
        nodes.push({ type: 'command', action: 'turn_right', params: { degrees: block.getFieldValue('DEGREES') } });
        break;
      }
      case 'stop_motors': {
        nodes.push({ type: 'command', action: 'stop', params: {} });
        break;
      }
      case 'wait': {
        nodes.push({ type: 'command', action: 'wait', params: { seconds: block.getFieldValue('SECONDS') } });
        break;
      }
      case 'repeat': {
        const times = block.getFieldValue('TIMES');
        const doBlock = block.getInputTargetBlock('DO');
        const body = doBlock ? serializeBlock(doBlock) : [];
        nodes.push({ type: 'repeat', times, body });
        break;
      }
      case 'if_obstacle': {
        const doBlock = block.getInputTargetBlock('DO');
        const body = doBlock ? serializeBlock(doBlock) : [];
        nodes.push({ type: 'if_obstacle', body });
        break;
      }
      case 'if_else': {
        const doBlock = block.getInputTargetBlock('DO');
        const elseBlock = block.getInputTargetBlock('ELSE');
        const body = doBlock ? serializeBlock(doBlock) : [];
        const elseBody = elseBlock ? serializeBlock(elseBlock) : [];
        nodes.push({ type: 'if_else', body, elseBody });
        break;
      }
    }
    block = block.getNextBlock();
  }
  return nodes;
}

export function getProgramFromWorkspace(workspace: any): ProgramNode[] {
  if (!workspace) return [];
  const topBlocks = workspace.getTopBlocks(true);
  const all: ProgramNode[] = [];
  for (const block of topBlocks) {
    all.push(...serializeBlock(block));
  }
  return all;
}

export async function executeProgram(
  program: ProgramNode[],
  sendCommand: (cmd: { action: string; params: Record<string, any> }) => Promise<void>,
  checkObstacle: () => Promise<boolean>,
  isAborted: () => boolean
): Promise<void> {
  for (const node of program) {
    if (isAborted()) return;
    switch (node.type) {
      case 'command': {
        await sendCommand({ action: node.action, params: node.params });
        break;
      }
      case 'repeat': {
        for (let i = 0; i < node.times; i++) {
          if (isAborted()) return;
          await executeProgram(node.body, sendCommand, checkObstacle, isAborted);
        }
        break;
      }
      case 'if_obstacle': {
        const obstacle = await checkObstacle();
        if (obstacle) {
          await executeProgram(node.body, sendCommand, checkObstacle, isAborted);
        }
        break;
      }
      case 'if_else': {
        const obstacle = await checkObstacle();
        if (obstacle) {
          await executeProgram(node.body, sendCommand, checkObstacle, isAborted);
        } else {
          await executeProgram(node.elseBody, sendCommand, checkObstacle, isAborted);
        }
        break;
      }
    }
  }
}

export function countBlocks(workspace: any): number {
  if (!workspace) return 0;
  const topBlocks = workspace.getTopBlocks(true);
  let count = 0;
  const countRec = (block: any) => {
    count++;
    const children = block.getChildren(true);
    for (const child of children) countRec(child);
  };
  for (const b of topBlocks) countRec(b);
  return count;
}

export function getToolboxXml(availableBlocks: string[]): string {
  const allBlocks: Record<string, string> = {
    move_forward: `<block type="move_forward"><field name="DISTANCE">10</field></block>`,
    move_backward: `<block type="move_backward"><field name="DISTANCE">10</field></block>`,
    turn_left: `<block type="turn_left"><field name="DEGREES">90</field></block>`,
    turn_right: `<block type="turn_right"><field name="DEGREES">90</field></block>`,
    stop_motors: `<block type="stop_motors"></block>`,
    wait: `<block type="wait"><field name="SECONDS">1</field></block>`,
    repeat: `<block type="repeat"><field name="TIMES">2</field></block>`,
    if_obstacle: `<block type="if_obstacle"></block>`,
    if_else: `<block type="if_else"></block>`,
    ultrasonic: `<block type="ultrasonic"></block>`,
  };

  const categories: Record<string, string[]> = {
    motion: ['move_forward', 'move_backward', 'turn_left', 'turn_right', 'stop_motors'],
    control: ['wait', 'repeat', 'if_obstacle', 'if_else'],
    sensing: ['ultrasonic'],
  };

  let xml = `<xml xmlns="https://developers.google.com/blockly/xml">`;
  for (const [cat, blockIds] of Object.entries(categories)) {
    const filtered = blockIds.filter((id) => availableBlocks.includes(id));
    if (!filtered.length) continue;
    xml += `<category name="${cat === 'motion' ? '動作' : cat === 'control' ? '控制' : '感測'}">`;
    for (const id of filtered) {
      xml += allBlocks[id];
    }
    xml += `</category>`;
  }
  xml += `</xml>`;
  return xml;
}
