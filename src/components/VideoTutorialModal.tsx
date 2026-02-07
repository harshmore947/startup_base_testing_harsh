import { useState } from "react";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  toolName: string;
  onDontShowAgain?: () => void;
}

export function VideoTutorialModal({
  isOpen,
  onClose,
  videoId,
  toolName,
  onDontShowAgain,
}: VideoTutorialModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain && onDontShowAgain) {
      onDontShowAgain();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            📺 Quick Tutorial: How to Use This Tool
          </DialogTitle>
          <DialogDescription className="text-base">
            Watch this 3-minute guide to get the best results
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            title={`${toolName} tutorial video`}
          />
        </div>

        <DialogFooter className="p-6 pt-4 flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dont-show"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Don't show this again
            </label>
          </div>
          <Button onClick={handleClose} size="lg" className="w-full sm:w-auto">
            Got it, let's build! 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
