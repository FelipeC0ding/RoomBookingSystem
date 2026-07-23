import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS for browser requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Create standard client using the caller's Auth token to verify WHO is making the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const callerRole = user.app_metadata.role
    const callerOrg = user.app_metadata.organisation_id

    // Block non-admins instantly
    if (callerRole !== 'admin') {
      throw new Error('Only admins can change roles')
    }

    // 3. Parse the requested changes
    const { target_user_id, new_role } = await req.json()

    // 4. Create an Admin client (Service Role) to bypass RLS and edit Auth metadata
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the target user belongs to the SAME organization as the admin
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('User')
      .select('OrganisationID')
      .eq('UserID', target_user_id)
      .single()

    if (targetError || targetUser.OrganisationID !== callerOrg) {
      throw new Error('Cannot modify users outside your organization')
    }

    // 5. Update the target's JWT Auth Metadata (merges the new role, keeps the org ID)
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      target_user_id,
      { app_metadata: { role: new_role, organisation_id: callerOrg } }
    )
    if (updateAuthError) throw updateAuthError

    // 6. Update the Public User table so the UI reflects the change immediately
    const { error: dbError } = await supabaseAdmin
      .from('User')
      .update({ Role: new_role })
      .eq('UserID', target_user_id)
    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})