import type { Theme } from '../lib/theme';
import type { TaskStatus } from '../types';

interface AppHeaderProps {
  total: number;
  counts: Record<TaskStatus, number>;
  theme: Theme;
  onToggleTheme: () => void;
  onCreate?: () => void;
  createDisabledReason?: string;
}

export function AppHeader({
  total,
  counts,
  theme,
  onToggleTheme,
  onCreate,
  createDisabledReason,
}: AppHeaderProps) {
  const canCreate = Boolean(onCreate);
  const disabledReason = createDisabledReason ?? '当前无法新建任务。';
  const stageNoteId = 'create-task-disabled-note';

  return (
    <header className="app-header">
      <div className="app-header__top">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="m5 12.5 4.2 4.2L19 7" />
            </svg>
          </span>
          <div className="brand__copy">
            <p className="eyebrow">Personal Task Board</p>
            <h1>我的任务</h1>
          </div>
        </div>

        <div className="app-header__actions">
          <div className="header-tools">
            <span className="local-badge">
              <span className="local-badge__dot" aria-hidden="true" />
              仅保存在本机
            </span>
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label="深色模式"
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              <span aria-hidden="true">
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" focusable="false">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={onCreate}
            disabled={!canCreate}
            title={canCreate ? undefined : disabledReason}
            aria-describedby={canCreate ? undefined : stageNoteId}
          >
            <span className="button__plus" aria-hidden="true">
              +
            </span>
            新建任务
          </button>
        </div>
      </div>

      <div className="app-header__meta">
        <div className="intro">
          <p>把要做的事放在一个地方，专注当下这一件。</p>
          {!canCreate && (
            <p className="stage-note" id={stageNoteId}>
              {disabledReason}
            </p>
          )}
        </div>

        <dl className="summary" aria-label="任务统计">
          <div className="summary__item">
            <dt>全部</dt>
            <dd>{total}</dd>
          </div>
          <div className="summary__item">
            <dt>待处理</dt>
            <dd>{counts.todo}</dd>
          </div>
          <div className="summary__item">
            <dt>进行中</dt>
            <dd>{counts.doing}</dd>
          </div>
          <div className="summary__item">
            <dt>已完成</dt>
            <dd>{counts.done}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
