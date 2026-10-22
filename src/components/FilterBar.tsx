import { FILTERS } from '../constants';
import type { TaskFilter } from '../types';

interface FilterBarProps {
  value: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (filter: TaskFilter) => void;
}

export function FilterBar({ value, counts, onChange }: FilterBarProps) {
  return (
    <nav className="filter-bar" aria-label="按状态筛选任务">
      {FILTERS.map((filter) => {
        const isActive = filter.value === value;

        return (
          <button
            key={filter.value}
            type="button"
            className={`filter-tab${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(filter.value)}
          >
            <span>{filter.label}</span>
            <span className="filter-tab__count">{counts[filter.value]}</span>
          </button>
        );
      })}
    </nav>
  );
}
