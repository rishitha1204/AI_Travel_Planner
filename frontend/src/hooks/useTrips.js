import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../services/tripService.js';

export function useTrips(params = {}) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => tripService.listTrips(params),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tripService.createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
