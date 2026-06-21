import { healthScoreService } from './healthScore.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const computeScore = catchAsync(async (req, res) => {
  const score = await healthScoreService.generate(req.params.tripId, req.user.id, req.requestId);
  res.status(201).json({ success: true, data: { score } });
});

export const getLatestScore = catchAsync(async (req, res) => {
  const score = await healthScoreService.getLatest(req.params.tripId, req.user.id);
  res.status(200).json({ success: true, data: { score } });
});

export const getScoreHistory = catchAsync(async (req, res) => {
  const scores = await healthScoreService.getHistory(req.params.tripId, req.user.id);
  res.status(200).json({ success: true, data: { scores } });
});

export const getScoreById = catchAsync(async (req, res) => {
  const score = await healthScoreService.getById(req.params.tripId, req.params.scoreId, req.user.id);
  res.status(200).json({ success: true, data: { score } });
});