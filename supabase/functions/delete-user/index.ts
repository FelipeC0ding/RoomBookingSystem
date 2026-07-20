import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { requireRole } from '../_shared/verifyCaller.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) throw new Error("userId is required")

    const caller = await requireRole(req, 'admin')

    const { data: target, error: targetError } = await caller.supabaseAdmin
      .from('User')
      .select('OrganisationID')
      .eq('UserID', userId)
      .single()

    if (targetError || !target) {
      throw new Error("Target user not found")
    }
    if (target.OrganisationID !== caller.organisationId) {
      return new Response(JSON.stringify({ error: 'Cannot delete a user outside your organisation' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // on delete cascade on User_UserID_fkey handles removing the
    // public."User" row automatically — no separate delete needed.
    const { error: authError } = await caller.supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})