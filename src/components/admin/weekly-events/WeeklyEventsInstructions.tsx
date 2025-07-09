import React from 'react';
import { InstructionAccordion } from '../InstructionAccordion';

export const WeeklyEventsInstructions: React.FC = () => {
  return (
    <InstructionAccordion 
      title="Weekly Events Management Guide" 
      tabKey="weekly_events"
    >
      <div className="space-y-4">
        {/* Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">📚 Complete Overview</p>
          <p className="text-blue-700 text-sm mt-1">
            Log weekly competition results and evictions. Always complete weeks in chronological order to ensure accurate point calculations.
          </p>
        </div>

        {/* Standard Week Accordion */}
        <details className="group border border-gray-200 rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 rounded-lg group-open:rounded-b-none hover:bg-gray-100 transition-colors">
            <span className="font-semibold text-gray-800 flex items-center gap-2">
              🏠 Standard Week Process
            </span>
            <span className="text-gray-500 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          <div className="p-4 space-y-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Follow these steps in order for a typical week:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Select Week Number:</strong> Use the week selector at the top</li>
              <li><strong>Set HoH Winner:</strong> Choose the Head of Household winner</li>
              <li><strong>Add Nominees:</strong> Select 2-4 initial nominees (adjustable)</li>
              <li><strong>Set PoV Winner:</strong> Choose Power of Veto competition winner</li>
              <li><strong>PoV Usage:</strong> If used, select who it was used on and replacement nominee</li>
              <li><strong>Add Special Events:</strong> BB Arena wins, punishments, rewards, etc.</li>
              <li><strong>Set Evicted Houseguest:</strong> Choose who was evicted</li>
              <li><strong>Review Points:</strong> Check the points preview before submitting</li>
              <li><strong>Submit Week:</strong> Click "Submit Week Results" to finalize</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-xs">
                💡 <strong>Auto-save:</strong> Your progress is automatically saved as you work. You can return later to finish.
              </p>
            </div>
          </div>
        </details>

        {/* Double/Triple Eviction Accordion */}
        <details className="group border border-orange-200 rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer bg-orange-50 rounded-lg group-open:rounded-b-none hover:bg-orange-100 transition-colors">
            <span className="font-semibold text-orange-800 flex items-center gap-2">
              ⚡ Double/Triple Eviction Process
            </span>
            <span className="text-orange-500 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          <div className="p-4 space-y-3 border-t border-orange-200">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-orange-800 mb-2">🔥 Double Eviction:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
                  <li>Enable "Double Eviction" toggle</li>
                  <li>Complete <strong>first eviction cycle:</strong> HoH → Nominees → PoV → Eviction</li>
                  <li>Complete <strong>second eviction cycle:</strong> Second HoH → Second Nominees → Second PoV → Second Eviction</li>
                  <li>Add any special events that occurred during the night</li>
                  <li>Submit the complete double eviction week</li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-orange-800 mb-2">🔥🔥 Triple Eviction:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
                  <li>Enable "Triple Eviction" toggle</li>
                  <li>Complete all three eviction cycles in sequence</li>
                  <li>Each cycle: HoH → Nominees → PoV → Eviction</li>
                  <li>Set all three evicted houseguests</li>
                  <li>Submit the complete triple eviction week</li>
                </ol>
              </div>
            </div>
            <div className="p-3 bg-orange-100 border border-orange-300 rounded">
              <p className="text-orange-800 text-xs">
                ⚠️ <strong>Important:</strong> During multi-eviction weeks, make sure to complete ALL cycles before submitting.
              </p>
            </div>
          </div>
        </details>

        {/* Finale Week Accordion */}
        <details className="group border border-purple-200 rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer bg-purple-50 rounded-lg group-open:rounded-b-none hover:bg-purple-100 transition-colors">
            <span className="font-semibold text-purple-800 flex items-center gap-2">
              🏆 Finale Week & Season Completion
            </span>
            <span className="text-purple-500 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          <div className="p-4 space-y-3 border-t border-purple-200">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-purple-800 mb-2">📺 Finale Week Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-purple-700">
                  <li>Enable "Final Week" toggle</li>
                  <li>Set Final HoH Winner (Part 3 winner)</li>
                  <li>Select Season Winner (1st place)</li>
                  <li>Select Runner-up (2nd place)</li>
                  <li>Select America's Favorite Player (can be ANY contestant from the season)</li>
                  <li><strong>Click "SUBMIT FINAL WEEK RESULTS"</strong> (this does NOT advance to next week)</li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-purple-800 mb-2">🎯 Complete Season:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-purple-700">
                  <li>After finale week submission, scroll to "Complete Season" section</li>
                  <li>System validates all requirements are met</li>
                  <li>Click "Complete Season & Assign Prizes" to finalize</li>
                  <li>Prize winners are automatically notified</li>
                  <li>Check Pool Entries tab to manage prize payouts</li>
                </ol>
              </div>
            </div>
            <div className="p-3 bg-purple-100 border border-purple-300 rounded">
              <p className="text-purple-800 text-xs">
                🎉 <strong>Note:</strong> Season completion triggers automatic prize calculations and winner notifications.
              </p>
            </div>
          </div>
        </details>

        {/* Common Mistakes Accordion */}
        <details className="group border border-red-200 rounded-lg">
          <summary className="flex items-center justify-between p-4 cursor-pointer bg-red-50 rounded-lg group-open:rounded-b-none hover:bg-red-100 transition-colors">
            <span className="font-semibold text-red-800 flex items-center gap-2">
              ⚠️ Common Mistakes to Avoid
            </span>
            <span className="text-red-500 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          <div className="p-4 space-y-2 border-t border-red-200">
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Skipping weeks</strong> - Always complete weeks in chronological order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Missing PoV usage</strong> - Mark when PoV is used and add replacement nominee</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Forgetting special events</strong> - Include BB Arena wins, punishments, rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Final week errors</strong> - Must submit finale results before completing season</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>AFP selection</strong> - America's Favorite can be ANY contestant, not just finalists</span>
              </li>
            </ul>
          </div>
        </details>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium mb-2">💡 Quick Tips</p>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Points preview updates in real-time as you make changes</li>
            <li>• Use "Save Progress" to save drafts without submitting</li>
            <li>• Check Week by Week Overview tab to review completed weeks</li>
            <li>• Mobile-friendly design - manage your pool from anywhere</li>
          </ul>
        </div>
      </div>
    </InstructionAccordion>
  );
};