import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, password } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Check if locked
    const { data: attemptRecord } = await supabaseAdmin
      .from('auth_login_attempts')
      .select('*')
      .eq('email', email)
      .single()

    if (attemptRecord && attemptRecord.locked_until) {
      if (new Date().getTime() < new Date(attemptRecord.locked_until).getTime()) {
        // FIX 1: Changed status 403 to 200
        return new Response(JSON.stringify({ error: "Account is temporarily locked." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      }
    }

    // 2. Attempt Login
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    if (authError) {
      let newCount = (attemptRecord?.failed_count || 0) + 1
      let lockedUntil = null

      if (newCount >= 3) {
        lockedUntil = new Date(new Date().getTime() + 15 * 60000).toISOString()
      }

      await supabaseAdmin.from('auth_login_attempts').upsert({ email, failed_count: newCount, locked_until: lockedUntil })
      
      const msg = newCount >= 3 ? "Account locked due to 3 failed attempts." : `Invalid credentials. ${3 - newCount} attempts remaining.`
      
      // FIX 2: Changed status 401 to 200
      return new Response(JSON.stringify({ error: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // 3. Success! Reset attempts.
    await supabaseAdmin.from('auth_login_attempts').upsert({ email, failed_count: 0, locked_until: null })

    return new Response(JSON.stringify({ session: authData.session, user: authData.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    // FIX 3: Also changed catch block to 200 to ensure unexpected errors don't trigger FunctionsHttpError
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  }
})