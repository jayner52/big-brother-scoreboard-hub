import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DraftLockedStateProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export const DraftLockedState: React.FC<DraftLockedStateProps> = ({
  title = "Registration Closed",
  message = "The pool administrator has closed registration for new participants.",
  showBackButton = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground">
              {message}
            </p>
          </div>

          {showBackButton && (
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};