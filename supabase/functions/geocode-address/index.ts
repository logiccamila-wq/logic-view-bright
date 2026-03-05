import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geocodeSchema = z.object({
  address: z.string().trim().min(3).max(500)
});

const reverseGeocodeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
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

    // Get API key from environment (server-side only)
    const apiKey = Deno.env.get('TOMTOM_API_KEY');
    if (!apiKey) {
      throw new Error('TomTom API key not configured');
    }

    const body = await req.json();
    let url: string;

    // Check if it's geocoding or reverse geocoding
    if ('address' in body) {
      const validated = geocodeSchema.parse(body);
      console.log(`Geocoding address for user ${user.id}: ${validated.address}`);
      
      url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(validated.address)}.json?key=${apiKey}&limit=1`;
    } else {
      const validated = reverseGeocodeSchema.parse(body);
      console.log(`Reverse geocoding for user ${user.id}: ${validated.lat}, ${validated.lng}`);
      
      url = `https://api.tomtom.com/search/2/reverseGeocode/${validated.lat},${validated.lng}.json?key=${apiKey}`;
    }

    // Call TomTom API
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TomTom error:', response.status, errorText);
      throw new Error(`TomTom API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No results found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data.results[0];
    
    return new Response(
      JSON.stringify({
        position: {
          lat: result.position.lat,
          lon: result.position.lon
        },
        address: {
          freeformAddress: result.address.freeformAddress,
          country: result.address.country,
          municipality: result.address.municipality
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Geocode error:', error);
    
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