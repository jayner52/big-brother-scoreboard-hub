import React from 'react';
import { PoolSetupChecklist } from './PoolSetupChecklist';

interface AdminSetupWizardSimplifiedProps {
  forceShow?: boolean;
}

export const AdminSetupWizardSimplified: React.FC<AdminSetupWizardSimplifiedProps> = ({ 
  forceShow = false 
}) => {
  return <PoolSetupChecklist forceShow={forceShow} />;
};