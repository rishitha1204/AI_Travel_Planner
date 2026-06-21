import { tripService } from './trip.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const listTrips = catchAsync(async (req, res) => {
  const result = await tripService.listTrips(req.user.id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const createTrip = catchAsync(async (req, res) => {
  const trip = await tripService.createTrip(req.user.id, req.body);
  res.status(201).json({ success: true, data: { trip } });
});

export const getTrip = catchAsync(async (req, res) => {
  const trip = await tripService.getTrip(req.params.tripId, req.user.id);
  res.status(200).json({ success: true, data: { trip } });
});

export const updateTrip = catchAsync(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.tripId, req.user.id, req.body);
  res.status(200).json({ success: true, data: { trip } });
});

export const deleteTrip = catchAsync(async (req, res) => {
  await tripService.deleteTrip(req.params.tripId, req.user.id);
  res.status(204).send();
});

export const patchItinerary = catchAsync(async (req, res) => {
  const trip = await tripService.patchItinerary(req.params.tripId, req.user.id, req.body);
  res.status(200).json({ success: true, data: { trip } });
});