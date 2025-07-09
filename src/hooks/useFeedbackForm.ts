
import { useState } from 'react';

export type FeedbackType = 'bug' | 'feature' | 'comment';

export const useFeedbackForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');

  const openForm = (type: FeedbackType) => {
    setFeedbackType(type);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    feedbackType,
    openForm,
    closeForm,
  };
};
