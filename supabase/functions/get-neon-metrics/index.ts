import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NEON_API_KEY = Deno.env.get('NEON_API_KEY');
    
    if (!NEON_API_KEY) {
      console.error('NEON_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Neon API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { projectId, startDate, endDate } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'projectId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching Neon metrics for project: ${projectId}`);

    // Fetch project details
    const projectResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${NEON_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      console.error('Neon API error (project):', projectResponse.status, errorText);
      throw new Error(`Failed to fetch project: ${projectResponse.status} - ${errorText}`);
    }

    const projectData = await projectResponse.json();
    console.log('Project data fetched successfully');

    // Fetch consumption metrics
    const metricsResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/consumption`,
      {
        headers: {
          'Authorization': `Bearer ${NEON_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!metricsResponse.ok) {
      const errorText = await metricsResponse.text();
      console.error('Neon API error (consumption):', metricsResponse.status, errorText);
      throw new Error(`Failed to fetch consumption: ${metricsResponse.status} - ${errorText}`);
    }

    const consumptionData = await metricsResponse.json();
    console.log('Consumption data fetched successfully');

    // Fetch branches
    const branchesResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/branches`,
      {
        headers: {
          'Authorization': `Bearer ${NEON_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    const branchesData = branchesResponse.ok ? await branchesResponse.json() : { branches: [] };
    console.log(`Fetched ${branchesData.branches?.length || 0} branches`);

    // Calculate metrics
    const metrics = {
      projectName: projectData.project?.name || 'Unknown',
      projectId: projectId,
      region: projectData.project?.region_id || 'Unknown',
      
      // Consumption metrics
      computeHours: consumptionData.active_time_seconds ? 
        (consumptionData.active_time_seconds / 3600).toFixed(2) : '0.00',
      storageGB: consumptionData.data_storage_bytes_hour ? 
        (consumptionData.data_storage_bytes_hour / (1024 * 1024 * 1024)).toFixed(2) : '0.00',
      writtenDataGB: consumptionData.written_data_bytes ? 
        (consumptionData.written_data_bytes / (1024 * 1024 * 1024)).toFixed(2) : '0.00',
      dataTransferGB: consumptionData.data_transfer_bytes ? 
        (consumptionData.data_transfer_bytes / (1024 * 1024 * 1024)).toFixed(2) : '0.00',
      
      // Branch info
      branches: branchesData.branches?.length || 0,
      branchList: branchesData.branches?.map((b: any) => ({
        id: b.id,
        name: b.name,
        created_at: b.created_at,
        current_state: b.current_state,
        default: b.default
      })) || [],
      
      // Cost estimates (Neon pricing)
      estimatedCosts: {
        compute: consumptionData.active_time_seconds ? 
          ((consumptionData.active_time_seconds / 3600) * 0.222).toFixed(2) : '0.00',
        storage: consumptionData.data_storage_bytes_hour ? 
          ((consumptionData.data_storage_bytes_hour / (1024 * 1024 * 1024)) * 0.35).toFixed(2) : '0.00',
        dataTransfer: consumptionData.data_transfer_bytes ? 
          ((consumptionData.data_transfer_bytes / (1024 * 1024 * 1024)) * 0.09).toFixed(2) : '0.00',
      },
      
      // Raw data for detailed analysis
      rawConsumption: consumptionData,
      lastUpdated: new Date().toISOString(),
    };

    // Calculate total estimated cost
    const totalCost = (
      parseFloat(metrics.estimatedCosts.compute) +
      parseFloat(metrics.estimatedCosts.storage) +
      parseFloat(metrics.estimatedCosts.dataTransfer)
    ).toFixed(2);

    console.log(`Total estimated cost: $${totalCost}`);

    return new Response(
      JSON.stringify({
        ...metrics,
        totalEstimatedCost: totalCost
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching Neon metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to fetch metrics from Neon API'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
