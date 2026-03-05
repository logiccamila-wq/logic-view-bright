import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  start: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  end: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  profile: z.enum(['driving-hgv', 'driving-car']).optional().default('driving-hgv')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Get API key from environment (server-side only)
    const apiKey = Deno.env.get('OPENROUTESERVICE_API_KEY');
    if (!apiKey) {
      throw new Error('OpenRouteService API key not configured');
    }

    console.log(`Calculating route for user ${user.id}`);

    // Call OpenRouteService API
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${validated.profile}/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [validated.start.lng, validated.start.lat],
            [validated.end.lng, validated.end.lat]
          ],
          preference: 'recommended',
          units: 'km'
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouteService error:', response.status, errorText);
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const routeData = await response.json();
    const route = routeData.features[0];

    return new Response(
      JSON.stringify({
        distance: route.properties.summary.distance * 1000, // km to meters
        duration: route.properties.summary.duration,
        geometry: route.geometry
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Calculate route error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});