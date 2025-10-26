'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileCheck, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OutputNodeData {
  label: string;
  outputId: string;
  outputType: string;
  content: any;
}

function OutputNode({ data }: NodeProps<{ data: OutputNodeData }>) {
  const nodeData = data as OutputNodeData;
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="bg-purple-500! w-3! h-3!"
      />
      <Card className="min-w-[200px] border-2 border-purple-500/50 bg-purple-500/5 hover:shadow-lg transition-shadow">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-purple-600">
            <FileCheck className="h-5 w-5" />
            <div className="font-semibold text-sm">{nodeData.label}</div>
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {nodeData.outputType} Generated
          </div>
          <Button variant="ghost" size="sm" className="w-full">
            <Download className="mr-2 h-3 w-3" />
            Export
          </Button>
        </div>
      </Card>
    </>
  );
}

export default memo(OutputNode);
