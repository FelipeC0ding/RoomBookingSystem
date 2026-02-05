// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs

//Deno is the open-source JavaScript runtime for the modern web.
import { corsHeaders } from '../_shared/cors.ts'
import "@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts" //serve is deno built in web server
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

console.log("Hello from Functions!")

serve(async (req) => {
  const { email } = await req.json()
  const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // super-admin powers. It can bypass (RLS) ! = i promise these vars exist
)

const {data, error} = await supabaseAdmin.auth.admin.inviteUserByEmail(email,{
  redirectTo:'https://roombookingsystem.app/set-password'
})
//using Admin API , create a new user in auth.users, with invited status, and send them a link

if (error){
  return new Response(JSON.stringify({ error: error.message }), { status: 400 })

}
else{
   return new Response(JSON.stringify({ data }), { status: 200 })
}
})