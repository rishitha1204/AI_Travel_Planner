import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/tripService.js';

export function useTrip(tripId) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => tripService.getTrip(tripId),
    enabled: !!tripId,
  });
}

export function useUpdateTrip(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tripService.updateTrip(tripId, payload),
    onSuccess: (trip) => {
      queryClient.setQueryData(['trips', tripId], trip);
      queryClient.invalidateQueries({ queryKey: ['trips'], exact: true });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId) => tripService.deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

// Covers add/update/remove activity -- the backend exposes these as one
// discriminated-union PATCH endpoint, and the hook mirrors that 1:1 rather
// than splitting into three hooks for no real benefit.
export function usePatchItinerary(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch) => tripService.patchItinerary(tripId, patch),
    onSuccess: (trip) => {
      queryClient.setQueryData(['trips', tripId], trip);
    },
  });
}

export function useGenerateItinerary(tripId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => tripService.generateItinerary(tripId, params),
    onSuccess: ({ trip }) => {
      queryClient.setQueryData(['trips', tripId], trip);
    },
  });
}