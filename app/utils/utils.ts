export type ThemeColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral';

export type ScrapeStatus = 'pending' | 'active' | 'paused' | 'archived';

export const icons = {
  error: 'solar:danger-circle-linear',
  success: 'solar:check-circle-linear',
};
