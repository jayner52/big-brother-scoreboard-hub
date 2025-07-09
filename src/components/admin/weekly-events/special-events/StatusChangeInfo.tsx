import React from 'react';

type SpecialEventFormData = {
  id?: string;
  contestant: string;
  eventType: string;
  description?: string;
  customPoints?: number;
  customDescription?: string;
  customEmoji?: string;
};

interface StatusChangeInfoProps {
  specialEvents: SpecialEventFormData[];
}

export const StatusChangeInfo: React.FC<StatusChangeInfoProps> = ({ specialEvents }) => {
  const statusChangeEvents = specialEvents.filter(e => 
    ['self_evicted', 'removed_production', 'came_back_evicted'].includes(e.eventType)
  );
  
  const evictionEvents = statusChangeEvents.filter(e => 
    e.eventType === 'self_evicted' || e.eventType === 'removed_production'
  );
  
  const revivalEvents = statusChangeEvents.filter(e => 
    e.eventType === 'came_back_evicted'
  );

  if (statusChangeEvents.length === 0) return null;

  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <p className="font-medium text-yellow-800 mb-1">⚠️ Master Status Changes</p>
      <ul className="text-yellow-700 space-y-1">
        {evictionEvents.length > 0 && (
          <li>
            • <strong>{evictionEvents.length} contestant(s)</strong> will be marked as evicted in the master status 
            ({evictionEvents.map(e => e.contestant).filter(Boolean).join(', ')})
          </li>
        )}
        {revivalEvents.length > 0 && (
          <li>
            • <strong>{revivalEvents.length} contestant(s)</strong> will be reactivated in the master status
            ({revivalEvents.map(e => e.contestant).filter(Boolean).join(', ')})
          </li>
        )}
        <li className="text-xs italic">
          These changes will sync across all pages (Bio, Leaderboard, Points Preview)
        </li>
      </ul>
    </div>
  );
};