'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Video, FileType } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileNodeData {
  label: string;
  fileId: string;
  url: string;
  mimeType?: string;
}

interface FileNodeProps {
  data: FileNodeData;
}

function FileNode({ data }: FileNodeProps) {
  
  const getFileIcon = () => {
    if (!data.mimeType) return <FileText className="h-5 w-5" />;
    if (data.mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (data.mimeType.includes('pdf')) return <FileType className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <Card className="min-w-[200px] border-2 border-primary/50 bg-primary/5 hover:shadow-lg transition-shadow">
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          {getFileIcon()}
          <div className="font-semibold text-sm truncate">{data.label}</div>
        </div>
        <div className="text-xs text-muted-foreground">Source File</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !w-3 !h-3"
      />
    </Card>
  );
}

export default memo(FileNode);
