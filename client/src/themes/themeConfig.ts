export type ThemeName = 'friendly' | 'bold';
export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
}
export const themes: Theme[] = [{
  name: 'friendly',
  label: 'Soft & Friendly',
  description: 'Warm pastels with cozy, welcoming vibes'
}, {
  name: 'bold',
  label: 'Bold Modern',
  description: 'High contrast energy with vibrant colors'
}];
export const getThemeClass = (theme: ThemeName): string => {
  return `theme-${theme}`;
};