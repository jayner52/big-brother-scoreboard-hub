import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { siteLocations } from './feedbackFormConfig';

interface FeedbackFormFieldsProps {
  type: 'bug' | 'feature' | 'comment';
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: 'low' | 'medium' | 'high';
  setPriority: (value: 'low' | 'medium' | 'high') => void;
  bugLocation: string;
  setBugLocation: (value: string) => void;
  userName: string;
  setUserName: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
}

export const FeedbackFormFields: React.FC<FeedbackFormFieldsProps> = ({
  type,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  bugLocation,
  setBugLocation,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title *
        </label>
        <Input
          id="title"
          placeholder={`Brief ${type} title...`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {type === 'bug' && (
        <div className="space-y-2">
          <label htmlFor="bugLocation" className="text-sm font-medium">
            Where on the site did this occur? *
          </label>
          <Select value={bugLocation} onValueChange={setBugLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select page/section..." />
            </SelectTrigger>
            <SelectContent>
              {siteLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description *
        </label>
        <Textarea
          id="description"
          placeholder={`Describe the ${type} in detail...`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      {type === 'bug' && (
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="userName" className="text-sm font-medium">
            Your Name
          </label>
          <Input
            id="userName"
            placeholder="Your name (optional)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="userEmail" className="text-sm font-medium">
            Your Email
          </label>
          <Input
            id="userEmail"
            type="email"
            placeholder="your@email.com (optional)"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};