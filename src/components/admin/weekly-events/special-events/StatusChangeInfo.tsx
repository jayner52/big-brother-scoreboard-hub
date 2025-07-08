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
  const hasStatusChangeEvents = specialEvents.some(e => 
    ['self_evicted', 'removed_production', 'came_back_evicted'].includes(e.eventType)
  );

  if (!hasStatusChangeEvents) return null;

  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <p className="font-medium text-yellow-800 mb-1">⚠️ Status Change Events</p>
      <ul className="text-yellow-700 space-y-1">
        {specialEvents.filter(e => e.eventType === 'self_evicted' || e.eventType === 'removed_production').length > 0 && (
          <li>• Self-evicted/Removed contestants will have their status changed to evicted and lose survival points for this week</li>
        )}
        {specialEvents.filter(e => e.eventType === 'came_back_evicted').length > 0 && (
          <li>• Contestants who came back will have their status reactivated</li>
        )}
      </ul>
    </div>
  );
};