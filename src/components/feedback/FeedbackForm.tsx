
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { FeedbackFormFields } from './FeedbackFormFields';
import { FeedbackFormActions } from './FeedbackFormActions';
import { useFeedbackSubmit } from '@/hooks/useFeedbackSubmit';
import { getFormTitle, getFormDescription } from './feedbackFormConfig';

interface FeedbackFormProps {
  type: 'bug' | 'feature' | 'comment';
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ type, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [bugLocation, setBugLocation] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  const { submitFeedback, isSubmitting } = useFeedbackSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback form submission started:', { type, title, description, bugLocation, priority, userName, userEmail });
    
    try {
      await submitFeedback(
        type,
        title,
        description,
        bugLocation,
        priority,
        userName,
        userEmail,
        onClose
      );
      console.log('Feedback form submission completed successfully');
    } catch (error) {
      console.error('Feedback form submission failed:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getFormTitle(type)}</DialogTitle>
          <DialogDescription>{getFormDescription(type)}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FeedbackFormFields
            type={type}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            priority={priority}
            setPriority={setPriority}
            bugLocation={bugLocation}
            setBugLocation={setBugLocation}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
          />
          <FeedbackFormActions isSubmitting={isSubmitting} onClose={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
};
