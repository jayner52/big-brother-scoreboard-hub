import React from 'react';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { CompetitionWinners } from './CompetitionWinners';
import { NomineesSection } from './NomineesSection';
import { PovWinnerSection } from './PovWinnerSection';
import { PovUsageSection } from './PovUsageSection';
import { EvictionSection } from './EvictionSection';
import { SpecialEventsSection } from './SpecialEventsSection';
import { SecondEvictionSection } from './SecondEvictionSection';
import { ThirdEvictionSection } from './ThirdEvictionSection';
import { AIArenaSection } from './AIArenaSection';
import { StepByStepFlow } from './StepByStepFlow';

interface RegularWeekContentProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  contestants: ContestantWithBio[];
  scoringRules: DetailedScoringRule[];
}

export const RegularWeekContent: React.FC<RegularWeekContentProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  contestants,
  scoringRules,
}) => {
  return (
    <>
      {/* Step-by-Step Progress */}
      <StepByStepFlow eventForm={eventForm} />
      
      {/* Regular Week Content */}
      <div className={eventForm.isDoubleEviction ? "border rounded-lg p-4 bg-blue-50 border-blue-200" : ""}>
        {eventForm.isDoubleEviction && (
          <h3 className="text-lg font-semibold mb-4 text-blue-800">First Eviction</h3>
        )}
      {/* Competition Results - Blue Theme */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            Competition Results
          </h3>
          <CompetitionWinners
            eventForm={eventForm}
            setEventForm={setEventForm}
          />
        </div>

        {/* Nominations - Orange Theme */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-orange-800 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Nominations & Veto
          </h3>
          <div className="space-y-4">
            <NomineesSection
              eventForm={eventForm}
              setEventForm={setEventForm}
            />

            <PovWinnerSection
              eventForm={eventForm}
              setEventForm={setEventForm}
            />

            <PovUsageSection
              eventForm={eventForm}
              setEventForm={setEventForm}
            />
          </div>
        </div>

        {/* BB Arena Section - Green Theme */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center gap-2">
            <span className="text-xl">🏟️</span>
            Arena Competition
          </h3>
          <AIArenaSection
            eventForm={eventForm}
            setEventForm={setEventForm}
            activeContestants={activeContestants}
          />
        </div>

        {/* Eviction - Red Theme */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2">
            <span className="text-xl">👋</span>
            Eviction
          </h3>
          <EvictionSection
            eventForm={eventForm}
            setEventForm={setEventForm}
            evictionLabel={eventForm.isDoubleEviction ? "First Evicted Houseguest" : "Evicted Houseguest"}
          />
        </div>
      </div>
      </div>

      {/* Second Eviction (only shown for double eviction weeks) */}
      {eventForm.isDoubleEviction && (
        <SecondEvictionSection
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
          contestants={contestants}
        />
      )}

      {/* Third Eviction (only shown for triple eviction weeks) */}
      {eventForm.isTripleEviction && (
        <ThirdEvictionSection
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
          contestants={contestants}
        />
      )}

      {/* Special Events - Purple Theme */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          Special Events
        </h3>
        <SpecialEventsSection
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
        />
      </div>
    </>
  );
};