import React from 'react';
import { SimplifiedPoolSetupChecklist } from './SimplifiedPoolSetupChecklist';

interface AdminSetupWizardSimplifiedProps {
  forceShow?: boolean;
}

export const AdminSetupWizardSimplified: React.FC<AdminSetupWizardSimplifiedProps> = ({ 
  forceShow = false 
}) => {
  return <SimplifiedPoolSetupChecklist forceShow={forceShow} />;
};