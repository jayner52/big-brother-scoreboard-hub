import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose max-w-none text-sm space-y-4">
            <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
              <p>
                By creating an account and using Poolside Picks ("the Service"), you agree to be bound by these 
                Terms & Conditions. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">2. Service Description</h3>
              <p>
                Poolside Picks is a fantasy sports platform for reality TV shows, particularly Big Brother. 
                The Service allows users to create and participate in fantasy pools, draft contestants, 
                track scores, and compete for prizes determined by pool administrators.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">3. User Accounts</h3>
              <p>
                You must provide accurate and complete information when creating an account. You are responsible 
                for maintaining the security of your account credentials and for all activities under your account. 
                You must be at least 18 years old to use this Service.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">4. Acceptable Use</h3>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Submit false or misleading information</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Use automated systems or bots without permission</li>
                <li>Interfere with or disrupt the Service</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">5. Fantasy Pools & Payments</h3>
              <p>
                Pool entry fees and prize distributions are managed by individual pool administrators, not 
                Poolside Picks. We are not responsible for the collection or distribution of any funds. 
                Any disputes regarding payments should be resolved between participants and pool administrators.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">6. Intellectual Property</h3>
              <p>
                All content on Poolside Picks, including but not limited to text, graphics, logos, images, 
                and software, is the property of Poolside Picks or its content suppliers and is protected 
                by copyright and other intellectual property laws. You may not reproduce, distribute, or 
                create derivative works without explicit permission.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">7. User Content</h3>
              <p>
                By posting content to the Service, you grant Poolside Picks a non-exclusive, worldwide, 
                royalty-free license to use, reproduce, and display such content in connection with the Service. 
                You represent that you have the right to post such content.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">8. Privacy</h3>
              <p>
                Your use of the Service is also governed by our Privacy Policy. By using the Service, 
                you consent to the collection and use of your information as described.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">9. Disclaimer of Warranties</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
                EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                AND NON-INFRINGEMENT.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">10. Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, POOLSIDE PICKS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">11. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless Poolside Picks, its operators, and affiliates from 
                any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">12. Termination</h3>
              <p>
                We reserve the right to terminate or suspend your account at any time for violation of these 
                Terms or for any other reason at our sole discretion.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">13. Changes to Terms</h3>
              <p>
                We may modify these Terms at any time. Continued use of the Service after changes constitutes 
                acceptance of the modified Terms.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">14. Governing Law</h3>
              <p>
                These Terms shall be governed by the laws of Canada, without regard to conflict 
                of law principles.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold">15. Contact Information</h3>
              <p>
                For questions about these Terms, please contact us at admin@poolside-picks.com
              </p>
            </section>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};