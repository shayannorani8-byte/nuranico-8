export const ABOUT_GRADIENT_KEY = 'about_gradient_color';
export const DEFAULT_ABOUT_GRADIENT = '#292928';
export function aboutGradientColor(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_ABOUT_GRADIENT;
}
export function readAboutGradient(rows: {page:string;text_key:string;value_en?:string|null}[]) {
  return aboutGradientColor(rows.find(row => row.page === 'site-config' && row.text_key === ABOUT_GRADIENT_KEY)?.value_en);
}

export const PORTFOLIO_GRADIENT_KEY = 'portfolio_gradient_color';
export const DEFAULT_PORTFOLIO_GRADIENT = '#292928';
export function readPortfolioGradient(rows: {page:string;text_key:string;value_en?:string|null}[]) {
  return aboutGradientColor(rows.find(row => row.page === 'site-config' && row.text_key === PORTFOLIO_GRADIENT_KEY)?.value_en);
}
