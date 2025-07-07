import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';
import { Pool } from '@/types/pool';

interface DynamicCountdownProps {
  pool: Pool | null;
  className?: string;
}

interface CountdownData {
  label: string;
  target?: Date;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const DynamicCountdown: React.FC<DynamicCountdownProps> = ({ pool, className = "" }) => {
  const [countdownData, setCountdownData] = useState<CountdownData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const determineCountdown = (): CountdownData | null => {
      if (!pool) return null;
      
      const now = new Date();
      
      // Priority 1: Draft deadline (if draft is open and deadline exists)
      if (pool.draft_open && pool.registration_deadline) {
        const deadline = new Date(pool.registration_deadline);
        if (deadline > now) {
          return {
            label: "Draft Closes In",
            target: deadline,
            icon: Users,
            color: "bg-orange-100 text-orange-700"
          };
        }
      }
      
      // Priority 2: Registration deadline passed but draft still open
      if (pool.draft_open && pool.registration_deadline) {
        const deadline = new Date(pool.registration_deadline);
        if (deadline <= now) {
          return {
            label: "Draft Deadline",
            value: "Passed",
            icon: Clock,
            color: "bg-red-100 text-red-700"
          };
        }
      }
      
      // Priority 3: Show current week if season is active
      if (pool.jury_phase_started) {
        return {
          label: "Season Status",
          value: "Jury Phase",
          icon: Trophy,
          color: "bg-purple-100 text-purple-700"
        };
      }
      
      // Default: Show basic pool status
      return {
        label: "Pool Status",
        value: pool.draft_open ? "Draft Open" : "Draft Closed",
        icon: Calendar,
        color: pool.draft_open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
      };
    };
    
    setCountdownData(determineCountdown());
  }, [pool]);

  useEffect(() => {
    if (!countdownData?.target) return;
    
    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = countdownData.target!.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes} min${minutes !== 1 ? 's' : ''}`);
      }
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [countdownData]);

  if (!countdownData) return null;

  const IconComponent = countdownData.icon;
  const displayValue = countdownData.target ? timeRemaining : countdownData.value;

  return (
    <Badge variant="outline" className={`${countdownData.color} ${className} px-3 py-2 font-medium`}>
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">{countdownData.label}</span>
          <span className="text-sm font-semibold">{displayValue}</span>
        </div>
      </div>
    </Badge>
  );
};