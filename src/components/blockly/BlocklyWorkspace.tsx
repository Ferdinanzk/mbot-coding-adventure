'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { defineCustomBlocks, getToolboxXml, getProgramFromWorkspace, countBlocks, type ProgramNode } from './custom-blocks';

export interface BlocklyWorkspaceRef {
  getProgram: () => ProgramNode[];
}

interface BlocklyWorkspaceProps {
  availableBlocks: string[];
  onChange?: () => void;
  blockCount?: (count: number) => void;
}

const BlocklyWorkspace = forwardRef<BlocklyWorkspaceRef, BlocklyWorkspaceProps>(
  ({ availableBlocks, onChange, blockCount }, ref) => {
    const blocklyDivRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<any>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      if ((window as any).Blockly) {
        initBlockly();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/blockly@10.4.3/blockly.min.js';
      script.onload = () => {
        initBlockly();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }, []);

    const initBlockly = () => {
      const Blockly = (window as any).Blockly;
      if (!Blockly || !blocklyDivRef.current) return;

      defineCustomBlocks(Blockly);

      const toolboxXml = getToolboxXml(availableBlocks);

      const workspace = Blockly.inject(blocklyDivRef.current, {
        toolbox: Blockly.utils.xml.textToDom(toolboxXml),
        grid: { spacing: 20, length: 3, colour: '#eee', snap: false },
        zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 2, minScale: 0.5 },
        trashcan: true,
      });

      workspaceRef.current = workspace;
      setLoaded(true);

      workspace.addChangeListener(() => {
        onChange?.();
        const c = countBlocks(workspace);
        blockCount?.(c);
      });
    };

    useImperativeHandle(ref, () => ({
      getProgram: () => getProgramFromWorkspace(workspaceRef.current),
    }));

    return (
      <div className="w-full h-full relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="text-4xl mb-2">🧩</div>
              <div className="text-gray-500">Loading Blockly...</div>
            </div>
          </div>
        )}
        <div ref={blocklyDivRef} className="w-full h-full" />
      </div>
    );
  }
);

BlocklyWorkspace.displayName = 'BlocklyWorkspace';

export default BlocklyWorkspace;
