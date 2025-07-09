import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFeedbackSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (
    type: 'bug' | 'feature' | 'comment',
    title: string,
    description: string,
    bugLocation: string,
    priority: 'low' | 'medium' | 'high',
    userName: string,
    userEmail: string,
    onClose: () => void
  ) => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    if (type === 'bug' && !bugLocation) {
      toast({
        title: "Location required",
        description: "Please specify where on the site the bug occurred",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare the description with bug location if it's a bug report
      let finalDescription = description.trim();
      if (type === 'bug' && bugLocation) {
        finalDescription = `Location: ${bugLocation}\n\n${finalDescription}`;
      }

      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id || null,
          user_email: userEmail || user?.email || null,
          user_name: userName || user?.user_metadata?.display_name || null,
          feedback_type: type,
          title: title.trim(),
          description: finalDescription,
          priority,
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFeedback, isSubmitting };
};