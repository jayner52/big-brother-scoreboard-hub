
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { FeedbackFormModal } from './FeedbackFormModal';
import { FeedbackFormHeader } from './FeedbackFormHeader';
import { FeedbackFormFields } from './FeedbackFormFields';
import { FeedbackFormActions } from './FeedbackFormActions';
import { useFeedbackSubmit } from '@/hooks/useFeedbackSubmit';

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
  };

  return (
    <FeedbackFormModal>
      <FeedbackFormHeader type={type} onClose={onClose} />
      <CardContent>
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
      </CardContent>
    </FeedbackFormModal>
  );
};
