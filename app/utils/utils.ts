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

export const productTypesInfo = [
  {
    type: 'filament',
    letter: '0',
  },
  {
    type: 'printer',
    letter: 'p',
  },
];

// Used when certain form fields are modified.
export const modFormFieldStyles = {
  label: 'text-blue-500 font-bold',
};

export const textFormFieldEquiv = (
  trueVal: string | null,
  formVal: string,
) => {
  return trueVal === formVal || (trueVal == null && formVal === '');
};

export const enumFormFieldEquiv = (
  trueVal: string | null,
  formVal: string,
) => {
  return trueVal === formVal || (trueVal == null && formVal === '[null]');
};
