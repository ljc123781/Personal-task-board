import type { Task } from '../types';

/**
 * 合成数据仅用于开发预览和测试。
 * 应用默认不会把它写入 localStorage；只有显式打开 ?preview=1 时才会展示。
 */
export const seedTasks: Task[] = [
  {
    id: 'seed-reading-list',
    title: '整理本周阅读清单',
    description: '从收藏夹里挑出 3 篇文章，安排到本周的碎片时间。',
    status: 'todo',
    createdAt: '2026-10-20T09:20:00+08:00',
    updatedAt: '2026-10-20T09:20:00+08:00',
    completedAt: null,
  },
  {
    id: 'seed-project-readme',
    title: '写项目 README',
    description: '补充安装、启动和已知问题说明，确保新同学能独立跑起来。',
    status: 'doing',
    createdAt: '2026-10-20T08:10:00+08:00',
    updatedAt: '2026-10-20T10:24:00+08:00',
    completedAt: null,
  },
  {
    id: 'seed-empty-state',
    title: '修复筛选空状态',
    description: '检查切换标签时是否展示正确的空状态文案。',
    status: 'doing',
    createdAt: '2026-10-19T21:40:00+08:00',
    updatedAt: '2026-10-20T09:05:00+08:00',
    completedAt: null,
  },
  {
    id: 'seed-dentist',
    title: '预约牙医',
    description: '查找附近的诊所并确认营业时间。',
    status: 'todo',
    createdAt: '2026-10-19T18:15:00+08:00',
    updatedAt: '2026-10-19T18:15:00+08:00',
    completedAt: null,
  },
  {
    id: 'seed-weekly-report',
    title: '完成周报',
    description: '汇总本周进展和下周计划。',
    status: 'done',
    createdAt: '2026-10-19T16:30:00+08:00',
    updatedAt: '2026-10-19T17:45:00+08:00',
    completedAt: '2026-10-19T17:45:00+08:00',
  },
  {
    id: 'seed-downloads',
    title: '清理下载目录',
    description: '删除临时安装包和过期文件。',
    status: 'done',
    createdAt: '2026-10-18T20:10:00+08:00',
    updatedAt: '2026-10-18T20:40:00+08:00',
    completedAt: '2026-10-18T20:40:00+08:00',
  },
];
