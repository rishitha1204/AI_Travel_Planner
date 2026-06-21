import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthScoreService } from '../services/healthScoreService.js';

export function useLatestHealthScore(tripId) {
  return useQuery({
    queryKey: ['healthScore', tripId, 'latest'],
    queryFn: () => healthScoreService.getLatestScore(tripId),
    enabled: !!tripId,
    retry: false, // a 404 here just means "no score yet" -- not worth retrying
  });
}

export function useHealthScoreHistory(tripId) {
  return useQuery({
    queryKey: ['healthScore', tripId, 'history'],
    queryFn: () => healthScoreService.getScoreHistory(tripId),
    enabled: !!tripId,
  });
}

// Deliberately a manual mutation, never auto-triggered on itinerary edits --
// recalculation costs a real Gemini call, so the UI surfaces a "stale, want
// to recalculate?" affordance instead of recomputing silently on every change.
export function useComputeHealthScore(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => healthScoreService.computeScore(tripId),
    onSuccess: (score) => {
      queryClient.setQueryData(['healthScore', tripId, 'latest'], score);
      queryClient.invalidateQueries({ queryKey: ['healthScore', tripId, 'history'] });
    },
  });
}