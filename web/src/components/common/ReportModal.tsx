import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api, unwrap } from "@/lib/api";
import { toast } from "sonner";
import type { ReportReason } from "@/types/moderation";
import { Flag } from "lucide-react";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'spam', label: 'Spam' },
  { value: 'explicit_content', label: 'Explicit Content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' },
];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'post' | 'comment';
  targetId: string;
}

export const ReportModal = ({ open, onOpenChange, targetType, targetId }: ReportModalProps) => {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');

  const report = useMutation({
    mutationFn: () =>
      api.post('/moderation/reports', {
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      }).then(unwrap),
    onSuccess: () => {
      toast.success('Report filed. Our moderation team will review it.');
      setReason('');
      setDescription('');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to submit report. Please try again.'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report {targetType === 'post' ? 'Post' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Select a reason for reporting this {targetType}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Reason</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`px-3 py-2 rounded-lg text-sm border text-left transition ${
                    reason === r.value
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 font-medium'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="desc">Additional details (optional)</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any context that might help our moderators..."
              className="mt-2 min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!reason || report.isPending}
            onClick={() => report.mutate()}
            className="bg-red-500 hover:bg-red-600"
          >
            {report.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
