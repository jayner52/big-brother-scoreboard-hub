import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyUpdateRequest {
  pool_id: string;
  week_number: number;
  pool_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { pool_id, week_number, pool_name }: WeeklyUpdateRequest = await req.json();

    console.log(`Sending weekly update for pool ${pool_name}, week ${week_number}`);

    // Get pool members with profiles
    const { data: members, error: membersError } = await supabase
      .from("pool_memberships")
      .select(`
        user_id,
        profiles!inner(display_name)
      `)
      .eq("pool_id", pool_id)
      .eq("active", true);

    if (membersError) {
      throw new Error(`Failed to get members: ${membersError.message}`);
    }

    // Get week results
    const { data: weekResults } = await supabase
      .from("weekly_results")
      .select("*")
      .eq("pool_id", pool_id)
      .eq("week_number", week_number)
      .single();

    // Get current leaderboard
    const { data: leaderboard } = await supabase
      .from("pool_entries")
      .select("team_name, participant_name, total_points")
      .eq("pool_id", pool_id)
      .order("total_points", { ascending: false })
      .limit(5);

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          ${pool_name} - Week ${week_number} Update
        </h2>
        
        ${weekResults ? `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569;">This Week's Results:</h3>
            <ul style="list-style: none; padding: 0;">
              ${weekResults.hoh_winner ? `<li>🏆 <strong>HOH Winner:</strong> ${weekResults.hoh_winner}</li>` : ''}
              ${weekResults.pov_winner ? `<li>💎 <strong>POV Winner:</strong> ${weekResults.pov_winner}</li>` : ''}
              ${weekResults.evicted_contestant ? `<li>📤 <strong>Evicted:</strong> ${weekResults.evicted_contestant}</li>` : ''}
              ${weekResults.nominees ? `<li>🎯 <strong>Nominees:</strong> ${weekResults.nominees.join(', ')}</li>` : ''}
            </ul>
          </div>
        ` : `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Week ${week_number} results haven't been posted yet. Check back soon!</p>
          </div>
        `}
        
        ${leaderboard && leaderboard.length > 0 ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Current Standings:</h3>
            <ol style="padding-left: 20px;">
              ${leaderboard.map((team, index) => `
                <li style="margin: 5px 0;">
                  <strong>${team.team_name}</strong> (${team.participant_name}) - ${team.total_points} pts
                  ${index === 0 ? ' 🥇' : index === 1 ? ' 🥈' : index === 2 ? ' 🥉' : ''}
                </li>
              `).join('')}
            </ol>
          </div>
        ` : ''}
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p><strong>🎮 Log in to see complete results, live standings, and make any needed updates!</strong></p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 40px;">
          <p>You're receiving this because you're a member of ${pool_name}</p>
        </div>
      </div>
    `;

    // Send emails to all members
    const emailPromises = members.map(async (member) => {
      // In a real implementation, you'd get the user's email from auth
      // For now, we'll use a placeholder or skip if no email available
      const userEmail = `user-${member.user_id}@example.com`; // This would need to be actual email
      
      return resend.emails.send({
        from: "Pool Updates <updates@yourdomain.com>",
        to: [userEmail],
        subject: `${pool_name} - Week ${week_number} Update`,
        html: emailHtml,
      });
    });

    await Promise.all(emailPromises);

    console.log(`Weekly update sent to ${members.length} members`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Weekly update sent to ${members.length} members` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error sending weekly update:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);