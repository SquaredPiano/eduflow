import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { 
  FileText, 
  Brain,
  HelpCircle,
  Presentation,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// EDUCATION-ONLY TYPES (no youpac-ai types)
export interface AgentNodeData {
  type: "notes" | "flashcards" | "quiz" | "slides";
  draft: string;
  label?: string;
  status: "idle" | "generating" | "ready" | "error";
  connections: string[];
  generationProgress?: {
    stage: string;
    percent: number;
  };
}

// Education agent configuration
const agentConfig = {
  notes: {
    icon: FileText,
    label: "Notes Generator",
    description: "Comprehensive study notes",
    color: "green",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
  },
  flashcards: {
    icon: Brain,
    label: "Flashcards Creator",
    description: "Spaced-repetition cards",
    color: "green",
    gradient: "from-green-500/20 to-teal-500/20",
    iconColor: "text-green-600",
  },
  quiz: {
    icon: HelpCircle,
    label: "Quiz Generator",
    description: "Practice questions",
    color: "green",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-600",
  },
  slides: {
    icon: Presentation,
    label: "Slides Extractor",
    description: "Key presentation points",
    color: "green",
    gradient: "from-teal-500/20 to-green-500/20",
    iconColor: "text-teal-600",
  },
};

interface ExtendedNodeProps {
  data: AgentNodeData & {
    onGenerate?: () => void;
    onChat?: () => void;
    onView?: () => void;
    onRegenerate?: () => void;
  };
  selected?: boolean;
  id: string;
  dragging?: boolean;
}

export const AgentNode = memo(({ data, selected, id, dragging }: ExtendedNodeProps) => {
  const config = agentConfig[data.type];
  const Icon = config.icon;

  const statusIcons = {
    idle: null,
    generating: <Loader2 className="h-4 w-4 animate-spin" />,
    ready: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div 
      className={`relative group ${selected ? "scale-105" : ""} transition-transform duration-200`}
      style={{ opacity: dragging ? 0.5 : 1 }} // Fix drag opacity
    >
      {/* Glow effect when selected */}
      {selected && (
        <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-2xl blur-lg animate-pulse`} />
      )}
      
      <Card className={`relative w-72 p-5 border-muted/50 shadow-xl bg-gradient-to-b from-background to-background/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${selected ? "border-green-500/50 ring-2 ring-green-500/20" : ""}`}>
        <Handle
          type="target"
          position={Position.Left}
          id="agent-input"
          className={`!w-3 !h-3 !bg-gradient-to-r ${config.gradient} !border-2 !border-background`}
          style={{ top: '50%' }}
        />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} backdrop-blur-sm`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{data.label || config.label}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {data.status !== "idle" && statusIcons[data.status]}
          </div>
        </div>
      
        {/* Show progress when generating */}
        {data.status === "generating" && data.generationProgress && (
          <div className="mb-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{data.generationProgress.stage}</p>
                  <p className="text-xs text-green-600">Generating content...</p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-500"
                  style={{ width: `${data.generationProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      
        {/* Content preview */}
        {data.status !== "generating" && data.draft ? (
          <div className="mb-4 cursor-pointer group/content" onClick={data.onView}>
            <div className="rounded-lg bg-muted/50 p-4 border border-border/50 transition-all duration-200 hover:bg-muted/70 hover:border-green-500/50">
              <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                {data.draft}
              </p>
            </div>
          </div>
        ) : data.status !== "generating" && (
          <div className="mb-4">
            <div className="rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 p-8 border border-dashed border-muted-foreground/20">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No content yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Click Generate
                </p>
              </div>
            </div>
          </div>
        )}
      
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 hover:bg-green-50 hover:border-green-500/50 hover:text-green-700 transition-all"
            onClick={data.onChat}
            disabled={data.status === "generating"}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Chat
          </Button>
          {data.status === "ready" && data.draft ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 hover:bg-green-50 hover:border-green-500/50 hover:text-green-700 transition-all"
              onClick={data.onRegenerate}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Regenerate
            </Button>
          ) : (
            <Button 
              size="sm" 
              className={`flex-1 bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-all text-foreground font-medium shadow-sm border border-green-500/20`}
              onClick={data.onGenerate}
              disabled={data.status === "generating"}
            >
              {data.status === "generating" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generate
                </>
              )}
            </Button>
          )}
        </div>
      
        <Handle
          type="source"
          position={Position.Right}
          id="agent-output"
          className={`!w-3 !h-3 !bg-gradient-to-r ${config.gradient} !border-2 !border-background`}
          style={{ top: '50%' }}
        />
      </Card>
    </div>
  );
});

AgentNode.displayName = "AgentNode";
