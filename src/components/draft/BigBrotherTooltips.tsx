import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BigBrotherTooltipProps {
  questionText: string;
  questionType?: string;
}

export const BigBrotherTooltip: React.FC<BigBrotherTooltipProps> = ({
  questionText,
  questionType = 'general',
}) => {
  const getTooltipContent = () => {
    const lowerQuestion = questionText.toLowerCase();
    
    // OTEV/Creature questions
    if (lowerQuestion.includes('otev') || lowerQuestion.includes('creature')) {
      const otevFacts = [
        "OTEV has been a skunk, shark, alien, pig, and even a vulture. In Season 24, it was a foam rock star!",
        "The classic OTEV competition often features houseguests sliding down a slippery slope to find answers.",
        "OTEV competitions typically happen during the Power of Veto ceremony in later weeks of the season.",
        "Some of the most memorable OTEV creatures include a pig from Season 22 and an alien from Season 21."
      ];
      return otevFacts[Math.floor(Math.random() * otevFacts.length)];
    }
    
    // First juror questions
    if (lowerQuestion.includes('first juror') || lowerQuestion.includes('jury')) {
      const juryFacts = [
        "The first juror is often evicted during a double eviction. This happened in Seasons 23, 20, and 16.",
        "Jury phase typically starts when there are 9-11 houseguests remaining in the game.",
        "The first juror gets to see all the drama unfold from the jury house without the stress of competition.",
        "Some first jurors have been fan favorites who were evicted due to being seen as major threats."
      ];
      return juryFacts[Math.floor(Math.random() * juryFacts.length)];
    }
    
    // Crying/emotions questions
    if (lowerQuestion.includes('cry') || lowerQuestion.includes('tears') || lowerQuestion.includes('emotional')) {
      const emotionalFacts = [
        "Emotions run high! Season 22 had 5 different houseguests cry on live eviction nights.",
        "Eviction nights are particularly emotional, especially when close allies are separated.",
        "The diary room often captures the most emotional moments as houseguests confess their fears.",
        "Family videos during HOH competitions have led to some of the most tearful moments in Big Brother history."
      ];
      return emotionalFacts[Math.floor(Math.random() * emotionalFacts.length)];
    }
    
    // HOH/Competition questions
    if (lowerQuestion.includes('hoh') || lowerQuestion.includes('head of household') || lowerQuestion.includes('competition')) {
      const competitionFacts = [
        "HOH competitions range from physical endurance to mental puzzles and everything in between.",
        "The longest HOH competition in Big Brother history lasted over 13 hours!",
        "Endurance competitions often favor lighter, more agile houseguests who can hang on longer.",
        "Mental competitions typically involve memory challenges about past events in the house."
      ];
      return competitionFacts[Math.floor(Math.random() * competitionFacts.length)];
    }
    
    // Power of Veto questions
    if (lowerQuestion.includes('veto') || lowerQuestion.includes('pov')) {
      const vetoFacts = [
        "The Power of Veto can completely change the game by saving someone from the chopping block.",
        "Some of the most dramatic moments happen when the veto is used to backdoor a major threat.",
        "Veto competitions often have fun themes, from spelling bees to physical obstacle courses.",
        "The golden power of veto has been around since Season 3 and is a staple of the game."
      ];
      return vetoFacts[Math.floor(Math.random() * vetoFacts.length)];
    }
    
    // Showmance questions
    if (lowerQuestion.includes('showmance') || lowerQuestion.includes('relationship') || lowerQuestion.includes('couple')) {
      const showmanceFacts = [
        "Showmances can be powerful game alliances or major distractions - it's a double-edged sword.",
        "Some of the most successful Big Brother players have used showmances strategically.",
        "The house tends to target showmances in the later weeks as they're seen as unbreakable pairs.",
        "Several Big Brother showmances have led to real marriages and long-term relationships!"
      ];
      return showmanceFacts[Math.floor(Math.random() * showmanceFacts.length)];
    }
    
    // Backstab/betrayal questions
    if (lowerQuestion.includes('backstab') || lowerQuestion.includes('betray') || lowerQuestion.includes('blindside')) {
      const betrayalFacts = [
        "The biggest blindsides often happen when closest allies turn on each other.",
        "Backdoors are a classic Big Brother strategy - nominate pawns, then use veto to target the real threat.",
        "The most shocking betrayals happen during double evictions when there's no time to campaign.",
        "Alliance betrayals have led to some of the most dramatic moments in Big Brother history."
      ];
      return betrayalFacts[Math.floor(Math.random() * betrayalFacts.length)];
    }
    
    // Default general facts
    const generalFacts = [
      "Big Brother is a game of strategy, social skills, and a little bit of luck!",
      "The most successful players balance competition wins with strong social gameplay.",
      "Expect the unexpected - Big Brother loves to throw curveballs at houseguests.",
      "The best strategies often involve adapting to the changing dynamics of the house."
    ];
    return generalFacts[Math.floor(Math.random() * generalFacts.length)];
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-purple-600 transition-colors cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-800 font-medium">💡 Big Brother Insight</p>
          <p className="text-sm text-purple-700 mt-1">
            {getTooltipContent()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};