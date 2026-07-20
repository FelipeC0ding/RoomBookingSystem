import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Redis } from "https://esm.sh/@upstash/redis"

// 1. Initialize Redis securely (Tokens are set in Supabase Dashboard, NOT the frontend)
const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
})

serve(async (req) => {
  try {
    // 2. Initialize Supabase client using the user's Auth token from the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Get the user making the request to ensure they aren't fetching someone else's data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")

    const cacheKey = `bookings:user:${user.id}`

    // 4. Check Redis Cache
    const cachedBookings = await redis.get(cacheKey)
    if (cachedBookings) {
      return new Response(JSON.stringify(cachedBookings), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    // 5. Cache Miss: Fetch from Database
    const { data, error } = await supabaseClient
      .from('Booking')
      .select(`*, Room ( RoomName, Capacity )`)
      .eq('UserID', user.id)
      .order('BookingDate', { ascending: false })

    if (error) throw error

    // 6. Set Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(data), { ex: 300 })

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})