import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminAccessDenied: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">You don't have permission to access the admin panel for this pool.</p>
      </CardContent>
    </Card>
  );
};