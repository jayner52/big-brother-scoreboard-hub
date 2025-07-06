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
import { HouseguestRevivalSection } from './HouseguestRevivalSection';

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
      
      {/* Houseguest Revival Section */}
      <HouseguestRevivalSection />
      
      {/* Regular Week Content */}
      <div className={eventForm.isDoubleEviction ? "border rounded-lg p-4 bg-blue-50 border-blue-200" : ""}>
        {eventForm.isDoubleEviction && (
          <h3 className="text-lg font-semibold mb-4 text-blue-800">First Eviction</h3>
        )}
        
        {/* Competition Results */}
        <div className="space-y-4">
          {/* HOH Winner */}
          <CompetitionWinners
            eventForm={eventForm}
            setEventForm={setEventForm}
          />

          {/* Nominees */}
          <NomineesSection
            eventForm={eventForm}
            setEventForm={setEventForm}
          />

          {/* POV Winner */}
          <PovWinnerSection
            eventForm={eventForm}
            setEventForm={setEventForm}
          />

          {/* POV Usage and Replacement */}
          <PovUsageSection
            eventForm={eventForm}
            setEventForm={setEventForm}
          />
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

      {/* BB Arena Section - positioned before eviction */}
      <AIArenaSection
        eventForm={eventForm}
        setEventForm={setEventForm}
        activeContestants={activeContestants}
      />

      {/* Evicted Contestant */}
      <EvictionSection
        eventForm={eventForm}
        setEventForm={setEventForm}
        evictionLabel={eventForm.isDoubleEviction ? "First Evicted Contestant" : "Evicted Contestant"}
      />

      {/* Special Events */}
      <SpecialEventsSection
        eventForm={eventForm}
        setEventForm={setEventForm}
        activeContestants={activeContestants}
        scoringRules={scoringRules}
        allContestants={contestants}
      />
    </>
  );
};