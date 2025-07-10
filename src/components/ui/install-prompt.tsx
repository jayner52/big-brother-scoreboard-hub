import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installApp();
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  return (
    <Card className="mx-4 my-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Install Poolside Picks</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Add to your home screen for quick access and offline viewing
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={handleInstall}
          size="sm"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
};