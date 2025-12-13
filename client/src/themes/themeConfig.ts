export type ThemeName = 'lavender' | 'friendly' | 'bold' | 'royal';
export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
}
export const themes: Theme[] = [{
  name: 'lavender',
  label: 'Lavender Light',
  description: 'Soft pastels with calming lavender tones'
}, {
  name: 'friendly',
  label: 'Soft & Friendly',
  description: 'Warm pastels with cozy, welcoming vibes'
}, {
  name: 'bold',
  label: 'Bold Modern',
  description: 'High contrast energy with vibrant colors'
}, {
  name: 'royal',
  label: 'Royal Lavender',
  description: 'Rich, deep purples with a regal touch'
}];
export const getThemeClass = (theme: ThemeName): string => {
  return `theme-${theme}`;
};