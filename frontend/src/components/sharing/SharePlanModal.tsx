import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SpinnerGap, PaperPlaneTilt } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { sharePlan } from '@/api/functions';

type SharePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  analysisData: Record<string, unknown>;
};

export default function SharePlanModal({ isOpen, onClose, analysisData }: SharePlanModalProps) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleShare(): Promise<void> {
        if (!email) {
            toast.error('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await sharePlan({
                to_email: email,
                planDetails: analysisData,
                customMessage: message,
            });
            toast.success('Event plan shared successfully!');
            onClose();
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error('Failed to share plan:', error);
            toast.error('Failed to share the plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share Event Plan</DialogTitle>
                    <DialogDescription>
                        Send a summary of the AI-generated event plan to a client or team member.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        id="email"
                        type="email"
                        placeholder="Recipient's Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Textarea
                        id="message"
                        placeholder="Add an optional message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleShare} disabled={loading}>
                        {loading ? (
                            <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <PaperPlaneTilt className="mr-2 h-4 w-4" />
                        )}
                        Send Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}