import { Pool } from '@/types/pool';

export const isDraftAccessible = (pool: Pool | null): boolean => {
  if (!pool) return false;
  
  // Check if draft is open
  if (!pool.draft_open) return false;
  
  // Check if new participants are allowed
  if (!pool.allow_new_participants) return false;
  
  // Check if draft is locked by admin
  if (pool.draft_locked) return false;
  
  // Check if registration deadline has passed
  if (pool.registration_deadline) {
    const deadline = new Date(pool.registration_deadline);
    const now = new Date();
    if (now > deadline) return false;
  }
  
  return true;
};

export const getDraftLockReason = (pool: Pool | null): { title: string; message: string } => {
  if (!pool) {
    return {
      title: "No Pool Found",
      message: "Please select a pool to access the draft."
    };
  }
  
  if (!pool.draft_open) {
    return {
      title: "Draft Closed by Admin",
      message: "The draft has been closed by the pool administrator. No new team registrations are being accepted."
    };
  }

  if (!pool.allow_new_participants) {
    return {
      title: "New Participants Not Allowed",
      message: "The pool administrator has disabled new participant registrations. Only existing members can modify their teams."
    };
  }
  
  if (pool.draft_locked) {
    return {
      title: "Draft Locked",
      message: "All teams have been locked by the administrator. No changes can be made to team selections."
    };
  }
  
  if (pool.registration_deadline) {
    const deadline = new Date(pool.registration_deadline);
    const now = new Date();
    if (now > deadline) {
      return {
        title: "Registration Deadline Passed",
        message: `The registration deadline was ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}. No new registrations are being accepted.`
      };
    }
  }
  
  return {
    title: "Draft Available",
    message: "The draft is currently open for registrations."
  };
};