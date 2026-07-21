import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

export type VerifiedCaller = {
  callerId: string
  role: string
  organisationId: number
  supabaseAdmin: ReturnType<typeof createClient>
}

/**
 * Verifies the caller's identity from their Authorization header, and loads
 * their Role + OrganisationID from the trusted "User" table (never from
 * anything the client sent in the request body).
 *
 * Throws on any failure — callers should wrap this in their own try/catch
 * and return an appropriate error response.
 */
export async function verifyCaller(req: Request): Promise<VerifiedCaller> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const supabaseAsCaller = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: callerData, error: callerError } = await supabaseAsCaller.auth.getUser()
  if (callerError || !callerData?.user) {
    console.error('verifyCaller getUser failed:', JSON.stringify(callerError))
    throw new Error('Could not verify caller identity')
  }
  const callerId = callerData.user.id

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('User')
    .select('Role, OrganisationID')
    .eq('UserID', callerId)
    .single()

  if (profileError || !profile) {
    throw new Error('Could not load caller profile')
  }

  return {
    callerId,
    role: profile.Role,
    organisationId: profile.OrganisationID,
    supabaseAdmin,
  }
}

export async function requireRole(req: Request, role: string): Promise<VerifiedCaller> {
  const caller = await verifyCaller(req)
  if (caller.role !== role) {
    throw new Error(`Requires role: ${role}`)
  }
  return caller
}