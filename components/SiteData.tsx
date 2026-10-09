'use client';
import { createContext, useContext } from 'react';
import type { FontAsset, TypographySettings } from './GlobalTypography';
import type { PageTextRow } from '../lib/usePageTexts';

export type SiteBootstrap = {
  settings: TypographySettings & Record<string, unknown>;
  fonts: FontAsset[];
  content: Record<string, unknown>;
  pageTexts: PageTextRow[];
};
const SiteDataContext = createContext<SiteBootstrap>({ settings: {}, fonts: [], content: {}, pageTexts: [] });
export function SiteData({ data, children }: { data: SiteBootstrap; children: React.ReactNode }) {
  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}
export function useSiteData() { return useContext(SiteDataContext); }
