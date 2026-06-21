import { MetricBar } from './MetricBar.jsx';

const ORDER = ['budgetEfficiency', 'travelPace', 'activityBalance', 'destinationCoverage'];

export function MetricBreakdownGrid({ metrics }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {ORDER.map((key) => (
        <MetricBar key={key} metricKey={key} score={metrics[key].score} raw={metrics[key].raw} />
      ))}
    </div>
  );
}