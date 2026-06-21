import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip, usePatchItinerary, useGenerateItinerary } from '../hooks/useTripDetails.js';
import { useLatestHealthScore, useComputeHealthScore } from '../hooks/useHealthScore.js';
import { ItineraryDayCard } from '../components/trip/ItineraryDayCard.jsx';
import { ActivityFormModal } from '../components/trip/ActivityFormModal.jsx';
import { OverallScoreRing } from '../components/healthScore/OverallScoreRing.jsx';
import { MetricBreakdownGrid } from '../components/healthScore/MetricBreakdownGrid.jsx';
import { ScoreExplanationPanel } from '../components/healthScore/ScoreExplanationPanel.jsx';
import { RecalculateScoreButton } from '../components/healthScore/RecalculateScoreButton.jsx';
import { Button } from '../components/common/Button.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useUpdateTrip } from '../hooks/useTripDetails.js';

const TABS = ['Itinerary', 'Health Score', 'AI Recommendations'];

export function TripDetails() {
  const { tripId } = useParams();
  const { data: trip, isLoading } = useTrip(tripId);
  const patchItinerary = usePatchItinerary(tripId);
  const generateItinerary = useGenerateItinerary(tripId);
  const { data: score } = useLatestHealthScore(tripId);
  const computeScore = useComputeHealthScore(tripId);
  const updateTrip = useUpdateTrip(tripId);

  const [activeTab, setActiveTab] = useState('Itinerary');
  const [modalState, setModalState] = useState(null); // { day, activity? }
  const [generationError, setGenerationError] = useState(null);


  console.log('Trip ID:', tripId);
  console.log('Trip data:', trip);
  console.log('Trip score data:', score);
  console.log('Compute score mutation state:', computeScore);

  if (isLoading || !trip) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // The itinerary is marked stale relative to the score the moment the
  // trip is edited AFTER the score was computed -- this is a comparison,
  // not a stored flag, so it can never drift out of sync with reality.
  const isStale = score ? new Date(trip.updatedAt) > new Date(score.createdAt) : false;

  function handleAddActivity(day) {
    setModalState({ day });
  }

  function handleEditActivity(day, activity) {
    setModalState({ day, activity });
  }

  async function handleRemoveActivity(day, activityId) {
    await patchItinerary.mutateAsync({ action: 'removeActivity', day, activityId });
  }

  async function handleModalSubmit(form) {
    if (modalState.activity) {
      await patchItinerary.mutateAsync({
        action: 'updateActivity',
        day: modalState.day,
        activityId: modalState.activity._id,
        updates: form,
      });
    } else {
      await patchItinerary.mutateAsync({ action: 'addActivity', day: modalState.day, activity: form });
    }
    setModalState(null);
  }

  async function handleConfirmTrip() {
  await updateTrip.mutateAsync({ status: 'confirmed' });
}

  async function handleGenerate() {
    setGenerationError(null);
    try {
      await generateItinerary.mutateAsync({ pace: 'moderate' });
    } catch (err) {
      // A known, expected failure mode (per the backend's design) -- shown
      // as a specific, retryable message, not a generic crash state.
      setGenerationError(err.response?.data?.error?.message ?? 'AI generation failed. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Trip header -- always visible regardless of active tab, so the
          score stays in view even while editing the itinerary. */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{trip.title}</h1>
          <p className="text-sm text-ink-muted">
            {trip.destination.city}, {trip.destination.country}
          </p>
          <p className="mt-1 font-mono tabular text-xs text-ink-muted">
            {new Date(trip.startDate).toLocaleDateString()} &ndash; {new Date(trip.endDate).toLocaleDateString()}
            {' \u00b7 '}
            {trip.budget.total} {trip.budget.currency}
          </p>
        </div>
        {trip.status === 'draft' && (
  <Button onClick={handleConfirmTrip} isLoading={updateTrip.isPending} className="shrink-0">
    Confirm trip
  </Button>
)}
        {score && (
          <button onClick={() => setActiveTab('Health Score')} className="shrink-0">

            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:bg-bg">
              <span className="font-mono tabular text-lg font-semibold text-ink">{score.overallScore}</span>
              <span className="text-xs text-ink-muted">health score</span>
            </div>
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-ink-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Itinerary' && (
        <div className="space-y-4">
          {generationError && (
            <p className="rounded-lg bg-score-poor/10 px-3 py-2 text-sm text-score-poor">{generationError}</p>
          )}

          {trip.itinerary.length === 0 ? (
            <EmptyState
              title="No itinerary yet"
              description="Generate an AI itinerary based on your destination, dates, and budget, or add activities manually below."
              action={
                <Button onClick={handleGenerate} isLoading={generateItinerary.isPending}>
                  Generate with AI
                </Button>
              }
            />
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={handleGenerate} isLoading={generateItinerary.isPending}>
                  Regenerate with AI
                </Button>
              </div>
              {trip.itinerary.map((day) => (
                <ItineraryDayCard
                  key={day.day}
                  day={day}
                  onAddActivity={handleAddActivity}
                  onEditActivity={handleEditActivity}
                  onRemoveActivity={handleRemoveActivity}
                />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'Health Score' && (
        <div className="space-y-5">
          {!score ? (
            <EmptyState
              title="No health score yet"
              description="Compute a score to see budget efficiency, pace, balance, and coverage for this trip."
              action={
                <Button
  onClick={() => {
    console.log('Compute health score button clicked');
    computeScore.mutate();
  }}
  isLoading={computeScore.isPending}
>
  Compute health score
</Button>
              }
            />
          ) : (
            <>
              <RecalculateScoreButton
                onRecalculate={() => computeScore.mutate()}
                isLoading={computeScore.isPending}
                isStale={isStale}
              />
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <OverallScoreRing score={score.overallScore} />
                  <div className="flex-1">
                    <MetricBreakdownGrid metrics={score.metrics} />
                  </div>
                </div>
                <div className="mt-5">
                  <ScoreExplanationPanel explanation={score.explanation} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'AI Recommendations' && (
        <div className="space-y-3">
          {score?.explanation?.recommendations?.length > 0 ? (
            score.explanation.recommendations.map((rec, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface p-4 text-sm text-ink">
                {rec}
              </div>
            ))
          ) : (
            <EmptyState
              title="No recommendations yet"
              description="Compute a health score to get AI-generated suggestions tied to your trip's lowest-scoring areas."
            />
          )}
        </div>
      )}

      {modalState && (
        <ActivityFormModal
          initialValues={modalState.activity}
          onSubmit={handleModalSubmit}
          onClose={() => setModalState(null)}
          isLoading={patchItinerary.isPending}
        />
      )}
    </div>
  );
}