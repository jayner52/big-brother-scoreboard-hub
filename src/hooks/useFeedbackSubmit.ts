
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
    console.log('Starting feedback submission with data:', {
      type, title, description, bugLocation, priority, userName, userEmail
    });

    if (!title.trim() || !description.trim()) {
      console.error('Validation failed: Missing title or description');
      toast({
        title: "Required fields missing",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    if (type === 'bug' && !bugLocation.trim()) {
      console.error('Validation failed: Missing bug location for bug report');
      toast({
        title: "Location required",
        description: "Please specify where on the site the bug occurred",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }

      console.log('Current user:', user?.id);

      // Prepare the description with bug location if it's a bug report
      let finalDescription = description.trim();
      if (type === 'bug' && bugLocation.trim()) {
        finalDescription = `Location: ${bugLocation.trim()}\n\n${finalDescription}`;
      }

      const feedbackData = {
        user_id: user?.id || null,
        user_email: userEmail.trim() || user?.email || null,
        user_name: userName.trim() || user?.user_metadata?.display_name || null,
        feedback_type: type,
        title: title.trim(),
        description: finalDescription,
        priority,
      };

      console.log('Inserting feedback with data:', feedbackData);

      const { data, error } = await supabase
        .from('user_feedback')
        .insert(feedbackData)
        .select();

      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }

      console.log('Feedback inserted successfully:', data);

      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // More specific error messages
      let errorMessage = "Please try again later";
      if (error?.message?.includes('violates row-level security')) {
        errorMessage = "Authentication required. Please sign in and try again.";
      } else if (error?.message?.includes('not null violation')) {
        errorMessage = "Missing required information. Please fill all required fields.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error submitting feedback",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFeedback, isSubmitting };
};
