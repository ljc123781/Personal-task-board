import { EMPTY_STATE_COPY } from '../constants';
import type { TaskFilter } from '../types';

interface EmptyStateProps {
  filter: TaskFilter;
}

export function EmptyState({ filter }: EmptyStateProps) {
  const copy = EMPTY_STATE_COPY[filter];

  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <rect x="9" y="7" width="30" height="34" rx="7" />
          <path d="M17 16h14M17 23h9" />
          <path d="m26.5 32 3 3 6-7" />
        </svg>
      </span>
      <h3>{copy.title}</h3>
      <p>{copy.description}</p>
    </div>
  );
}
