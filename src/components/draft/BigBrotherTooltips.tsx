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
    
    // Specific strategic tooltips based on question content
    if (lowerQuestion.includes('second hoh') || lowerQuestion.includes('2nd hoh')) {
      return "Week 2 HoHs often try to set the tone. Look for comp threats or players eager to prove themselves after Week 1.";
    }
    
    if (lowerQuestion.includes('first boot') || lowerQuestion.includes('1st boot') || lowerQuestion.includes('first evict')) {
      return "First evictees are often quiet, overly aggressive, or on the wrong side of a Day 1 twist. Look for someone who doesn't integrate quickly.";
    }
    
    if (lowerQuestion.includes('first juror') || lowerQuestion.includes('1st juror')) {
      return "Often evicted during a double. Mid-tier threats, floaters, or isolated players tend to land here.";
    }
    
    if (lowerQuestion.includes('winner pick') || lowerQuestion.includes('who will win') || lowerQuestion.includes('final winner')) {
      return "Winners stay cool early, build tight bonds, and avoid being targets until late. Social game is key.";
    }
    
    if (lowerQuestion.includes('veto') && (lowerQuestion.includes('used') || lowerQuestion.includes('times'))) {
      return "Veto is used more often than not — especially when backdoors or alliance shifts happen. 8–10 is a solid guess.";
    }
    
    if (lowerQuestion.includes('votes') && lowerQuestion.includes('winner')) {
      return "Assuming a 7–9 person jury, winners often get 5–8 votes. Social players tend to earn near-sweeps.";
    }
    
    if (lowerQuestion.includes('triple eviction') || lowerQuestion.includes('triple')) {
      return "Triple evictions are rare but gaining popularity — BB22 and BB23 had one. Mid-season chaos alert!";
    }
    
    if (lowerQuestion.includes('quit') || lowerQuestion.includes('self-evict') || lowerQuestion.includes('walk')) {
      return "It's rare, but has happened (BB19, BB24). Mental stress or twists can lead someone to walk.";
    }
    
    if (lowerQuestion.includes('showmance') || (lowerQuestion.includes('two') && lowerQuestion.includes('relationship'))) {
      return "Look for early flirtation, shared rooms, and hot tub chats. Must get both people correct!";
    }
    
    if (lowerQuestion.includes('otev') || lowerQuestion.includes('creature')) {
      return "OTEV has been a vulture, pig, alien, rockstar, and more. Think chaotic, themed, and weird.";
    }
    
    if (lowerQuestion.includes('america') && lowerQuestion.includes('vote')) {
      return "Underdogs, funny DRs, or fan-faves get early votes. Look for who stands out to viewers.";
    }
    
    if (lowerQuestion.includes('hoh twice') || lowerQuestion.includes('first to win') && lowerQuestion.includes('twice')) {
      return "Usually a comp beast or a social threat. Double evictions often reveal repeat HoH champs.";
    }
    
    if ((lowerQuestion.includes('second') || lowerQuestion.includes('third')) && (lowerQuestion.includes('double') || lowerQuestion.includes('triple'))) {
      return "Vulnerable floaters or recent big movers tend to be blindsided fast during these events.";
    }
    
    if (lowerQuestion.includes('america') && lowerQuestion.includes('favorite')) {
      return "AFPs are loveable, funny, or underdogs. Taylor, Da'Vonne, and James Huling types thrive.";
    }
    
    // Default strategic advice for any other bonus questions
    return "Think strategically — use past BB patterns, twists, and your gut instinct to maximize points. Bonus questions can swing the whole game!";
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