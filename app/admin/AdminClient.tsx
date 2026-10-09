'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './admin-ui.css';
import { AdminLocaleProvider, useAdminLocale } from './AdminLocale';
import {projectSections,sectionName} from '../../components/PortfolioCard';
import ProjectMediaEditor from './ProjectMediaEditor';
import MediaPicker, { type MediaAsset } from './MediaPicker';
import { isVideoAsset } from '../../lib/media';

type Section =
  | 'dashboard'
  | 'projects'
  | 'media'
  | 'bts'
  | 'hero'
  | 'brands'
  | 'services'
  | 'content'
  | 'settings';

type Project = {
  brand_name?: string | null;
  bts_media_ids?: number[] | null;
  id: number;
  title_fa: string;
  title_en: string | null;
  description_fa: string | null;
  description_en: string | null;
  category: string;
  cover_url: string | null;
  media_url: string | null;
  media_type: string | null;
  preview_url: string | null;
  preview_type: string | null;
  preview_enabled: boolean | null;
  featured: boolean | null;
  published: boolean | null;
  sort_order: number | null;
};

type FontAsset = {
  id: number;
  name: string;
  family_name: string;
  file_url: string;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  format: string;
  font_weight: number;
  font_style: string;
  created_at?: string | null;
};

type HeroSlide = {
  id: number;
  title_fa: string | null;
  title_en: string | null;
  description_fa: string | null;
  description_en: string | null;
  media_url: string | null;
  media_type: string;
  button_text_fa: string | null;
  button_text_en: string | null;
  button_url: string | null;
  sort_order: number;
  published: boolean;
};

type Brand = {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  published: boolean | null;
  sort_order: number | null;
};

type Service = {
  id: number;
  title_en: string;
  title_fa: string | null;
  description_en: string | null;
  description_fa: string | null;
  published: boolean;
  sort_order: number;
};

type Settings = {
  id?: number;
  heading_color: string;
  logo_color: string;
  link_color: string;
  nav_bg: string;
  nav_text: string;
  nav_active: string;
  button_text: string;
  button_hover: string;
  card_bg: string;
  card_text: string;
  tag_color: string;
  footer_bg: string;
  footer_text: string;
  border_color: string;

  brands_bg: string;
  brands_text: string;
  brands_muted: string;
  brands_hover: string;

  contact_bg: string;
  contact_text: string;
  contact_muted: string;
  contact_button: string;
  contact_button_text: string;

  bg_color: string;
  text_color: string;
  button_color: string;
  surface_color: string;
  muted_color: string;
  logo_url: string;
  font_en: string;
  font_fa: string;
  heading_size: number;
  body_size: number;
  small_size: number;
  heading_weight: number;
  body_weight: number;
  letter_spacing: number;

  heading_size_en: number;
  heading_size_fa: number;
  body_size_en: number;
  body_size_fa: number;
  small_size_en: number;
  small_size_fa: number;
  line_height_en: number;
  line_height_fa: number;
  letter_spacing_en: number;
  letter_spacing_fa: number;
};

type PageText = {
  id: number;
  page: string;
  text_key: string;
  label: string | null;
  value_en: string;
  value_fa: string;
  sort_order: number;
};

type Content = {
  id?: number;
  hero_title_fa: string;
  hero_title_en: string;
  hero_description_fa: string;
  hero_description_en: string;
  hero_button_fa: string;
  hero_button_en: string;
  about_title_fa: string;
  about_title_en: string;
  about_text_fa: string;
  about_text_en: string;
  about_image_url: string;
  contact_title_fa: string;
  contact_title_en: string;
  contact_email: string;
  contact_phone: string;
  contact_instagram: string;
  personal_instagram: string;
  start_project_url: string;
  seo_title_fa: string;
  seo_title_en: string;
  seo_description_fa: string;
  seo_description_en: string;
};

const navigation: { group: string; items: { id: Section; label: string; description: string; icon: string }[] }[] = [
  { group: 'Workspace', items: [
    { id: 'dashboard', label: 'Overview', description: 'Your content at a glance', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  ] },
  { group: 'Website content', items: [
    { id: 'projects', label: 'Projects', description: 'Portfolio, galleries and publication', icon: 'M3 7h18v14H3zM8 7V3h8v4M3 12h18' },
    { id: 'bts', label: 'Behind the scenes', description: 'Project galleries and independent files', icon: 'M3 6h18v15H3zM8 6l2-3h4l2 3M9 13a3 3 0 1 0 6 0 3 3 0 0 0-6 0' },
    { id: 'hero', label: 'Hero slides', description: 'The first impression of your website', icon: 'M3 4h18v16H3zM3 15l5-5 4 4 3-3 6 6' },
    { id: 'brands', label: 'Brands', description: 'Clients, logos and links', icon: 'M12 3l9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8' },
    { id: 'services', label: 'Services', description: 'What your studio offers', icon: 'M4 5h16M4 12h16M4 19h16M8 3v4M16 10v4M10 17v4' },
    { id: 'content', label: 'Pages & text', description: 'English and Persian copy, contact and SEO', icon: 'M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6' },
  ] },
  { group: 'Assets & appearance', items: [
    { id: 'media', label: 'Media library', description: 'Upload once. Reuse anywhere.', icon: 'M3 3h18v18H3zM3 16l6-6 4 4 3-3 5 5M15 7h.01' },
    { id: 'settings', label: 'Settings', description: 'Logo, colors and bilingual typography', icon: 'M4 5h16M4 12h16M4 19h16M9 3v4M15 10v4M7 17v4' },
  ] },
];
const navigationItems = navigation.flatMap(group => group.items);

function SectionIcon({ path }: { path: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

function fieldLanguage(label: string, value: unknown) {
  return /[\u0600-\u06ff]/.test(label + String(value || '')) ? 'fa' : 'en';
}

const destinations = [
  ['home', 'Main on homepage'],
  ['work', 'Work'],
  ['film', 'Film & Teasers'],
  ['photography', 'Photography'],
  ['content', 'Content'],
  ['featured', 'Featured'],
  ['bts', 'Behind the Scenes'],
] as const;

const emptySettings: Settings = {
  heading_color: '#f1efe9',
  logo_color: '#f1efe9',
  link_color: '#f1efe9',
  nav_bg: '#171716',
  nav_text: '#f1efe9',
  nav_active: '#ffffff',
  button_text: '#151514',
  button_hover: '#ffffff',
  card_bg: '#1d1d1b',
  card_text: '#f1efe9',
  tag_color: '#99958d',
  footer_bg: '#111110',
  footer_text: '#e8e5de',
  border_color: '#3a3936',

  brands_bg: '#e2dfd8',
  brands_text: '#171716',
  brands_muted: '#68655f',
  brands_hover: '#d6d2c9',

  contact_bg: '#e7e4dd',
  contact_text: '#151514',
  contact_muted: '#66635e',
  contact_button: '#151514',
  contact_button_text: '#eeeae2',

  bg_color: '#171716',
  text_color: '#f1efe9',
  button_color: '#e9e6df',
  surface_color: '#101010',
  muted_color: '#99958d',
  logo_url: '',
  font_en: 'DM Sans',
  font_fa: 'Yekan Bakh',
  heading_size: 48,
  body_size: 16,
  small_size: 11,
  heading_weight: 600,
  body_weight: 400,
  letter_spacing: 0,

  heading_size_en: 100,
  heading_size_fa: 100,
  body_size_en: 14,
  body_size_fa: 14,
  small_size_en: 9,
  small_size_fa: 9,
  line_height_en: 1.15,
  line_height_fa: 1.35,
  letter_spacing_en: 0,
  letter_spacing_fa: 0,
};

const emptyContent: Content = {
  hero_title_fa: '',
  hero_title_en: '',
  hero_description_fa: '',
  hero_description_en: '',
  hero_button_fa: '',
  hero_button_en: '',
  about_title_fa: '',
  about_title_en: '',
  about_text_fa: '',
  about_text_en: '',
  about_image_url: '',
  contact_title_fa: '',
  contact_title_en: '',
  contact_email: '',
  contact_phone: '',
  contact_instagram: '',
  personal_instagram: '',
  start_project_url: '/contact',
  seo_title_fa: '',
  seo_title_en: '',
  seo_description_fa: '',
  seo_description_en: '',
};

async function api<T = any>(
  resource: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/admin/cms?resource=${encodeURIComponent(resource)}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: method === 'GET' ? AbortSignal.timeout(12000) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const {t} = useAdminLocale();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <input lang={fieldLanguage(label, value)} dir={fieldLanguage(label, value) === 'fa' ? 'rtl' : 'ltr'} type={type} step={type === 'number' ? 'any' : undefined} value={value ?? ''} placeholder={t(placeholder)} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const {t} = useAdminLocale();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <textarea lang={fieldLanguage(label, value)} dir={fieldLanguage(label, value) === 'fa' ? 'rtl' : 'ltr'} rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const {t} = useAdminLocale();
  return (
    <label className="toggle">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      <span>{t(label)}</span>
    </label>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const {t} = useAdminLocale();
  return (
    <div className="section-header">
      <div>
        <h1>{t(title)}</h1>
        {description && <p>{t(description)}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  const {t} = useAdminLocale();
  return <div className="empty">{t(text)}</div>;
}

function textGroup(key: string) {
  if (/^(nav_|menu_|footer_|instagram|start_project)/.test(key)) return 'Navigation & footer';
  if (/^(hero_|scroll_|slide_)/.test(key)) return 'Hero';
  if (/^(work_|projects?_|gallery_|photo_|video_|bts_|film_|content_|filter_|card_|view_|previous_projects|next_projects|loading_projects|no_bts)/.test(key)) return 'Projects & galleries';
  if (/^(about_|team_)/.test(key)) return 'About';
  if (/^(brands?_|clients?_|previous_clients|next_clients)/.test(key)) return 'Brands';
  if (/^(services?_|film_teasers_)/.test(key)) return 'Services';
  if (/^(contact_|form_|email_|phone_)/.test(key)) return 'Contact';
  return 'Labels & controls';
}

export default function AdminPage() {return <AdminLocaleProvider><AdminWorkspace /></AdminLocaleProvider>;}

function AdminWorkspace() {
  const {lang,t,toggle} = useAdminLocale();
  const [section, setSection] = useState<Section>('dashboard');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [pageTextFilter, setPageTextFilter] = useState('home');
  const [pageTextSearch, setPageTextSearch] = useState('');
  const [dirtyTexts, setDirtyTexts] = useState<number[]>([]);
  const [mediaPage, setMediaPage] = useState(0);
  const [labelIds, setLabelIds] = useState<number[]>([]);
  const [brandLabel, setBrandLabel] = useState('');
  const [projectLabel, setProjectLabel] = useState('');
  const [assetDestinations, setAssetDestinations] = useState<string[]>([]);
  const [projectStep, setProjectStep] = useState(0);
  const [uploadsActive,setUploadsActive]=useState(0);
  const projectUploadBusy=(busy:boolean)=>setUploadsActive(current=>Math.max(0,current+(busy ? 1 : -1)));
  const [settingsTab,setSettingsTab] = useState('identity');
  const [savedSettings,setSavedSettings] = useState<Settings | null>(null);
  const [fontSearch,setFontSearch] = useState('');
  const projectEditorSession = useRef(0);
  const currentEditorSession = projectEditorSession.current;
  const [btsSavedIds, setBtsSavedIds] = useState<number[]>([]);
  const [btsBrandName, setBtsBrandName] = useState('');
  const [btsProjectName, setBtsProjectName] = useState('');
  const [assetHome, setAssetHome] = useState('keep');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [fonts, setFonts] = useState<FontAsset[]>([]);
  const [hero, setHero] = useState<HeroSlide[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [destMap, setDestMap] = useState<Record<number, string[]>>({});
  const [projectMediaMap, setProjectMediaMap] = useState<Record<number, number[]>>({});
  const [btsMediaIds, setBtsMediaIds] = useState<number[]>([]);
  const [content, setContent] = useState<Content>(emptyContent);
  const [pageTexts, setPageTexts] = useState<PageText[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus,setProjectStatus] = useState('all');
  const [projectCategory,setProjectCategory] = useState('all');
  const [discardIntent,setDiscardIntent]=useState<{section?:Section;editor?:'project'|'hero'|'brand'|'service'} | null>(null);
  const discardCancel=useRef<HTMLButtonElement>(null),discardPanel=useRef<HTMLDivElement>(null);
  const projectSnapshot = useRef('');
  const [savedContent,setSavedContent] = useState<Content | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');

  async function refreshMedia() {
    const data = await api<{ rows: MediaAsset[] }>('media');
    setMedia(data.rows || []);
  }

  function flash(text: string) {
    setError('');
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  }

  async function loadAll() {
    setLoading(true);
    setLoadFailed(false);
    setError('');
    try {
      const data = await api<{
        projects: Project[];
        media: MediaAsset[];
        fonts: FontAsset[];
        hero: HeroSlide[];
        brands: Brand[];
        services: Service[];
        destinations: Record<number, string[]>;
        projectMedia: Record<number, number[]>;
        btsMedia: {
          id: number;
          media_asset_id: number;
          sort_order: number;
        }[];
        content: Content | null;
        pageTexts: PageText[];
        settings: Settings | null;
      }>('all');

      setProjects(data.projects || []);
      setMedia(data.media || []);
      setFonts(data.fonts || []);
      setHero(data.hero || []);
      setBrands(data.brands || []);
      setServices(data.services || []);
      setDestMap(data.destinations || {});
      setProjectMediaMap(data.projectMedia || {});
      setBtsMediaIds(
        (data.btsMedia || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(item => item.media_asset_id)
      );
      setBtsSavedIds((data.btsMedia || []).slice().sort((a,b) => a.sort_order - b.sort_order).map(item => item.media_asset_id));
      setContent({ ...emptyContent, ...(data.content || {}) });setSavedContent({ ...emptyContent, ...(data.content || {}) });
      setPageTexts(
        (data.pageTexts || []).slice().sort((a, b) => {
          const pageCompare = a.page.localeCompare(b.page);
          if (pageCompare !== 0) return pageCompare;

          const orderCompare = (a.sort_order || 0) - (b.sort_order || 0);
          if (orderCompare !== 0) return orderCompare;

          return a.id - b.id;
        })
      );
      setSettings({ ...emptySettings, ...(data.settings || {}) });
      setSavedSettings({ ...emptySettings, ...(data.settings || {}) });
    } catch (e) {
      setLoadFailed(true);
      setError(e instanceof Error ? e.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function saveBts() {
    setSaving(true);
    setError('');

    try {
      const added = btsMediaIds.filter(id => !btsSavedIds.includes(id));
      if (added.length && (btsBrandName.trim() || btsProjectName.trim())) {
        const labeled = await api<{rows:MediaAsset[]}>('media-labels','POST',{ids:added,brand_name:btsBrandName.trim() || undefined,project_name:btsProjectName.trim() || undefined});
        setMedia(current => current.map(item => labeled.rows.find(row => row.id === item.id) || item));
      }
      const result = await api<{
        rows: {
          id: number;
          media_asset_id: number;
          sort_order: number;
        }[];
      }>('bts', 'POST', {
        mediaIds: btsMediaIds,
      });

      setBtsMediaIds(
        (result.rows || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(item => item.media_asset_id)
      );

      setBtsSavedIds((result.rows || []).slice().sort((a,b) => a.sort_order - b.sort_order).map(item => item.media_asset_id));
      setBtsBrandName('');setBtsProjectName('');
      flash('Behind the scenes gallery published.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save Behind the Scenes.'
      );
    } finally {
      setSaving(false);
    }
  }

  function openProject(project:Project) {
    const legacyIds = (destMap[project.id] || []).includes('bts') ? Array.from(new Set([...(projectMediaMap[project.id] || []),...media.filter(item => item.file_url === project.media_url || (!project.media_url && !(projectMediaMap[project.id] || []).length && item.file_url === project.cover_url)).map(item => item.id)])) : [];
    const opened={...project,bts_media_ids:project.bts_media_ids ?? (legacyIds.length ? legacyIds : null)};projectSnapshot.current=JSON.stringify({row:opened,destinations:destMap[project.id] || [],mediaIds:projectMediaMap[project.id] || []});setEditingProject(opened);
  }

  async function saveProject(publish: boolean) {
    if (!editingProject) return;
    setError('');
    if (publish && !(editingProject.title_en?.trim() || editingProject.title_fa?.trim())) {setError('Add a project name before publishing.'); setProjectStep(0); return;}
    if (publish && !(editingProject.media_url || editingProject.cover_url || projectMediaMap[editingProject.id]?.length)) {setError('Add a photo or video before publishing.'); setProjectStep(1); return;}

    setSaving(true);
    try {
      const saved = await api<{ row: Project; id: number }>('projects', 'POST', {
        row: {...editingProject,category:destinations.find(([key]) => ['film','photography','content'].includes(key) && (destMap[editingProject.id] || []).includes(key))?.[1] || editingProject.category,published:publish,bts_media_ids:editingProject.bts_media_ids ?? null},
        destinations: destMap[editingProject.id] || [],
        mediaIds: projectMediaMap[editingProject.id] || [],
      });
      setProjects(current => current.some(p => p.id === saved.id)
        ? current.map(p => p.id === saved.id ? saved.row : p)
        : [...current, saved.row]);
      setDestMap(current => ({ ...current, [saved.id]: current[editingProject.id] || [] }));
      setProjectMediaMap(current => ({ ...current, [saved.id]: current[editingProject.id] || [] }));
      setEditingProject(null);
      flash(publish ? 'Project published.' : 'Project saved as a draft.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Project could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    if (!window.confirm(t('Delete this project and its links?'))) return;
    setSaving(true);
    try {
      await api(`projects&id=${id}`, 'DELETE');
      setProjects(p => p.filter(x => x.id !== id));
      setEditingProject(null);
      flash('Project deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setSaving(false);
    }
  }

  async function saveHero() {
    if (!editingHero) return;
    setSaving(true);
    try {
      const result = await api<{ row: HeroSlide }>('hero', 'POST', { row: editingHero });
      setHero(current => current.some(x => x.id === result.row.id)
        ? current.map(x => x.id === result.row.id ? result.row : x)
        : [...current, result.row]);
      setEditingHero(null);
      flash('Hero slide saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hero slide could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteHero(id: number) {
    if (!confirm(t('Delete this hero slide?'))) return;
    try {
      await api(`hero&id=${id}`, 'DELETE');
      setHero(h => h.filter(x => x.id !== id));
      flash('Hero slide deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  }

  async function saveBrand() {
    if (!editingBrand) return;
    setSaving(true);
    try {
      const result = await api<{ row: Brand }>('brands', 'POST', { row: editingBrand });
      setBrands(current => current.some(x => x.id === result.row.id)
        ? current.map(x => x.id === result.row.id ? result.row : x)
        : [...current, result.row]);
      setEditingBrand(null);
      flash('Brand saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Brand could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBrand(id: number) {
    if (!confirm(t('Delete this brand?'))) return;
    try {
      await api(`brands&id=${id}`, 'DELETE');
      setBrands(b => b.filter(x => x.id !== id));
      flash('Brand deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  }

  async function saveService() {
    if (!editingService) return;
    setSaving(true);
    try {
      const result = await api<{ row: Service }>('services', 'POST', { row: editingService });
      setServices(current => current.some(x => x.id === result.row.id)
        ? current.map(x => x.id === result.row.id ? result.row : x)
        : [...current, result.row]);
      setEditingService(null);
      flash('Service saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Service could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: number) {
    if (!confirm(t('Delete this service?'))) return;
    try {
      await api(`services&id=${id}`, 'DELETE');
      setServices(s => s.filter(x => x.id !== id));
      flash('Service deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  }

  async function saveContent() {
    setSaving(true);
    try {
      const result = await api<{ row: Content }>('content', 'POST', { row: content });
      setContent({ ...emptyContent, ...result.row });setSavedContent({ ...emptyContent, ...result.row });
      flash('Content saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Content could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!labelIds.length) {setBrandLabel('');setProjectLabel('');setAssetDestinations([]);setAssetHome('keep');}
  }, [labelIds.length]);

  function clearMediaSelection() {
    setLabelIds([]); setBrandLabel(''); setProjectLabel(''); setAssetDestinations([]); setAssetHome('keep');
  }
  function manageMedia(item:MediaAsset) {
    setLabelIds([item.id]); setBrandLabel(item.brand_name || ''); setProjectLabel(item.project_name || ''); setAssetDestinations(item.destinations || []); setAssetHome(item.show_on_home ? 'show' : 'hide');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  async function saveMediaLabels(mode:'keep'|'publish'|'draft') {
    setError('');
    if (mode === 'publish' && labelIds.some(id => !(assetDestinations.length || media.find(item => item.id === id)?.destinations?.length))) {setError('Choose a section before publishing these files.'); return;}
    setSaving(true);
    try {
      const result = await api<{rows:MediaAsset[]}>('media-labels','POST',{
        ids:labelIds, brand_name:brandLabel.trim() || undefined, project_name:projectLabel.trim() || undefined,
        destinations:assetDestinations.length ? assetDestinations : undefined,
        published:mode === 'keep' ? undefined : mode === 'publish',
        show_on_home:mode === 'draft' ? false : assetHome === 'keep' ? undefined : assetHome === 'show',
      });
      setMedia(current => current.map(item => result.rows.find(row => row.id === item.id) || item));
      clearMediaSelection(); flash(mode === 'publish' ? 'Files published in their sections.' : mode === 'draft' ? 'Files saved in the library as drafts.' : 'Names and placement saved.');
    } catch(e) {setError(e instanceof Error ? e.message : 'Could not save files.');} finally {setSaving(false);}
  }
  async function uploadProjectFiles(uploaded:MediaAsset[] | undefined, session:number, behindScenes = false) {
    await refreshMedia();
    if (!uploaded?.length || !editingProject || session !== projectEditorSession.current) return;
    const projectId = editingProject.id;
    if (behindScenes) {setEditingProject(current => current?.id === projectId ? {...current,bts_media_ids:Array.from(new Set([...(current.bts_media_ids || []),...uploaded.map(item => item.id)]))} : current);return;}
    setProjectMediaMap(current => ({...current,[projectId]:Array.from(new Set([...(current[projectId] || []),...uploaded.map(item => item.id)]))}));
    setEditingProject(current => current?.id === projectId ? {...current,
      media_url:current.media_url || uploaded[0].file_url,
      media_type:current.media_url ? current.media_type : isVideoAsset(uploaded[0]) ? 'video' : 'image',
      cover_url:current.cover_url || uploaded.find(item => !isVideoAsset(item))?.file_url || '',
      ...(!current.media_url && !current.preview_url && isVideoAsset(uploaded[0]) ? {preview_url:uploaded[0].file_url,preview_enabled:true,preview_type:'video'} : {}),
    } : current);
  }

  const visibleTexts = pageTexts.filter(row => !(['film','photography','content'].includes(row.page) && row.text_key==='projects_eyebrow') && !(['about','contact'].includes(row.page) && row.text_key==='eyebrow') && !(row.page === 'home' && /^(statement_|landscape_|keep_line_|contact_|services_eyebrow$|work_eyebrow$|about_eyebrow$|brands_eyebrow$)/.test(row.text_key)));
  function editText(id:number, field:'value_en'|'value_fa', value:string) {
    setPageTexts(current => current.map(row => row.id === id ? {...row,[field]:value} : row));
    setDirtyTexts(current => current.includes(id) ? current : [...current,id]);
  }

  async function savePageTexts() {
    setSaving(true);
    setError('');

    try {
      const result = await api<{ rows: PageText[] }>(
        'page-texts',
        'POST',
        { rows: pageTexts.filter(row => dirtyTexts.includes(row.id)) }
      );

      setPageTexts(
        (result.rows || []).slice().sort((a, b) => {
          const pageCompare = a.page.localeCompare(b.page);
          if (pageCompare !== 0) return pageCompare;

          const orderCompare = (a.sort_order || 0) - (b.sort_order || 0);
          if (orderCompare !== 0) return orderCompare;

          return a.id - b.id;
        })
      );

      setDirtyTexts([]);
      flash('Page texts saved.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Page texts could not be saved.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    setError('');setSaving(true);
    try {
      const result = await api<{ row: Settings }>('settings', 'POST', { row: settings });
      setSettings({ ...emptySettings, ...result.row });
      setSavedSettings({ ...emptySettings, ...result.row });
      flash('Settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Settings could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedia(item: MediaAsset) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, filePath: item.file_path }),
      }).then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Media delete failed.');
      });
      setMedia(m => m.filter(x => x.id !== item.id));
      flash('Media deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Media delete failed.');
    }
  }

  async function deleteFont(item: FontAsset) {
    if (!confirm(`Delete font "${item.family_name}"?`)) return;

    try {
      const response = await fetch('/api/admin/fonts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Font delete failed.');
      }

      setFonts(current => current.filter(x => x.id !== item.id));

      setSettings(current => ({
        ...current,
        font_en:
          current.font_en === item.family_name
            ? 'DM Sans'
            : current.font_en,
        font_fa:
          current.font_fa === item.family_name
            ? 'Yekan Bakh'
            : current.font_fa,
      }));

      flash('Font deleted.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Font delete failed.'
      );
    }
  }

  async function logout() {
    window.location.href = '/api/auth/signout';
  }

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return projects.filter(p => (projectStatus==='all' || (projectStatus==='published' ? p.published : !p.published)) && (projectCategory==='all' || projectSections({...p,destinations:destMap[p.id] || []}).includes(projectCategory)) && (!q || [p.title_en,p.title_fa,p.category,p.brand_name].some(v=>(v || '').toLowerCase().includes(q)))).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [projects,projectSearch,projectStatus,projectCategory,destMap]);

  const filteredMedia = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    return media.filter(m => {
      const matchesQ = !q || [m.name, m.brand_name, m.project_name, m.alt_text_en, m.alt_text_fa, m.file_type, m.mime_type, ...projects.filter(project => (project.bts_media_ids || []).includes(m.id) || (projectMediaMap[project.id] || []).includes(m.id) || [project.cover_url,project.media_url,project.preview_url].includes(m.file_url)).flatMap(project => [project.title_en,project.title_fa,project.brand_name])].some(v => (v || '').toLowerCase().includes(q));
      const matchesType = mediaFilter === 'all' || (mediaFilter === 'video' ? isVideoAsset(m) : !isVideoAsset(m));
      return matchesQ && matchesType;
    });
  }, [media, mediaSearch, mediaFilter, projects, projectMediaMap]);

  const settingsDirty = !!savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const projectDirty=!!editingProject && (projectSnapshot.current ? JSON.stringify({row:editingProject,destinations:destMap[editingProject.id] || [],mediaIds:projectMediaMap[editingProject.id] || []})!==projectSnapshot.current : !!(editingProject.title_en || editingProject.title_fa || editingProject.media_url || (projectMediaMap[0] || []).length || editingProject.bts_media_ids?.length));
  const contentDirty=!!savedContent && JSON.stringify(content)!==JSON.stringify(savedContent);
  const heroDirty=!!editingHero && (editingHero.id ? JSON.stringify(editingHero)!==JSON.stringify(hero.find(item=>item.id===editingHero.id)) : !!(editingHero.title_en || editingHero.title_fa || editingHero.media_url || editingHero.description_en || editingHero.description_fa));
  const brandDirty=!!editingBrand && (editingBrand.id ? JSON.stringify(editingBrand)!==JSON.stringify(brands.find(item=>item.id===editingBrand.id)) : !!(editingBrand.name || editingBrand.logo_url || editingBrand.website_url));
  const serviceDirty=!!editingService && (editingService.id ? JSON.stringify(editingService)!==JSON.stringify(services.find(item=>item.id===editingService.id)) : !!(editingService.title_en || editingService.title_fa || editingService.description_en || editingService.description_fa));
  const hasUnsaved=heroDirty || brandDirty || serviceDirty || uploadsActive>0 || projectDirty || settingsDirty || !!dirtyTexts.length || contentDirty || btsMediaIds.join(',')!==btsSavedIds.join(',');
  useEffect(()=>{if(!hasUnsaved)return;const handler=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[hasUnsaved]);
  function closeOtherEditor(editor:'hero'|'brand'|'service'){if(uploadsActive){setError('Wait for uploads to finish.');return;}if((editor==='hero' && heroDirty) || (editor==='brand' && brandDirty) || (editor==='service' && serviceDirty)){setDiscardIntent({editor});return;}discardOtherEditor(editor);}
  function discardOtherEditor(editor:'hero'|'brand'|'service'){if(editor==='hero')setEditingHero(null);else if(editor==='brand')setEditingBrand(null);else setEditingService(null);}
  function closeProject(){if(uploadsActive){setError('Wait for uploads to finish.');return;}if(projectDirty){setDiscardIntent({});return;}closeProjectWithoutPrompt();}
  useEffect(()=>{if(!discardIntent)return;const previous=document.activeElement as HTMLElement | null;discardCancel.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setDiscardIntent(null);if(event.key==='Tab'){const buttons=Array.from(discardPanel.current?.querySelectorAll<HTMLButtonElement>('button') || []);const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus();};},[discardIntent]);
  function closeProjectWithoutPrompt(){projectEditorSession.current++;if(editingProject?.id){setDestMap(current=>({...current,[editingProject.id]:JSON.parse(projectSnapshot.current || '{}').destinations || []}));setProjectMediaMap(current=>({...current,[editingProject.id]:JSON.parse(projectSnapshot.current || '{}').mediaIds || []}));}setEditingProject(null);}
  function setProjectMain(item:MediaAsset){if(editingProject)setProjectMediaMap(current=>({...current,[editingProject.id]:Array.from(new Set([...(current[editingProject.id] || []),...media.filter(asset=>asset.file_url===editingProject.media_url).map(asset=>asset.id),item.id]))}));setEditingProject(current=>current ? {...current,media_url:item.file_url,media_type:isVideoAsset(item) ? 'video' : 'image',preview_url:isVideoAsset(item) ? item.file_url : '',preview_enabled:isVideoAsset(item),preview_type:'video'} : current);}
  function updateProjectMedia(ids:number[]){if(!editingProject)return;const priorIds=Array.from(new Set([...(projectMediaMap[editingProject.id] || []),...media.filter(item=>item.file_url===editingProject.media_url).map(item=>item.id)]));setProjectMediaMap(current=>({...current,[editingProject.id]:ids}));const selected=ids.flatMap(id=>{const item=media.find(item=>item.id===id);return item ? [item] : [];});const mainRemoved=media.some(item=>priorIds.includes(item.id) && !ids.includes(item.id) && item.file_url===editingProject.media_url);const coverRemoved=media.some(item=>priorIds.includes(item.id) && !ids.includes(item.id) && item.file_url===editingProject.cover_url);setEditingProject(current=>current ? {...current,...((!current.media_url || mainRemoved) ? {media_url:selected[0]?.file_url || '',media_type:selected[0] && isVideoAsset(selected[0]) ? 'video' : 'image',preview_url:selected[0] && isVideoAsset(selected[0]) ? selected[0].file_url : '',preview_enabled:!!selected[0] && isVideoAsset(selected[0])} : {}),...((!current.cover_url || coverRemoved) ? {cover_url:selected.find(item=>!isVideoAsset(item))?.file_url || ''} : {})} : current);}
  const activeSection = navigationItems.find(item => item.id === section)!;
  const publishedProjects = projects.filter(project => project.published).length;

  function navigateTo(next: Section) {
    if(next!==section && uploadsActive){setError('Wait for uploads to finish.');return;}
    if(next!==section && editingProject){if(projectDirty){setDiscardIntent({section:next});return;}closeProjectWithoutPrompt();}
    if(next!==section && editingHero){if(heroDirty){setDiscardIntent({section:next,editor:'hero'});return;}discardOtherEditor('hero');}
    if(next!==section && editingBrand){if(brandDirty){setDiscardIntent({section:next,editor:'brand'});return;}discardOtherEditor('brand');}
    if(next!==section && editingService){if(serviceDirty){setDiscardIntent({section:next,editor:'service'});return;}discardOtherEditor('service');}
    setSection(next);
    setNavigationOpen(false);
    setMessage('');setError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return (
    <main className={`admin${navigationOpen ? ' menu-open' : ''}`} lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <style>{styles}</style>
      {discardIntent && <div className="admin-discard-overlay"><div ref={discardPanel} role="dialog" aria-modal="true" aria-labelledby="discard-title" className="admin-discard-dialog"><h2 id="discard-title">{t('Unsaved changes')}</h2><p>{t('Changes have not been saved. Keep editing or discard them.')}</p><div><button type="button" ref={discardCancel} className="primary" onClick={()=>setDiscardIntent(null)}>{t('Keep editing')}</button><button type="button" className="ghost" onClick={()=>{const destination=discardIntent.section;if(discardIntent.editor && discardIntent.editor!=='project')discardOtherEditor(discardIntent.editor);else closeProjectWithoutPrompt();setDiscardIntent(null);if(destination){setSection(destination);setNavigationOpen(false);setMessage('');setError('');window.scrollTo({top:0,behavior:'instant'});}}}>{t('Discard changes')}</button></div></div></div>}
      <button className="admin-nav-backdrop" aria-label={t("Close navigation")} onClick={() => setNavigationOpen(false)} />
      <aside className="sidebar" id="admin-sidebar" aria-label={t("Admin navigation")}>
        <a className="admin-brand" href="/" target="_blank" rel="noreferrer">
          <span className="admin-brand-symbol">N<span>®</span></span>
          <span><strong>NURANICO</strong><small>{t("Studio workspace")}</small></span>
        </a>
        <nav>
          {navigation.map(group => <div className="nav-group" key={t(group.group)}>
            <p className="nav-group-label">{t(group.group)}</p>
            {group.items.map(item => <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined} className={section === item.id ? 'nav-active' : ''} onClick={() => navigateTo(item.id)}>
              <SectionIcon path={item.icon} /><span>{t(item.label)}</span>
              {item.id === 'projects' && <small>{projects.length}</small>}
              {item.id === 'media' && <small>{media.length}</small>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-footer"><span>{t("Website management")}</span><button className="logout" onClick={logout}>{t("Log out")}<span aria-hidden="true">↗</span></button></div>
      </aside>
      <section className="workspace" aria-label={t(activeSection.label)}>
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><button className="admin-menu-toggle" aria-label={t("Toggle navigation")} aria-controls="admin-sidebar" aria-expanded={navigationOpen} onClick={() => setNavigationOpen(!navigationOpen)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button><span>{t("Workspace")}</span><span aria-hidden="true">/</span><strong>{t(activeSection.label)}</strong></div>
          <button className="admin-language-toggle" type="button" onClick={toggle} aria-label={lang === 'fa' ? 'Switch admin to English' : 'تغییر زبان پنل به فارسی'}>{lang === 'fa' ? 'EN' : 'FA'}</button><a className="admin-site-link" href="/" target="_blank" rel="noreferrer">{t("View website")}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg></a>
        </header>
        <div className="workspace-content">
        {(message || error) && <div role={error ? 'alert' : 'status'} className={error ? 'notice error' : 'notice'}>{t(error || message)}</div>}
        {loading ? <div className="admin-loading-state" role="status"><span className="admin-loader" />{t("Loading your workspace…")}</div> : loadFailed ? <div className="panel"><h2>{t("Your workspace could not be loaded.")}</h2><p>{t("Try again to load your existing content before editing.")}</p><button className="primary" onClick={() => void loadAll()}>{t("Try again")}</button></div> : <>
        {section === 'dashboard' && (
          <>
            <div className="dashboard-intro"><span className="admin-eyebrow">NURANICO / CONTENT STUDIO</span><SectionHeader title={t("Make your next update.")} description="Projects, media and every detail of your website, in one workspace." /></div>
            <div className="stats">
              {([
                ['projects', t("Projects"), projects.length, `${publishedProjects} ${t('Published')} · ${projects.length - publishedProjects} ${t('Draft')}`],
                ['media', t("Media files"), media.length, t("Your reusable asset library")],
                ['hero', t("Hero slides"), hero.length, t("Homepage introductions")],
                ['brands', t("Brands"), brands.length, t("The people you work with")],
                ['services', t("Services"), services.length, t("What your studio offers")],
              ] as [Section, string, number, string][]).map(([id, label, value, detail]) => (
                <button className="stat" key={id} onClick={() => navigateTo(id)}><span>{t(label)}<span aria-hidden="true">↗</span></span><b>{value}</b><small>{t(detail)}</small></button>
              ))}
            </div>
            <div className="dashboard-section-head"><h2>{t("A place for every update")}</h2><p>{t("Choose where you want to start.")}</p></div>
            <div className="quick-actions">
              {([
                ['projects', '01', t("Create a project"), t("Name the project, upload its media and behind-the-scenes, then publish.")],
                ['media', '02', t("Find existing files"), t("Search your library and reuse photos and videos in a project.")],
                ['content', '03', t("Refine your pages"), t("Keep English and Persian copy, contact details and SEO in sync.")],
              ] as [Section, string, string, string][]).map(([id, number, title, description]) => <button key={id} onClick={() => navigateTo(id)}><span className="quick-number">{number}</span><h3>{t(title)}</h3><p>{t(description)}</p><span className="quick-link">{t('Open')} {t(navigationItems.find(item => item.id === id)?.label)} <span aria-hidden="true">→</span></span></button>)}
            </div>
            <div className="panel dashboard-workflow"><div><h2>{t("One project. Multiple destinations.")}</h2><p>{t("Attach your media once and choose where each project appears.")}</p></div><div className="chips">{destinations.filter(([key]) => !['work','featured'].includes(key)).map(([, label]) => <span key={label}>{t(label)}</span>)}</div></div>
          </>
        )}

        {section === 'bts' && <>
          <SectionHeader title={t("Behind the Scenes")} description="Behind-the-scenes files belong to their projects. Open a project to upload, arrange and publish them." />
          <div className="panel"><h3>{t("Project galleries")}</h3><div className="list">{projects.filter(project => project.bts_media_ids?.length || (destMap[project.id] || []).includes('bts')).map(project => <article className="row-card" key={project.id}><div className="row-content"><b>{(lang === 'fa' ? project.title_fa || project.title_en : project.title_en || project.title_fa) || t("Untitled project")}</b><div className="sub">{project.bts_media_ids?.length ?? (projectMediaMap[project.id] || []).length} {t("files ·")}{project.published ? t("Published") : t("Draft")}</div></div><button className="ghost" onClick={() => {projectEditorSession.current++;openProject(project);setProjectStep(1);navigateTo('projects');}}>{t("Open project")}</button></article>)}</div><button className="ghost" onClick={() => navigateTo('projects')}>{t("Go to projects")}</button></div>
          <details className="content-group"><summary>{t("Independent gallery ·")}{btsMediaIds.length} {t("files")}</summary><div className="content-group-body"><MediaUploader onBusyChange={projectUploadBusy} onDone={async uploaded => {await refreshMedia();if(uploaded?.length) setBtsMediaIds(current => Array.from(new Set([...current,...uploaded.map(item => item.id)])));}} onError={setError} />
          <div className="workflow-status"><span>{btsMediaIds.length} {t("files in this gallery")}</span><b>{btsMediaIds.join(',') === btsSavedIds.join(',') ? t("Published version") : t("Unpublished changes")}</b></div>
          <div className="panel"><p className="hint">{t("For project behind-the-scenes, open the project → Media → Behind the scenes.")}</p><MediaPicker title={t("Choose & arrange media")} media={media} ids={btsMediaIds} onChange={setBtsMediaIds} multiple />
            {btsMediaIds.some(id => !btsSavedIds.includes(id)) && <details className="content-group"><summary>{t("Name new files (optional)")}</summary><div className="content-group-body"><p className="hint">{t("Applies only to the newly added files in this gallery.")}</p><div className="grid2"><Input label="Brand name" value={btsBrandName} onChange={setBtsBrandName} /><Input label="Project name" value={btsProjectName} onChange={setBtsProjectName} /></div></div></details>}
            <div className="workflow-publish"><p>{t("Changes appear online after publishing.")}</p><button className="primary" disabled={saving || btsMediaIds.join(',') === btsSavedIds.join(',')} onClick={saveBts}>{saving ? t("Publishing…") : t("Publish gallery")}</button></div>
          </div>
          </div></details>
        </>}

        {section === 'projects' && (
          <>
            <SectionHeader
              title={t("Projects")}
              description="Portfolio projects, destinations, media and publication."
              action={<button className="primary" disabled={!!editingProject} onClick={() => {
                projectEditorSession.current++;projectSnapshot.current='';
                setProjectStep(0);
                setDestMap(current => ({ ...current, 0: [] }));
                setProjectMediaMap(current => ({ ...current, 0: [] }));
                setEditingProject({
                id: 0, bts_media_ids: [], title_fa: '', title_en: '', description_fa: '', description_en: '',
                category: 'Content', cover_url: '', media_url: '', media_type: 'image',
                preview_url: '', preview_type: 'video', preview_enabled: false,
                featured: false, published: false, sort_order: projects.length,
              }); }}>{t("+ New project")}</button>}
            />
            <div className="toolbar">
              <select hidden={!!editingProject} aria-label={t("Publication status")} value={projectStatus} onChange={e=>setProjectStatus(e.target.value)}><option value="all">{t("All statuses")}</option><option value="published">{t("Published")}</option><option value="draft">{t("Draft")}</option></select><select hidden={!!editingProject} aria-label={t("Section")} value={projectCategory} onChange={e=>setProjectCategory(e.target.value)}><option value="all">{t("All sections")}</option>{destinations.filter(([key])=>["film","photography","content","bts"].includes(key)).map(([key,label])=><option key={key} value={key}>{t(label)}</option>)}</select><input hidden={!!editingProject} aria-label={t("Search projects")} placeholder={t("Search projects…")} value={projectSearch} onChange={e => setProjectSearch(e.target.value)} />
            </div>

            {editingProject && (
              <div className="editor">
                <div className="editor-top">
                  <h2>{editingProject.id ? t("Edit project") : t("New project")}</h2>
                  <button className="ghost" onClick={closeProject}>{t("Close")}</button>
                </div>

                <nav className="workflow-steps" aria-label={t("Project setup")}>{[t("Name"),t("Media"),t("Publish")].map((label,index) => <button type="button" key={label} aria-current={projectStep === index ? 'step' : undefined} className={projectStep === index ? 'active' : ''} onClick={() => {setError('');setProjectStep(index);}}><span>{index + 1}</span>{t(label)}</button>)}</nav>
                {projectStep === 0 && <div className="workflow-body">
                  <div className="grid2"><Input label="Project name — English" value={editingProject.title_en || ''} onChange={v => setEditingProject({...editingProject,title_en:v})} /><Input label="نام پروژه — فارسی" value={editingProject.title_fa} onChange={v => setEditingProject({...editingProject,title_fa:v})} /></div>
                  <Input label="Brand (optional)" value={editingProject.brand_name || ''} onChange={v => setEditingProject({...editingProject,brand_name:v})} /><p className="hint">{t("The project name appears on its card, project page and behind-the-scenes files.")}</p>
                  <details className="content-group"><summary>{t("Description (optional)")}</summary><div className="content-group-body grid2"><Textarea label="Description — English" value={editingProject.description_en} onChange={v => setEditingProject({...editingProject,description_en:v})} /><Textarea label="توضیحات — فارسی" value={editingProject.description_fa} onChange={v => setEditingProject({...editingProject,description_fa:v})} /></div></details>
                </div>}
                {projectStep === 1 && <div className="workflow-body">
                  <div className="workflow-section-head"><div><h3>{t("Photos & videos")}</h3><p className="hint">{t("New uploads join this gallery. The first file becomes the main media if none is set.")}</p></div><MediaUploader onBusyChange={projectUploadBusy} onDone={uploaded => uploadProjectFiles(uploaded,currentEditorSession)} onError={setError} /></div>
                  <ProjectMediaEditor media={media} ids={Array.from(new Set([...(projectMediaMap[editingProject.id] || []),...media.filter(item=>item.file_url===editingProject.media_url).map(item=>item.id)]))} mainUrl={editingProject.media_url} coverUrl={editingProject.cover_url} onChange={ids=>updateProjectMedia(ids)} onMain={item=>setProjectMain(item)} onCover={item=>setEditingProject({...editingProject,cover_url:item.file_url})} onBehindScenes={id=>{updateProjectMedia(Array.from(new Set([...(projectMediaMap[editingProject.id] || []),...media.filter(item=>item.file_url===editingProject.media_url).map(item=>item.id)])).filter(value=>value!==id));setEditingProject(current=>current ? {...current,bts_media_ids:Array.from(new Set([...(current.bts_media_ids || []),id]))} : current);}}/>
                  <details className="content-group"><summary>{t("Behind the scenes ·")}{(editingProject.bts_media_ids || []).length} {t("files")}</summary><div className="content-group-body"><p className="hint">{t("Photos and videos here appear under this project and on the Behind the scenes page when the project is published.")}</p><MediaUploader onBusyChange={projectUploadBusy} onDone={uploaded => uploadProjectFiles(uploaded,currentEditorSession,true)} onError={setError} /><MediaPicker title={t("Project behind the scenes")} media={media} ids={editingProject.bts_media_ids || []} onChange={ids => setEditingProject({...editingProject,bts_media_ids:ids})} multiple /></div></details>
                  <details className="content-group"><summary>{t("Video preview & external links (optional)")}</summary><div className="content-group-body"><Toggle label="Enable card video preview" value={!!editingProject.preview_enabled} onChange={value => setEditingProject({...editingProject,preview_enabled:value})} /><MediaPicker title={t("Video preview")} kind="video" media={media} ids={media.filter(item => item.file_url === editingProject.preview_url).map(item => item.id)} onChange={ids => setEditingProject({...editingProject,preview_url:media.find(item => item.id === ids[0])?.file_url || '',preview_type:'video',preview_enabled:!!ids.length})} /><div className="grid2"><Input label="Cover URL" value={editingProject.cover_url || ''} onChange={v => setEditingProject({...editingProject,cover_url:v})} /><Input label="Main media URL" value={editingProject.media_url || ''} onChange={v => setEditingProject({...editingProject,media_url:v})} /></div></div></details>
                </div>}
                {projectStep === 2 && <div className="workflow-body">
                  <div className="workflow-review project-publish-preview">{(editingProject.cover_url || editingProject.media_url) && <div className="project-preview-cover">{editingProject.cover_url || !isVideoAsset(editingProject) ? <img src={editingProject.cover_url || editingProject.media_url || ''} alt=""/> : <video src={editingProject.media_url || undefined} muted playsInline preload="metadata"/>}</div>}<div><p className="hint">{t("Card preview")}</p><h3>{editingProject.title_en || editingProject.title_fa || t("Add a project name")}</h3><p>{editingProject.published ? t("Currently published") : t("Currently a draft")} · {new Set([...(editingProject.media_url ? [editingProject.media_url] : []),...(projectMediaMap[editingProject.id] || []).flatMap(id=>{const item=media.find(item=>item.id===id);return item ? [item.file_url] : [];})]).size} {t("gallery files ·")}{(editingProject.bts_media_ids || []).length} {t("behind-the-scenes files")}</p>{editingProject.brand_name && <p dir="auto">{editingProject.brand_name}</p>}</div></div>
                  <h3>{t("Where should it appear?")}</h3><div className="checks">{destinations.filter(([key]) => !['home','featured','work','bts'].includes(key)).map(([key,label]) => {const checked=(destMap[editingProject.id] || []).includes(key);return <label key={key}><input type="checkbox" checked={checked} onChange={() => setDestMap(map => ({...map,[editingProject.id]:checked ? (map[editingProject.id] || []).filter(value => value !== key) : [...(map[editingProject.id] || []),key]}))} />{t(label)}</label>;})}</div>
                  <label className="workflow-home"><input type="checkbox" checked={(destMap[editingProject.id] || []).includes('home')} onChange={e => setDestMap(map => ({...map,[editingProject.id]:e.target.checked ? Array.from(new Set([...(map[editingProject.id] || []),'home'])) : (map[editingProject.id] || []).filter(value => value !== 'home')}))} /><span><b>{t("Main on homepage")}</b><small>{t("Show this project first in its sections. All still includes every published project.")}</small></span></label>
                  <details className="content-group"><summary>{t("Advanced display settings")}</summary><div className="content-group-body grid2"><Input label="Display order" type="number" value={editingProject.sort_order ?? 0} onChange={v => setEditingProject({...editingProject,sort_order:Number(v) || 0})} /><Toggle label="Use as hero fallback" value={!!editingProject.featured} onChange={value => setEditingProject({...editingProject,featured:value})} /></div></details>
                </div>}
                <div className="workflow-actions">
                  <button className="ghost" onClick={() => projectStep ? setProjectStep(projectStep - 1) : closeProject()}>{projectStep ? t("Back") : t("Cancel")}</button>
                  <div className="workflow-action-end">{(!editingProject.published || projectStep === 2) && <button className="ghost" disabled={saving || uploadsActive>0} onClick={() => saveProject(false)}>{editingProject.published ? t("Unpublish") : t("Save draft")}</button>}{projectStep < 2 ? <button className="primary" onClick={() => setProjectStep(projectStep + 1)}>{t("Next")}</button> : <button className="primary" disabled={saving || uploadsActive>0} onClick={() => saveProject(true)}>{saving ? t("Publishing…") : editingProject.published ? t("Save & publish") : t("Publish project")}</button>}</div>
                </div>
                {editingProject.id > 0 && <details className="content-group"><summary>{t("Delete project")}</summary><div className="content-group-body"><button className="danger" disabled={saving} onClick={() => deleteProject(editingProject.id)}>{t("Delete project")}</button></div></details>}

              </div>
            )}

            <div className="list" hidden={!!editingProject}>
              {filteredProjects.map(project => (
                <article className="row-card project-list-card" key={project.id}>
                  <div className="thumb">
                    {project.cover_url ? <img src={project.cover_url} alt="" /> : <span>{t("NO COVER")}</span>}
                  </div>
                  <div className="row-main">
                    <b>{(lang === 'fa' ? project.title_fa || project.title_en : project.title_en || project.title_fa) || t("Untitled project")}</b>
                    <span>{projectSections({...project,destinations:destMap[project.id] || []}).map(key=>sectionName(key,lang)).join(' · ')} · {project.published ? t("Published") : t("Draft")} · {project.featured ? t("Featured") : t("Standard")}</span>
                    <small>{(destMap[project.id] || []).map(key => t(destinations.find(([value]) => value === key)?.[1] || key)).join(' · ') || t("No destinations")}</small>
                  </div>
                  <div className="project-list-actions"><label className="asset-bulk-check"><input type="checkbox" disabled={saving || !project.published} checked={(destMap[project.id] || []).includes('home')} onChange={async e => {
                    const checked = e.target.checked; const current = destMap[project.id] || [];
                    const next = checked ? [...current,'home'] : current.filter(value => value !== 'home');
                    setSaving(true); try {await api('project-home','POST',{id:project.id,show:checked}); setDestMap(map => ({...map,[project.id]:next})); flash('Homepage selection saved.');} catch(error) {setError(error instanceof Error ? error.message : 'Could not save selection.');} finally {setSaving(false);}
                  }} /> {t("Main on homepage")}</label>
                  <button className="ghost" onClick={() => {projectEditorSession.current++;setProjectStep(0);openProject(project);}}>{t("Edit")}</button></div>
                </article>
              ))}
              {!filteredProjects.length && <EmptyState text="No projects yet." />}
            </div>
          </>
        )}

        {section === 'media' && (
          <>
            <SectionHeader title={t("Media Library")} description="Upload images and videos once and reuse them across the site." action={<MediaUploader onBusyChange={projectUploadBusy} onDone={async uploaded => {await refreshMedia(); clearMediaSelection(); setLabelIds(uploaded?.map(item => item.id) || []);}} onError={setError} />} />
            <div className="toolbar">
              <input aria-label={t("Search media")} placeholder={t("Search media…")} value={mediaSearch} onChange={e => {setMediaSearch(e.target.value); setMediaPage(0);}} />
              <select aria-label={t("Filter media type")} value={mediaFilter} onChange={e => {setMediaFilter(e.target.value); setMediaPage(0);}}>
                <option value="all">{t("All")}</option>
                <option value="image">{t("Images")}</option>
                <option value="video">{t("Videos")}</option>
              </select>
            </div>
            {!labelIds.length && <p className="hint">{t("For a new project, upload from Projects. Use this library to find and reuse files; select files here for standalone publication.")}</p>}
            {!!labelIds.length && <div className="asset-label-panel panel">
              <div className="workflow-section-head"><h3>{labelIds.length} {t("selected file")}{labelIds.length === 1 || lang === 'fa' ? '' : 's'}</h3><button className="ghost" onClick={clearMediaSelection}>{t("Cancel selection")}</button></div>
              <h4>{t("1 · Name (optional)")}</h4><div className="grid2"><label className="field"><span>{t("Brand name")}</span><input list="brand-labels" value={brandLabel} onChange={e => setBrandLabel(e.target.value)} placeholder={t("Choose or type a brand")} /></label><label className="field"><span>{t("Project name")}</span><input list="project-labels" value={projectLabel} onChange={e => setProjectLabel(e.target.value)} placeholder={t("Choose or type a project")} /></label></div>
              <datalist id="brand-labels">{Array.from(new Set([...brands.map(item => item.name),...media.map(item => item.brand_name).filter(Boolean)])).map(name => <option value={name!} key={name} />)}</datalist><datalist id="project-labels">{Array.from(new Set([...projects.map(item => item.title_en || item.title_fa),...media.map(item => item.project_name).filter(Boolean)])).map(name => <option value={name!} key={name} />)}</datalist>
              <h4>{t("2 · Choose sections")}</h4><div className="checks">{[['film',t("Film & teasers")],['photography',t("Photography")],['content',t("Content")],['bts',t("Behind the scenes")]].map(([key,label]) => <label key={key}><input type="checkbox" checked={assetDestinations.includes(key)} onChange={e => setAssetDestinations(current => e.target.checked ? [...current,key] : current.filter(value => value !== key))} />{label}</label>)}</div>
              <details className="content-group"><summary>{t("Homepage priority & other options")}</summary><div className="content-group-body"><label className="field"><span>Homepage priority</span><select value={assetHome} onChange={e => setAssetHome(e.target.value)}><option value="keep">{t("Keep current")}</option><option value="show">{t("Main in homepage sections")}</option><option value="hide">{t("Standard gallery entry")}</option></select></label><p className="hint">{t("Chosen sections replace the previous placement. Empty names preserve existing labels.")}</p><button className="ghost" disabled={saving} onClick={() => saveMediaLabels('keep')}>{t("Save names & placement only")}</button></div></details>
              <div className="workflow-publish"><div><h4>{t("3 · Publish")}</h4><p>{t("Publish files directly into their sections, or keep them in the library for a project.")}</p></div><div className="workflow-action-end"><button className="ghost" disabled={saving} onClick={() => saveMediaLabels('draft')}>{t("Keep in library")}</button><button className="primary" disabled={saving} onClick={() => saveMediaLabels('publish')}>{saving ? t("Saving…") : t("Publish files")}</button></div></div>
            </div>}
            <div className="asset-tools media-selection-tools"><span className="hint">{filteredMedia.length} {t("matching files")}</span><button className="ghost" onClick={() => setLabelIds(current => Array.from(new Set([...current,...filteredMedia.map(item => item.id)])))}>{t("Select matching")}</button></div>
            <div className="media-grid">
              {filteredMedia.slice(Math.min(mediaPage, Math.max(0, Math.ceil(filteredMedia.length / 24) - 1)) * 24, (Math.min(mediaPage, Math.max(0, Math.ceil(filteredMedia.length / 24) - 1)) + 1) * 24).map(item => (
                <article className="media-card" key={item.id}>
                  <div className="preview">
                    {isVideoAsset(item)
                      ? <video src={item.file_url} controls preload="metadata" />
                      : <img src={item.file_url} alt={item.alt_text_en || item.name} />}
                  </div>
                  <div className="media-meta">
                    <label className="asset-bulk-check"><input type="checkbox" checked={labelIds.includes(item.id)} onChange={e => setLabelIds(current => e.target.checked ? [...current,item.id] : current.filter(id => id !== item.id))} /> <b dir="auto">{item.name}</b></label>
                    <small dir="auto">{[item.brand_name, item.project_name].filter(Boolean).join(' · ') || projects.filter(project => (projectMediaMap[project.id] || []).includes(item.id) || (project.bts_media_ids || []).includes(item.id) || [project.cover_url,project.media_url,project.preview_url].includes(item.file_url)).map(project => (lang === 'fa' ? project.title_fa || project.title_en : project.title_en || project.title_fa) || t("Untitled project")).join(' · ') || t("Library file")}</small>
                    <small>{(item.destinations || []).join(' · ') || t("Unassigned")} · {item.published ? t("Published in galleries") : t("Library / project use")}</small>
                    {item.show_on_home && <small>{t("Main on homepage")}</small>}
                    <span>{item.file_type || 'file'} · {item.file_size ? `${Math.round(item.file_size / 1024)} KB` : '—'}</span>
                    <button className="ghost" onClick={() => manageMedia(item)}>{t("Name & publish")}</button>
                    <details className="file-actions"><summary>{t("More")}</summary><div className="media-actions">
                      <button className="ghost" onClick={() => navigator.clipboard?.writeText(item.file_url)}>{t("Copy URL")}</button>
                      <button className="danger" onClick={() => deleteMedia(item)}>{t("Delete")}</button>
                    </div></details>
                  </div>
                </article>
              ))}
            </div>
            <div className="asset-pagination"><button className="ghost" disabled={mediaPage === 0} onClick={() => setMediaPage(page => page - 1)}>{t("Previous")}</button><span>{filteredMedia.length} {t("files · page")}{Math.min(mediaPage + 1, Math.max(1, Math.ceil(filteredMedia.length / 24)))} / {Math.max(1, Math.ceil(filteredMedia.length / 24))}</span><button className="ghost" disabled={(mediaPage + 1) * 24 >= filteredMedia.length} onClick={() => setMediaPage(page => page + 1)}>{t("Next")}</button></div>
            {!filteredMedia.length && <EmptyState text="No media uploaded yet." />}
          </>
        )}

        {section === 'hero' && (
          <>
            <SectionHeader title={t("Hero Slides")} description="Manage the homepage hero carousel." action={<button className="primary" onClick={() => setEditingHero({
              id: 0, title_fa: '', title_en: '', description_fa: '', description_en: '',
              media_url: '', media_type: 'image', button_text_fa: '', button_text_en: '',
              button_url: '', sort_order: hero.length, published: false,
            })}>{t("+ New slide")}</button>} />
            {editingHero && (
              <div className="editor">
                <div className="editor-top"><h2>{editingHero.id ? t("Edit slide") : t("New slide")}</h2><button className="ghost" onClick={() => closeOtherEditor('hero')}>{t("Close")}</button></div>
                <MediaPicker title={t("Slide media")} media={media} ids={media.filter(item=>item.file_url===editingHero.media_url).map(item=>item.id)} onChange={ids=>{const item=media.find(item=>item.id===ids[0]);setEditingHero({...editingHero,media_url:item?.file_url || '',media_type:item && isVideoAsset(item) ? 'video' : 'image'});}} upload={<MediaUploader onBusyChange={projectUploadBusy} onDone={async uploaded=>{await refreshMedia();if(uploaded?.[0])setEditingHero(current=>current ? {...current,media_url:uploaded[0].file_url,media_type:isVideoAsset(uploaded[0]) ? 'video' : 'image'} : current);}} onError={setError}/>}/>
                <div className="grid2">
                  <Input label="Title — English" value={editingHero.title_en || ''} onChange={v => setEditingHero({...editingHero, title_en: v})} />
                  <Input label="عنوان — فارسی" value={editingHero.title_fa || ''} onChange={v => setEditingHero({...editingHero, title_fa: v})} />
                  <Textarea label="Description — English" value={editingHero.description_en} onChange={v => setEditingHero({...editingHero, description_en: v})} />
                  <Textarea label="توضیحات — فارسی" value={editingHero.description_fa} onChange={v => setEditingHero({...editingHero, description_fa: v})} />
                  <details className="content-group"><summary>{t("External media URL (optional)")}</summary><Input label="Media URL" value={editingHero.media_url || ''} onChange={v => setEditingHero({...editingHero,media_url:v})}/></details>
                  <select className="field-select" value={editingHero.media_type} onChange={e => setEditingHero({...editingHero, media_type: e.target.value})}><option value="image">Image</option><option value="video">{t("Video")}</option></select>
                  <Input label="Button — English" value={editingHero.button_text_en || ''} onChange={v => setEditingHero({...editingHero, button_text_en: v})} />
                  <Input label="Button — فارسی" value={editingHero.button_text_fa || ''} onChange={v => setEditingHero({...editingHero, button_text_fa: v})} />
                  <p className="hint">{t("The slide button opens Contact.")}</p>
                  <Input label="Sort order" type="number" value={editingHero.sort_order} onChange={v => setEditingHero({...editingHero, sort_order: Number(v) || 0})} />
                </div>
                <Toggle label="Published" value={editingHero.published} onChange={v => setEditingHero({...editingHero, published: v})} />
                <div className="editor-actions"><button className="danger" onClick={() => editingHero.id && deleteHero(editingHero.id)}>{t("Delete")}</button><div /><button className="ghost" onClick={() => closeOtherEditor('hero')}>{t("Cancel")}</button><button className="primary" disabled={saving} onClick={saveHero}>{saving ? t("Saving…") : t("Save slide")}</button></div>
              </div>
            )}
            <div className="list">
              {hero.map(item => <article className="row-card" key={item.id}><div className="row-main"><b>{item.title_en || item.title_fa || t("Untitled slide")}</b><span>{item.media_type} · {item.published ? t("Published") : t("Draft")} · #{item.sort_order}</span></div><button className="ghost" onClick={() => setEditingHero(item)}>{t("Edit")}</button></article>)}
              {!hero.length && <EmptyState text="No hero slides." />}
            </div>
          </>
        )}

        {section === 'brands' && (
          <>
            <SectionHeader title={t("Brands")} description="Client logos and links." action={<button className="primary" onClick={() => {
              const usedSlots = new Set(
                brands
                  .map(item => item.sort_order)
                  .filter((value): value is number => typeof value === 'number')
              );
              let firstFreeSlot = 0;
              while (usedSlots.has(firstFreeSlot)) firstFreeSlot++;

              setEditingBrand({
                id: 0,
                name: '',
                logo_url: '',
                website_url: '',
                published: true,
                sort_order: firstFreeSlot
              });
            }}>{t("+ New brand")}</button>} />
            {editingBrand && <div className="editor">
              <div className="editor-top"><h2>{editingBrand.id ? t("Edit brand") : t("New brand")}</h2><button className="ghost" onClick={() => closeOtherEditor('brand')}>{t("Close")}</button></div>
              <div className="grid2"><Input label="Name" value={editingBrand.name} onChange={v => setEditingBrand({...editingBrand,name:v})}/><Input label="Logo URL" value={editingBrand.logo_url || ''} onChange={v => setEditingBrand({...editingBrand,logo_url:v})}/><Input label="Website URL" value={editingBrand.website_url || ''} onChange={v => setEditingBrand({...editingBrand,website_url:v})}/><Input label="Sort order" type="number" value={editingBrand.sort_order ?? 0} onChange={v => setEditingBrand({...editingBrand,sort_order:Number(v)||0})}/></div>
              <Toggle label="Published" value={!!editingBrand.published} onChange={v => setEditingBrand({...editingBrand,published:v})}/>
              <div className="editor-actions">{editingBrand.id > 0 && <button className="danger" onClick={() => deleteBrand(editingBrand.id)}>{t("Delete")}</button>}<div/><button className="ghost" onClick={() => closeOtherEditor('brand')}>{t("Cancel")}</button><button className="primary" onClick={saveBrand}>{t("Save brand")}</button></div>
            </div>}
            <div className="list">{brands.map(item => <article className="row-card" key={item.id}><div className="thumb">{item.logo_url ? <img src={item.logo_url} alt="" /> : <span>LOGO</span>}</div><div className="row-main"><b>{item.name}</b><span>{item.published ? t("Published") : t("Draft")}</span></div><button className="ghost" onClick={() => setEditingBrand(item)}>{t("Edit")}</button></article>)}{!brands.length && <EmptyState text="No brands."/>}</div>
          </>
        )}

        {section === 'services' && (
          <>
            <SectionHeader title={t("Services")} description="Services are stored in the CMS instead of local component state." action={<button className="primary" onClick={() => setEditingService({id:0,title_en:'',title_fa:'',description_en:'',description_fa:'',published:true,sort_order:services.length})}>{t("+ New service")}</button>} />
            {editingService && <div className="editor">
              <div className="editor-top"><h2>{editingService.id ? t("Edit service") : t("New service")}</h2><button className="ghost" onClick={() => closeOtherEditor('service')}>{t("Close")}</button></div>
              <div className="grid2"><Input label="Title — English" value={editingService.title_en} onChange={v => setEditingService({...editingService,title_en:v})}/><Input label="عنوان — فارسی" value={editingService.title_fa || ''} onChange={v => setEditingService({...editingService,title_fa:v})}/><Textarea label="Description — English" value={editingService.description_en} onChange={v => setEditingService({...editingService,description_en:v})}/><Textarea label="توضیحات — فارسی" value={editingService.description_fa} onChange={v => setEditingService({...editingService,description_fa:v})}/><Input label="Sort order" type="number" value={editingService.sort_order} onChange={v => setEditingService({...editingService,sort_order:Number(v)||0})}/></div>
              <Toggle label="Published" value={editingService.published} onChange={v => setEditingService({...editingService,published:v})}/>
              <div className="editor-actions">{editingService.id > 0 && <button className="danger" onClick={() => deleteService(editingService.id)}>{t("Delete")}</button>}<div/><button className="ghost" onClick={() => closeOtherEditor('service')}>{t("Cancel")}</button><button className="primary" onClick={saveService}>{t("Save service")}</button></div>
            </div>}
            <div className="list">{services.map(item => <article className="row-card" key={item.id}><div className="row-main"><b>{item.title_en || item.title_fa}</b><span>{item.published ? t("Published") : t("Draft")} · #{item.sort_order}</span></div><button className="ghost" onClick={() => setEditingService(item)}>{t("Edit")}</button></article>)}{!services.length && <EmptyState text="No services yet."/>}</div>
          </>
        )}

        {section === 'content' && (
          <>
            <SectionHeader title={t("Content")} description="Homepage, About, Contact and SEO text." action={<button className="primary" disabled={saving} onClick={saveContent}>{saving ? t("Saving…") : t("Save content")}</button>} />
            <div className="editor">
              <details className="content-group"><summary>{t("Hero")}</summary><div className="content-group-body"><div className="grid2"><Input label="Hero title — English" value={content.hero_title_en} onChange={v => setContent({...content,hero_title_en:v})}/><Input label="Hero title — فارسی" value={content.hero_title_fa} onChange={v => setContent({...content,hero_title_fa:v})}/><Textarea label="Hero description — English" value={content.hero_description_en} onChange={v => setContent({...content,hero_description_en:v})}/><Textarea label="Hero description — فارسی" value={content.hero_description_fa} onChange={v => setContent({...content,hero_description_fa:v})}/><Input label="Hero button — English" value={content.hero_button_en} onChange={v => setContent({...content,hero_button_en:v})}/><Input label="Hero button — فارسی" value={content.hero_button_fa} onChange={v => setContent({...content,hero_button_fa:v})}/></div>
              </div></details><details className="content-group"><summary>{t("About")}</summary><div className="content-group-body">
              <div className="grid2">
                <Input
                  label="About title — English"
                  value={content.about_title_en}
                  onChange={v => setContent({...content, about_title_en:v})}
                />

                <Input
                  label="About title — فارسی"
                  value={content.about_title_fa}
                  onChange={v => setContent({...content, about_title_fa:v})}
                />

                <Textarea
                  label="About — English"
                  value={content.about_text_en}
                  onChange={v => setContent({...content, about_text_en:v})}
                />

                <Textarea
                  label="About — فارسی"
                  value={content.about_text_fa}
                  onChange={v => setContent({...content, about_text_fa:v})}
                />
              </div>

              <MediaPicker title={t("About image")} kind="image" media={media} ids={media.filter(item => item.file_url === content.about_image_url).map(item => item.id)} onChange={ids => setContent({...content,about_image_url:media.find(item => item.id === ids[0])?.file_url || ''})} upload={<MediaUploader onBusyChange={projectUploadBusy} onDone={refreshMedia} onError={setError} />} />
              </div></details><details className="content-group"><summary>{t("Contact")}</summary><div className="content-group-body"><div className="grid2"><Input label="Contact title — English" value={content.contact_title_en} onChange={v => setContent({...content,contact_title_en:v})}/><Input label="Contact title — فارسی" value={content.contact_title_fa} onChange={v => setContent({...content,contact_title_fa:v})}/><Input label="Email" value={content.contact_email} onChange={v => setContent({...content,contact_email:v})}/><Input label="Phone" value={content.contact_phone} onChange={v => setContent({...content,contact_phone:v})}/><Input label="NURANICO Instagram URL" value={content.contact_instagram} onChange={v => setContent({...content,contact_instagram:v})}/><Input label="Shayan Instagram URL" value={content.personal_instagram} onChange={v => setContent({...content,personal_instagram:v})}/><Input label="Start Project URL" value={content.start_project_url || ''} onChange={v => setContent({...content,start_project_url:v})} placeholder="/contact or https://..."/></div>
              </div></details><details className="content-group"><summary>{t("SEO")}</summary><div className="content-group-body"><div className="grid2"><Input label="SEO title — English" value={content.seo_title_en} onChange={v => setContent({...content,seo_title_en:v})}/><Input label="SEO title — فارسی" value={content.seo_title_fa} onChange={v => setContent({...content,seo_title_fa:v})}/><Textarea label="SEO description — English" value={content.seo_description_en} onChange={v => setContent({...content,seo_description_en:v})}/><Textarea label="SEO description — فارسی" value={content.seo_description_fa} onChange={v => setContent({...content,seo_description_fa:v})}/></div>
              </div></details>
            </div>

            <div className="editor">
              <div className="editor-top">
                <div>
                  <h2>{t("Page Texts")}</h2>
                  <p className="hint">
                    {t("Edit reusable English and Persian text used across individual pages.")}</p>
                </div>

                <button
                  className="primary"
                  disabled={saving || !dirtyTexts.length}
                  onClick={savePageTexts}
                >
                  {saving ? t("Saving…") : t("Save page texts")}
                </button>
              </div>

              <div className="asset-tools"><label className="field page-text-filter"><span>{t("Choose a page")}</span><select value={pageTextFilter} onChange={event => setPageTextFilter(event.target.value)}><option value="all">{t("All pages")}</option>{Array.from(new Set(visibleTexts.map(item => item.page))).map(page => <option key={page} value={page}>{t(page.replace(/-/g, ' '))}</option>)}</select></label><label className="field"><span>{t("Find text")}</span><input placeholder={t("Search labels, English or Persian…")} value={pageTextSearch} onChange={e => setPageTextSearch(e.target.value)} /></label></div>
              <p className="hint">{dirtyTexts.length} {t("unsaved changes. Open a group, then a text to edit.")}</p>
              {Array.from(new Set(visibleTexts.map(item => item.page))).filter(page => pageTextFilter === 'all' || page === pageTextFilter).map(page => {
                const rows = visibleTexts.filter(item => item.page === page && [item.label,item.text_key,item.value_en,item.value_fa].join(' ').toLowerCase().includes(pageTextSearch.trim().toLowerCase())).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0) || a.id - b.id);
                return <section key={page} className="text-page"><h3>{t(page.replace(/-/g,' '))}</h3>{Array.from(new Set(rows.map(row => textGroup(row.text_key)))).map(group => <details className="content-group" key={group} open={!!pageTextSearch}><summary>{t(group)} <span className="hint">{rows.filter(row => textGroup(row.text_key) === group).length} {t("texts")}</span></summary><div className="content-group-body">{rows.filter(row => textGroup(row.text_key) === group).map(row => <details className="text-entry" key={row.id}><summary><span>{row.label || row.text_key}</span>{dirtyTexts.includes(row.id) && <small>{t("Edited")}</small>}<p dir="auto">{row.value_en || row.value_fa || t("Empty")}</p></summary><div className="grid2"><Textarea label="English" value={row.value_en} onChange={value => editText(row.id,'value_en',value)} /><Textarea label="فارسی" value={row.value_fa} onChange={value => editText(row.id,'value_fa',value)} /></div></details>)}</div></details>)}{!rows.length && <EmptyState text="No matching text." />}</section>;
              })}

            </div>
          </>
        )}

        {section === 'settings' && <>
          <SectionHeader title={t("Settings")} description="Logo, colors and typography, organized by purpose." />
          <nav className="settings-tabs" aria-label={t("Settings categories")}>{[['identity',t("Logo")],['colors',t("Colors")],['typography',t("Typography")],['fonts',t("Font library")]].map(([key,label]) => <button type="button" key={key} aria-pressed={settingsTab === key} className={settingsTab === key ? 'active' : ''} onClick={() => setSettingsTab(key)}>{label}</button>)}</nav>
          <div className="editor settings-editor">
            {settingsTab === 'identity' && <section aria-labelledby="settings-logo-title"><h2 id="settings-logo-title">{t("Website logo")}</h2><p className="hint">{t("Upload your logo or replace the current one.")}</p><LogoUploader value={settings.logo_url} onChange={url => setSettings({...settings,logo_url:url})} onError={setError} /></section>}
            {settingsTab === 'colors' && <section aria-labelledby="settings-colors-title"><h2 id="settings-colors-title">{t("Website colors")}</h2><p className="hint">{t("Choose the area you want to adjust.")}</p>{([
              [t("Backgrounds & text"), [['bg_color',t("Main background")],['surface_color',t("About background")],['card_bg',t("Cards background")],['text_color',t("Main text")],['heading_color',t("Headings")],['muted_color',t("Secondary text")],['tag_color',t("Labels")],['border_color',t("Borders")]]],
              [t("Navigation & logo"), [['nav_bg',t("Navigation background")],['nav_text',t("Navigation text")],['nav_active',t("Active navigation")],['logo_color',t("Logo color")]]],
              [t("Buttons & links"), [['button_color',t("Button background")],['button_text',t("Button text")],['button_hover',t("Button hover")],['link_color',t("Links")]]],
              [t("Brands section"), [['brands_bg',t("Background")],['brands_text',t("Text")],['brands_muted',t("Secondary text")],['brands_hover',t("Card hover")]]],
              [t("Footer"), [['footer_bg',t("Background")],['footer_text',t("Text")]]],
            ] as [string,[keyof Settings,string][]][]).map(([title,fields],index) => <details key={title} className="content-group" open={index === 0}><summary>{t(title)}<small>{fields.length} {t("colors")}</small></summary><div className="content-group-body color-grid">{fields.map(([key,label]) => <label className="color-field" key={key}><span>{t(label)}</span><input type="color" aria-label={`${title}: ${label}`} value={String(settings[key] || '#000000')} onChange={e => setSettings({...settings,[key]:e.target.value})} /><code>{settings[key]}</code></label>)}</div></details>)}</section>}
            {settingsTab === 'typography' && <section aria-labelledby="settings-type-title"><h2 id="settings-type-title">{t("Typography")}</h2><p className="hint">{t("Choose fonts for each language. Heavy heading fonts use a regular companion for body text.")}</p>
              <div className="settings-languages">{(['en','fa'] as const).map(language => <section className="settings-language" key={language}><h3>{language === 'en' ? t("English") : 'فارسی'}</h3><label className="field"><span>{language === 'en' ? t("English font") : 'فونت فارسی'}</span><select className="field-select" value={settings[`font_${language}`]} onChange={e => setSettings({...settings,[`font_${language}`]:e.target.value})}>{Array.from(new Set([...(language === 'en' ? ['DM Sans','Space Grotesk'] : ['Yekan Bakh']),settings[`font_${language}`],...fonts.map(font => font.family_name)])).map(family => <option key={family} value={family}>{family}</option>)}</select></label>
                <details className="content-group"><summary>{language === 'en' ? t("Sizes & spacing") : 'اندازه و فاصله‌ها'}</summary><div className="content-group-body grid2">{([['heading_size',t("Heading size (px)")],['body_size',t("Body size (px)")],['small_size',t("Small text (px)")],['line_height',t("Line height")],['letter_spacing',t("Letter spacing (px)")]] as const).filter(([field]) => language !== 'fa' || field !== 'letter_spacing').map(([field,label]) => {const key=`${field}_${language}` as keyof Settings;return <Input key={key} label={label} type="number" value={settings[key] as number} onChange={value => setSettings({...settings,[key]:Number(value)||0})} />;})}</div></details>
              </section>)}</div>
              <details className="content-group"><summary>{t("Font weights")}</summary><div className="content-group-body"><p className="hint">{t("Shared defaults for both languages. A heading font with its own Black or ExtraBold weight keeps that weight.")}</p><div className="grid2">{(['heading_weight','body_weight'] as const).map(key => <label className="field" key={key}><span>{key === 'heading_weight' ? t("Heading weight") : t("Body weight")}</span><select className="field-select" value={settings[key]} onChange={e => setSettings({...settings,[key]:Number(e.target.value)})}>{Array.from(new Set([100,200,300,400,500,600,700,800,900,settings[key]])).sort((a,b)=>a-b).map(weight => <option value={weight} key={weight}>{({100:t("Thin"),200:t("ExtraLight"),300:t("Light"),400:t("Regular"),500:t("Medium"),600:t("SemiBold"),700:t("Bold"),800:t("ExtraBold"),900:t("Black")} as Record<number,string>)[weight] || t("Custom")} · {weight}</option>)}</select></label>)}</div></div></details>
            </section>}
            {settingsTab === 'fonts' && <section aria-labelledby="settings-fonts-title"><div className="font-section-head"><div><h2 id="settings-fonts-title">{t("Font library")}</h2><p className="hint">{t("Upload fonts and manage their weights by family.")}</p></div><FontUploader onUploaded={font => {setFonts(current => [font,...current.filter(item => item.id !== font.id)]);flash('Font uploaded.');}} onError={setError} /></div><input className="settings-font-search" aria-label={t("Search fonts")} placeholder={t("Search font family or file…")} value={fontSearch} onChange={e => setFontSearch(e.target.value)} />
              {Array.from(new Set(fonts.filter(font => [font.family_name,font.name].join(' ').toLowerCase().includes(fontSearch.trim().toLowerCase())).map(font => font.family_name))).map(family => <details className="content-group settings-font-family" key={family}><summary>{family}<small>{fonts.filter(font => font.family_name === family).length} {t("files")}</small></summary><div className="content-group-body"><div className="font-actions"><button className="ghost" disabled={settings.font_en === family} onClick={() => setSettings({...settings,font_en:family})}>{settings.font_en === family ? t("Selected for English") : t("Use for English")}</button><button className="ghost" disabled={settings.font_fa === family} onClick={() => setSettings({...settings,font_fa:family})}>{settings.font_fa === family ? t("Selected for Persian") : t("Use for Persian")}</button></div><div className="font-library">{fonts.filter(font => font.family_name === family).sort((a,b)=>a.font_weight-b.font_weight).map(font => (
                  <article
                    className="font-card"
                    key={font.id}
                  >
                    <style>{`
                      @font-face {
                        font-family: '${font.family_name.replace(/'/g, "\\'")}';
                        src: url('${font.file_url}') format('${font.format === 'ttf' ? 'truetype' : font.format === 'otf' ? 'opentype' : font.format}');
                        font-weight: ${font.font_weight || 400};
                        font-style: ${font.font_style || 'normal'};
                        font-display: swap;
                      }
                    `}</style>

                    <div className="font-card-top">
                      <div>
                        <b>{font.family_name}</b>
                        <span>
                          {font.format.toUpperCase()} · {font.font_weight || 400}
                        </span>
                      </div>

                      <button
                        className="danger"
                        type="button"
                        onClick={() => deleteFont(font)}
                      >
                        {t("Delete")}</button>
                    </div>

                    <div
                      className="font-preview"
                      style={{
                        '--preview-font': `'${font.family_name}', sans-serif`,
                        fontWeight: font.font_weight || 400
                      } as React.CSSProperties}
                    >
                      <div>
                        The quick brown fox jumps over the lazy dog.
                      </div>

                      <div dir="rtl">
                        نورانیکو، استودیوی خلاق برای روایت تصویر.
                      </div>
                    </div>


                  </article>
              ))}</div></div></details>)}
              {!fonts.length && <EmptyState text="No custom fonts uploaded yet." />}
              {!!fonts.length && !fonts.some(font => [font.family_name,font.name].join(' ').toLowerCase().includes(fontSearch.trim().toLowerCase())) && <EmptyState text="No matching fonts." />}
            </section>}
          </div>
          <div className="settings-save-bar"><span role="status">{settingsDirty ? t("Unsaved changes") : t("All settings saved")}</span><div><button className="ghost" disabled={!settingsDirty || saving} onClick={() => {if(savedSettings) setSettings({...savedSettings});setError('');}}>{t("Discard changes")}</button><button className="primary" disabled={!settingsDirty || saving} onClick={saveSettings}>{saving ? t("Saving…") : t("Save settings")}</button></div></div>
        </>}

        </>}
        </div>
      </section>
    </main>
  );
}

function FontUploader({
  onUploaded,
  onError,
}: {
  onUploaded: (font: FontAsset) => void;
  onError: (s: string) => void;
}) {
  const {t} = useAdminLocale();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [fileProgress,setFileProgress]=useState<{name:string;percent:number;status:'uploading'|'done'|'error'}[]>([]);

  async function upload(file: File | undefined) {
    if (!file) return;

    const extension =
      file.name.split('.').pop()?.toLowerCase() || '';

    if (!['woff2', 'woff', 'ttf', 'otf'].includes(extension)) {
      onError('Only WOFF2, WOFF, TTF and OTF files are supported.');
      return;
    }

    const suggestedFamily = file.name
      .replace(/\.(woff2?|ttf|otf)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b(regular|medium|bold|light|black|thin|semibold|extra bold)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const familyName = window.prompt(
      t('Font family name:'),
      suggestedFamily || 'Custom Font'
    );

    if (!familyName?.trim()) return;

    const weightText = window.prompt(
      t('Font weight (100–900):'),
      '400'
    );

    if (weightText === null) return;

    const weight = Math.min(
      900,
      Math.max(100, Number(weightText) || 400)
    );

    setBusy(true);
    onError('');

    try {
      const urlResponse = await fetch(
        '/api/admin/fonts/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: file.name,
            type:
              file.type ||
              'application/octet-stream',
            size: file.size
          })
        }
      );

      const urlData = await urlResponse
        .json()
        .catch(() => ({}));

      if (!urlResponse.ok) {
        throw new Error(
          urlData.error ||
          'Could not create font upload URL.'
        );
      }

      const put = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type':
            file.type ||
            'application/octet-stream'
        },
        body: file
      });

      if (!put.ok) {
        throw new Error(
          `Font upload failed (${put.status}).`
        );
      }

      const completeResponse = await fetch(
        '/api/admin/fonts/complete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: file.name,
            familyName: familyName.trim(),
            key: urlData.key,
            fileUrl: urlData.fileUrl,
            mimeType:
              file.type ||
              'application/octet-stream',
            size: file.size,
            weight,
            style: 'normal'
          })
        }
      );

      const completeData = await completeResponse
        .json()
        .catch(() => ({}));

      if (!completeResponse.ok) {
        throw new Error(
          completeData.error ||
          'Could not register font.'
        );
      }

      onUploaded(completeData.row);

      if (input.current) {
        input.current.value = '';
      }
    } catch (e) {
      onError(
        e instanceof Error
          ? e.message
          : 'Font upload failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".woff2,.woff,.ttf,.otf"
        hidden
        onChange={e =>
          upload(e.target.files?.[0])
        }
      />

      <button
        className="primary"
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? t("Uploading…") : t("+ Upload Font")}
      </button>
    </>
  );
}


function LogoUploader({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (url: string) => void;
  onError: (s: string) => void;
}) {
  const {t} = useAdminLocale();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [fileProgress,setFileProgress]=useState<{name:string;percent:number;status:'uploading'|'done'|'error'}[]>([]);

  async function upload(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Logo must be an image file.');
      return;
    }

    setBusy(true);
    onError('');

    try {
      const urlResponse = await fetch(
        '/api/admin/media/upload-url',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
          }),
        }
      );

      const urlData = await urlResponse.json();

      if (!urlResponse.ok) {
        throw new Error(
          urlData.error || 'Could not create logo upload URL.'
        );
      }

      const put = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type':
            file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!put.ok) {
        throw new Error('Logo storage upload failed.');
      }

      const complete = await fetch(
        '/api/admin/media/complete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: file.name,
            key: urlData.key,
            mimeType: file.type,
            size: file.size,
            fileUrl: urlData.fileUrl,
          }),
        }
      );

      const completeData = await complete.json();

      if (!complete.ok) {
        throw new Error(
          completeData.error ||
            'Logo database save failed.'
        );
      }

      onChange(urlData.fileUrl);

      if (input.current) {
        input.current.value = '';
      }
    } catch (e) {
      onError(
        e instanceof Error
          ? e.message
          : 'Logo upload failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="logo-admin-control">

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={e =>
          upload(e.target.files?.[0])
        }
      />

      <div className="logo-admin-preview">
        {value ? (
          <img
            src={value}
            alt={t("Site logo preview")}
          />
        ) : (
          <div className="logo-admin-placeholder">
            <strong>NURANICO</strong>
            <span>{t("No custom logo")}</span>
          </div>
        )}
      </div>

      <div className="logo-admin-actions">
        <button
          type="button"
          className="primary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy
            ? t("Uploading…")
            : value
              ? t("Replace logo")
              : t("+ Upload logo")}
        </button>

        {value ? (
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => onChange('')}
          >
            {t("Remove")}</button>
        ) : null}
      </div>

      <div className="logo-admin-url">
        <label>{t("Logo URL")}</label>

        <input
          type="text"
          value={value}
          placeholder={t("Upload a logo or paste image URL")}
          onChange={e =>
            onChange(e.target.value)
          }
        />
      </div>

      <small className="logo-admin-help">
        {t("PNG, JPG, WEBP or SVG. Transparent PNG/SVG is recommended. Save Settings after uploading.")}</small>
    </div>
  );
}


function MediaUploader({ onDone, onError, onBusyChange }: { onBusyChange?:(busy:boolean)=>void; onDone: (uploaded?: MediaAsset[]) => Promise<void>; onError: (s: string) => void }) {
  const {t} = useAdminLocale();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [fileProgress,setFileProgress]=useState<{name:string;percent:number;status:'uploading'|'done'|'error'}[]>([]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);onBusyChange?.(true);
    setFileProgress(Array.from(files).map(file=>({name:file.name,percent:0,status:'uploading'})));
    const uploaded: MediaAsset[] = [];
    let activeIndex=0;
    try {
      for (const [index,file] of Array.from(files).entries()) {
        activeIndex=index;setProgress(`${t('Uploading…')} ${index + 1} / ${files.length}`);
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          throw new Error(`${file.name}: only images and videos are supported.`);
        }

        const urlResponse = await fetch('/api/admin/media/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
        });
        const urlData = await urlResponse.json();
        if (!urlResponse.ok) throw new Error(urlData.error || 'Could not create upload URL.');

        await new Promise<void>((resolve,reject)=>{const request=new XMLHttpRequest();request.open('PUT',urlData.uploadUrl);request.setRequestHeader('Content-Type',file.type || 'application/octet-stream');request.upload.onprogress=event=>{if(event.lengthComputable)setFileProgress(current=>current.map((row,i)=>i===index ? {...row,percent:Math.round(event.loaded/event.total*100)} : row));};request.onload=()=>request.status>=200 && request.status<300 ? resolve() : reject(new Error(`${file.name}: storage upload failed.`));request.onerror=()=>reject(new Error(`${file.name}: storage upload failed.`));request.send(file);});

        const complete = await fetch('/api/admin/media/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            key: urlData.key,
            mimeType: file.type,
            size: file.size,
            fileUrl: urlData.fileUrl,
          }),
        });
        const completeData = await complete.json();
        if (!complete.ok) throw new Error(completeData.error || `${file.name}: database save failed.`);
        if (completeData.row) uploaded.push(completeData.row);
        setFileProgress(current=>current.map((row,i)=>i===index ? {...row,percent:100,status:'done'} : row));
      }
    } catch (e) {
      setFileProgress(current=>current.map((row,i)=>i>=activeIndex ? {...row,status:'error'} : row));
      onError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      if (uploaded.length) { try { await onDone(uploaded); } catch { onError('Files uploaded. Refresh the library to see them.'); } }
      setBusy(false);onBusyChange?.(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="upload-control"><label className={busy ? 'upload disabled' : 'upload'}>
      <input ref={input} type="file" accept="image/*,video/*" multiple disabled={busy} onChange={e => upload(e.target.files)} />
      {busy ? progress || t("Uploading…") : t("+ Upload photos / videos")}
    </label>{!!fileProgress.length && <div className="upload-file-progress" aria-live="polite">{fileProgress.map((file,index)=><div key={index}><span dir="auto">{file.name}</span><progress max="100" value={file.percent}/><small>{file.status==='done' ? t('Uploaded') : file.status==='error' ? t('Not uploaded') : `${file.percent}%`}</small></div>)}</div>}</div>
  );
}

const styles = `

.admin .logo-admin-control {
  width:100%;
  display:flex;
  flex-direction:column;
  gap:12px;
  margin-top:8px;
}

.admin .settings-logo-field {
  grid-column:1 / -1;
  width:100%;
}

.admin .settings-field-title {
  display:block;
  margin-bottom:10px;
  color:#aaa;
  font-size:11px;
}

.admin .logo-admin-preview {
  width:100%;
  min-height:130px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  overflow:hidden;
  border:1px solid #30302d;
  border-radius:10px;
  background:#0d0d0c;
}

.admin .logo-admin-preview img {
  display:block;
  width:auto;
  height:auto;
  max-width:min(320px, 80%);
  max-height:90px;
  object-fit:contain;
}

.admin .logo-admin-placeholder {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  color:#666;
}

.admin .logo-admin-placeholder strong {
  color:#aaa;
  font-size:20px;
  letter-spacing:.18em;
}

.admin .logo-admin-placeholder span {
  font-size:10px;
}

.admin .logo-admin-actions {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.admin .logo-admin-url {
  display:flex;
  flex-direction:column;
  gap:7px;
}

.admin .logo-admin-url label {
  color:#777;
  font-size:10px;
}

.admin .logo-admin-url input {
  width:100%;
  min-height:40px;
  padding:9px 11px;
  border:1px solid #30302d;
  border-radius:7px;
  outline:none;
  background:#10100f;
  color:#ddd;
  font:inherit;
  font-size:11px;
}

.admin .logo-admin-url input:focus {
  border-color:#666;
}

.admin .logo-admin-help {
  color:#666;
  font-size:9px;
  line-height:1.6;
}


.admin { color-scheme: dark; }
.admin * { box-sizing:border-box; }
.admin { min-height:100vh; display:flex; background:#141413; color:#eee; font-family:Arial,Helvetica,sans-serif; }
.admin .sidebar { width:235px; min-height:100vh; position:sticky; top:0; display:flex; flex-direction:column; padding:28px 18px; border-right:1px solid #292927; background:#111110; }
.admin .brand { padding:5px 10px 30px; display:flex; flex-direction:column; gap:7px; }
.admin .brand strong { letter-spacing:.22em; font-size:18px; font-weight:600; }
.admin .brand span { font-size:9px; color:#777; letter-spacing:.18em; }
.admin .sidebar nav { display:grid; gap:3px; }
.admin .sidebar nav button,.admin .logout { border:0; background:transparent; color:#888; padding:11px 12px; text-align:left; border-radius:7px; cursor:pointer; font-size:12px; }
.admin .sidebar nav button:hover,.admin .nav-active { background:#20201e !important; color:#f4f2ec !important; }
.admin .logout { margin-top:auto; border:1px solid #2d2d2a; }
.admin .workspace { width:min(1400px,100%); padding:42px clamp(20px,4vw,55px); }
.admin .section-header { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:28px; }
.admin .section-header h1 { margin:0 0 7px; font-size:31px; font-weight:450; letter-spacing:-.02em; }
.admin .section-header p { margin:0; color:#777; font-size:12px; }
.admin button { font:inherit; }
.admin .primary,.admin .ghost,.admin .danger,.admin .upload { display:inline-flex; align-items:center; justify-content:center; border-radius:7px; padding:10px 15px; cursor:pointer; font-size:12px; }
.admin .primary { background:#eee; color:#151515; border:1px solid #eee; }
.admin .primary:disabled,.admin .upload.disabled { opacity:.5; cursor:wait; }
.admin .ghost { background:#191918; color:#bbb; border:1px solid #30302d; }
.admin .danger { background:#241818; color:#e9aaaa; border:1px solid #4b2929; }
.admin .upload { background:#eee; color:#151515; border:1px solid #eee; }

.admin .upload input { display:none; }

.admin .about-media-editor {
  margin:18px 0 28px;
  padding:18px;
  border:1px solid #30302d;
  border-radius:8px;
  background:#141413;
}

.admin .about-media-preview {
  margin-top:14px;
  display:flex;
  align-items:flex-end;
  gap:14px;
  flex-wrap:wrap;
}

.admin .about-media-preview img {
  width:min(420px,100%);
  height:240px;
  object-fit:cover;
  display:block;
  border-radius:7px;
  border:1px solid #30302d;
}

.admin .notice { padding:13px 15px; margin-bottom:20px; border:1px solid #383834; background:#1b1b19; color:#ddd; border-radius:7px; font-size:12px; }
.admin .notice.error { border-color:#5a3030; color:#efb5b5; }
.admin .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:20px; }
.admin .stat { padding:22px; border:1px solid #292927; background:#1a1a18; border-radius:8px; }
.admin .stat b { display:block; font-size:29px; font-weight:400; margin-bottom:8px; }
.admin .stat span { color:#777; font-size:11px; }
.admin .panel,.admin .editor { border:1px solid #292927; background:#181817; border-radius:8px; padding:22px; margin-bottom:18px; }
.admin .panel h2,.admin .editor h2 { font-size:14px; font-weight:500; margin:0 0 16px; }
.admin .panel p,.admin .hint { color:#858580; font-size:12px; line-height:1.8; }
.admin .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:18px; }
.admin .chips span { padding:7px 9px; border:1px solid #30302d; border-radius:20px; color:#999; font-size:10px; }
.admin .toolbar { display:flex; gap:8px; margin-bottom:15px; }
.admin .toolbar input { flex:1; }
.admin input,.admin textarea,.admin select,.admin .field-select { width:100%; background:#121211; border:1px solid #30302d; color:#eee; border-radius:6px; padding:11px 12px; outline:none; font:inherit; font-size:12px; }
.admin input:focus,.admin textarea:focus,.admin select:focus { border-color:#777; }
.admin .field { display:grid; gap:7px; margin-bottom:14px; }
.admin .field > span { color:#8d8d88; font-size:10px; }
.admin .field-select { margin-bottom:14px; }
.admin .grid2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px 15px; }
.admin .editor-top,.admin .editor-actions { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin-bottom:20px; }
.admin .editor-top { grid-template-columns:1fr auto; }
.admin .editor-top h2 { margin:0; }
.admin .editor-actions { margin:22px 0 0; }
.admin .editor-block { border-top:1px solid #2a2a27; padding-top:18px; margin-top:5px; }
.admin .editor-block h3 { font-size:11px; color:#aaa; font-weight:500; }
.admin .checks { display:flex; flex-wrap:wrap; gap:8px; }
.admin .checks label,.admin .toggle { font-size:11px; color:#aaa; padding:8px 10px; border:1px solid #30302d; border-radius:6px; }
.admin .toggle { display:inline-flex; align-items:center; gap:8px; margin-top:4px; cursor:pointer; }
.admin .toggle input,.admin .checks input,.admin .media-pick input { width:auto; }
.admin .list { display:grid; gap:8px; }
.admin .row-card { display:flex; align-items:center; gap:14px; border:1px solid #292927; background:#181817; padding:11px; border-radius:8px; }
.admin .thumb { width:68px; height:52px; background:#111; border-radius:5px; overflow:hidden; display:grid; place-items:center; color:#555; font-size:8px; flex:none; }
.admin .thumb img { width:100%; height:100%; object-fit:cover; }
.admin .row-main { min-width:0; flex:1; display:grid; gap:5px; }
.admin .row-main b { font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.admin .row-main span,.admin .row-main small { color:#777; font-size:10px; }
.admin .media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }
.admin .media-card { overflow:hidden; border:1px solid #292927; border-radius:8px; background:#181817; }
.admin .preview { aspect-ratio:16/10; background:#0d0d0c; display:grid; place-items:center; overflow:hidden; }
.admin .preview img,.admin .preview video { width:100%; height:100%; object-fit:cover; }
.admin .media-meta { padding:13px; display:grid; gap:6px; }
.admin .media-meta b { font-size:12px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.admin .media-meta span { color:#777; font-size:10px; }
.admin .media-actions { display:flex; gap:6px; margin-top:6px; }
.admin .media-actions button { padding:7px 9px; font-size:10px; }
.admin .media-picker { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:7px; }
.admin .media-pick { padding:9px; border:1px solid #30302d; border-radius:6px; color:#999; font-size:10px; cursor:pointer; }
.admin .media-pick.selected { border-color:#777; color:#eee; background:#20201e; }
.admin .color-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:8px; margin-bottom:25px; }
.admin .color-field { display:grid; grid-template-columns:1fr auto; align-items:center; gap:8px; border:1px solid #30302d; padding:9px; border-radius:6px; color:#888; font-size:10px; }
.admin .color-field input { width:35px; height:28px; padding:0; }
.admin .color-field code { grid-column:1/-1; color:#aaa; font-size:10px; }
.admin .empty { border:1px dashed #343430; color:#666; padding:30px; text-align:center; border-radius:8px; font-size:11px; }
.admin .admin-loading { min-height:100vh; display:grid; place-items:center; background:#141413; color:#777; font:12px Arial; }
@media(max-width:800px){ .admin{display:block}.admin .sidebar{position:relative;width:100%;min-height:auto;border-right:0;border-bottom:1px solid #292927}.admin .sidebar nav{grid-template-columns:repeat(4,1fr)}.admin .logout{margin-top:15px}.admin .grid2{grid-template-columns:1fr}.admin .workspace{padding:25px 16px}.admin .section-header{align-items:flex-start;flex-direction:column}.admin .row-card{align-items:flex-start}.admin .row-card>.ghost{margin-left:auto}.admin .editor-actions{grid-template-columns:auto 1fr auto}.admin .stats{grid-template-columns:repeat(2,1fr)} }

.admin .font-section-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:20px;
  margin-top:30px;
}
.admin .font-section-head h2{margin-bottom:6px}
.admin .typography-controls{margin-top:20px}
.admin .font-library{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  margin-top:15px;
}
.admin .font-card{
  border:1px solid #343432;
  background:#181817;
  padding:18px;
  min-width:0;
}
.admin .font-card-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:15px;
}
.admin .font-card-top>div{
  display:flex;
  flex-direction:column;
  gap:6px;
  min-width:0;
}
.admin .font-card-top b{
  font-size:14px;
  overflow:hidden;
  text-overflow:ellipsis;
}
.admin .font-card-top span{
  color:#777;
  font-size:10px;
  letter-spacing:.08em;
}
.admin .font-preview{
  margin:20px 0;
  padding:18px 0;
  border-top:1px solid #30302e;
  border-bottom:1px solid #30302e;
  font-size:22px;
  line-height:1.7;
  overflow-wrap:anywhere;
}
.admin .font-preview div+div{
  margin-top:10px;
}
.admin .font-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}
@media(max-width:900px){
  .admin .font-library{grid-template-columns:1fr}
  .admin .font-section-head{
    align-items:flex-start;
    flex-direction:column;
  }
}

`;
