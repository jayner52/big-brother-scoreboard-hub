import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold text-dark mb-2">Privacy Policy</h1>
          <p className="text-dark/70">Last updated: January 10, 2025</p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                join a pool, or contact us for support.
              </p>
              <p><strong>Personal Information:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address and display name</li>
                <li>Pool participation data and team selections</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Chat messages and interactions within pools</li>
              </ul>
              <p><strong>Automatically Collected Information:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">2. How We Use Your Information</h2>
            <div className="space-y-4 text-dark/80">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our fantasy pool services</li>
                <li>Process transactions and manage pool memberships</li>
                <li>Send important updates about your pools and account</li>
                <li>Improve our services and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">3. Information Sharing</h2>
            <div className="space-y-4 text-dark/80">
              <p>We do not sell your personal information. We may share your information in these situations:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Within Pools:</strong> Your display name, team information, and rankings are visible to other pool members</li>
                <li><strong>Service Providers:</strong> With trusted third-parties who help us operate our platform (Supabase for database services)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">4. Data Storage and Security</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                Your data is stored securely using Supabase, a trusted database platform with enterprise-grade security. 
                We implement appropriate technical and organizational measures to protect your information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                Data is stored in secure data centers and transmitted using encrypted connections (HTTPS/TLS).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">5. Cookies and Tracking</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                We use cookies and similar technologies to enhance your experience, remember your preferences, 
                and analyze how our service is used. You can control cookie settings through your browser, 
                though some features may not work properly if cookies are disabled.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">6. Data Retention</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill 
                the purposes outlined in this policy. Pool data and historical records are maintained to preserve 
                the integrity of completed seasons and leaderboards.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">7. Your Rights</h2>
            <div className="space-y-4 text-dark/80">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access, update, or delete your personal information</li>
                <li>Object to or restrict certain processing of your data</li>
                <li>Data portability (receive a copy of your data)</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at the information provided below.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">8. International Data Transfers</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data during international transfers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">9. Children's Privacy</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected personal 
                information from a child under 13, we will delete such information promptly.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">10. Third-Party Services</h2>
            <div className="space-y-4 text-dark/80">
              <p>Our service integrates with third-party providers:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Payment Processors:</strong> For handling pool entry fees (when applicable)</li>
              </ul>
              <p>
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">11. Changes to This Policy</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                We may update this privacy policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last updated" date. Your continued use 
                of our service after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark mb-4">12. Contact Us</h2>
            <div className="space-y-4 text-dark/80">
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-lg p-4">
                <p><strong>Email:</strong> privacy@poolsidepicks.com</p>
                <p><strong>Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;