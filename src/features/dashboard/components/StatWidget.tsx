import type { TDashboardWidget } from '../types';

interface StatWidgetProps {
  widget: TDashboardWidget;
  isLoading?: boolean;
}

export function StatWidget({ widget, isLoading }: StatWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer ${widget.color}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-opacity-10 ${widget.color}`}>
          <span className="text-2xl">{widget.icon}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {widget.count?.toLocaleString() ?? '---'}
          </p>
          <p className="text-sm text-gray-500">{widget.description}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">Voir détails</span>
          <span className="text-sm text-indigo-600">→</span>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  widgets: TDashboardWidget[];
  isLoading?: boolean;
}

export function StatsGrid({ widgets, isLoading }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {widgets.map((widget) => (
        <StatWidget key={widget.id} widget={widget} isLoading={isLoading} />
      ))}
    </div>
  );
}
