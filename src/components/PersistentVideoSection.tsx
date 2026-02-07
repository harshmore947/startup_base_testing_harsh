import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PersistentVideoSectionProps {
  videoId: string;
  toolName: string;
}

export function PersistentVideoSection({
  videoId,
  toolName,
}: PersistentVideoSectionProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            🎥 Video Guide
          </h3>
        </div>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            title={`${toolName} tutorial video`}
          />
        </div>

        <p className="text-sm text-blue-700 dark:text-blue-300">
          First time here? Watch this quick tutorial to maximize your results
        </p>
      </CardContent>
    </Card>
  );
}
