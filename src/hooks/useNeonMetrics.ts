import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface NeonMetrics {
  projectName: string;
  projectId: string;
  region: string;
  computeHours: string;
  storageGB: string;
  writtenDataGB: string;
  dataTransferGB: string;
  branches: number;
  branchList: Array<{
    id: string;
    name: string;
    created_at: string;
    current_state: string;
    default: boolean;
  }>;
  estimatedCosts: {
    compute: string;
    storage: string;
    dataTransfer: string;
  };
  totalEstimatedCost: string;
  lastUpdated: string;
}

export function useNeonMetrics(projectId: string | null, enabled: boolean = true) {
  const [metrics, setMetrics] = useState<NeonMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    if (!projectId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching Neon metrics for project:', projectId);

      const { data, error: invokeError } = await supabase.functions.invoke('get-neon-metrics', {
        body: { projectId }
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Neon metrics fetched successfully:', data);
      setMetrics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Neon metrics';
      console.error('Error fetching Neon metrics:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Erro ao buscar métricas",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [projectId, enabled]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}
