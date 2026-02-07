import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user from JWT
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Delete in correct order (respecting foreign key constraints)
    
    // 1. Delete user reports
    const { error: reportsError } = await supabaseAdmin
      .from('user_reports')
      .delete()
      .eq('user_id', user.id);
    
    if (reportsError) {
      console.error("Error deleting user_reports:", reportsError);
    }
    
    // 2. Delete podcast analytics
    const { error: analyticsError } = await supabaseAdmin
      .from('podcast_analytics')
      .delete()
      .eq('user_id', user.id);
    
    if (analyticsError) {
      console.error("Error deleting podcast_analytics:", analyticsError);
    }
    
    // 3. Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);
    
    if (rolesError) {
      console.error("Error deleting user_roles:", rolesError);
    }
    
    // 4. Delete from users table
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user.id);
    
    if (usersError) {
      console.error("Error deleting from users table:", usersError);
      throw usersError;
    }

    // 5. Delete auth user (only service role can do this)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );
    
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      throw deleteAuthError;
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in delete-user-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
