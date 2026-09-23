'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

type MediaAsset = {
  id: number;
  name: string;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  alt_text_fa: string | null;
  alt_text_en: string | null;
  created_at: string | null;
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

const destinations = [
  ['home', 'Home'],
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
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
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
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
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
  return (
    <div className="section-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [loading, setLoading] = useState(true);
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
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');

  function flash(text: string) {
    setError('');
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  }

  async function loadAll() {
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
      setContent({ ...emptyContent, ...(data.content || {}) });
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
    } catch (e) {
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

      flash('Behind the Scenes saved.');
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

  async function saveProject() {
    if (!editingProject) return;
    setSaving(true);
    try {
      const saved = await api<{ row: Project; id: number }>('projects', 'POST', {
        row: editingProject,
        destinations: destMap[editingProject.id] || [],
        mediaIds: projectMediaMap[editingProject.id] || [],
      });
      setProjects(current => current.some(p => p.id === saved.id)
        ? current.map(p => p.id === saved.id ? saved.row : p)
        : [...current, saved.row]);
      setEditingProject(null);
      flash('Project saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Project could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    if (!window.confirm('Delete this project and its links?')) return;
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
    if (!confirm('Delete this hero slide?')) return;
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
    if (!confirm('Delete this brand?')) return;
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
    if (!confirm('Delete this service?')) return;
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
      setContent({ ...emptyContent, ...result.row });
      flash('Content saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Content could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function savePageTexts() {
    setSaving(true);
    setError('');

    try {
      const result = await api<{ rows: PageText[] }>(
        'page-texts',
        'POST',
        { rows: pageTexts }
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
    setSaving(true);
    try {
      const result = await api<{ row: Settings }>('settings', 'POST', { row: settings });
      setSettings({ ...emptySettings, ...result.row });
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
    if (!q) return projects;
    return projects.filter(p =>
      [p.title_en, p.title_fa, p.category].some(v => (v || '').toLowerCase().includes(q))
    );
  }, [projects, projectSearch]);

  const filteredMedia = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    return media.filter(m => {
      const matchesQ = !q || [m.name, m.file_type, m.mime_type].some(v => (v || '').toLowerCase().includes(q));
      const matchesType = mediaFilter === 'all' || (m.file_type || '').toLowerCase() === mediaFilter;
      return matchesQ && matchesType;
    });
  }, [media, mediaSearch, mediaFilter]);

  if (loading) return <div className="admin-loading">Loading NURANICO CMS…</div>;

  return (
    <main className="admin">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <strong>NURANICO</strong>
          <span>CMS / ADMIN</span>
        </div>

        <nav>
          {([
            ['dashboard', 'Dashboard'],
            ['projects', 'Projects'],
            ['media', 'Media'],
            ['bts', 'Behind the Scenes'],
            ['hero', 'Hero'],
            ['brands', 'Brands'],
            ['services', 'Services'],
            ['content', 'Content'],
            ['settings', 'Settings'],
          ] as [Section, string][]).map(([id, label]) => (
            <button key={id} className={section === id ? 'nav-active' : ''} onClick={() => { setSection(id); setMessage(''); }}>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="logout" onClick={logout}>Log out</button>
      </aside>

      <section className="workspace">
        {(message || error) && (
          <div className={error ? 'notice error' : 'notice'}>{error || message}</div>
        )}

        {section === 'dashboard' && (
          <>
            <SectionHeader title="Dashboard" description="A single place to manage the NURANICO website." />
            <div className="stats">
              {[
                ['Projects', projects.length],
                ['Media', media.length],
                ['Hero slides', hero.length],
                ['Brands', brands.length],
                ['Services', services.length],
              ].map(([label, value]) => (
                <div className="stat" key={label as string}><b>{value as number}</b><span>{label}</span></div>
              ))}
            </div>
            <div className="panel">
              <h2>Workflow</h2>
              <p>Upload a media file once, then attach it to projects. A project can be published to multiple destinations without duplicating the file.</p>
              <div className="chips">
                {destinations.map(([, label]) => <span key={label}>{label}</span>)}
              </div>
            </div>
          </>
        )}

        {section === 'bts' && (
          <>
            <SectionHeader
              title="Behind the Scenes"
              description="Choose images and videos from the Media Library. These files appear in Film & Teasers and the full BTS gallery."
              action={
                <button
                  className="primary"
                  disabled={saving}
                  onClick={saveBts}
                >
                  {saving ? 'Saving…' : 'Save BTS'}
                </button>
              }
            />

            <div className="panel">
              <h2>Selected BTS Media</h2>

              <p style={{ opacity: .65, marginBottom: 20 }}>
                Selected: {btsMediaIds.length} file{btsMediaIds.length === 1 ? '' : 's'}
              </p>

              <div className="media-picker">
                {media.map(item => {
                  const selected = btsMediaIds.includes(item.id);
                  const isVideo =
                    item.mime_type?.startsWith('video/') ||
                    (item.file_type || '').toLowerCase() === 'video';

                  return (
                    <label
                      key={`bts-${item.id}`}
                      className={
                        selected
                          ? 'media-pick selected'
                          : 'media-pick'
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setBtsMediaIds(current =>
                            selected
                              ? current.filter(id => id !== item.id)
                              : [...current, item.id]
                          )
                        }
                      />

                      <span>
                        {isVideo ? 'VIDEO' : 'PHOTO'} · {item.name}
                      </span>
                    </label>
                  );
                })}

                {!media.length && (
                  <EmptyState text="Upload media first." />
                )}
              </div>
            </div>

            {btsMediaIds.length > 0 && (
              <div className="panel" style={{ marginTop: 24 }}>
                <h2>Preview</h2>

                <div className="media-grid">
                  {btsMediaIds.map(id => {
                    const item = media.find(mediaItem => mediaItem.id === id);

                    if (!item) return null;

                    const isVideo =
                      item.mime_type?.startsWith('video/') ||
                      (item.file_type || '').toLowerCase() === 'video';

                    return (
                      <article
                        className="media-card"
                        key={`bts-preview-${item.id}`}
                      >
                        <div className="preview">
                          {isVideo ? (
                            <video
                              src={item.file_url}
                              controls
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={item.file_url}
                              alt={item.alt_text_en || item.name}
                            />
                          )}
                        </div>

                        <div className="media-meta">
                          <b>{item.name}</b>
                          <span>
                            {isVideo ? 'VIDEO' : 'PHOTO'}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {section === 'projects' && (
          <>
            <SectionHeader
              title="Projects"
              description="Portfolio projects, destinations, media and publication."
              action={<button className="primary" onClick={() => setEditingProject({
                id: 0, title_fa: '', title_en: '', description_fa: '', description_en: '',
                category: 'Content', cover_url: '', media_url: '', media_type: 'image',
                preview_url: '', preview_type: 'video', preview_enabled: false,
                featured: false, published: false, sort_order: projects.length,
              })}>+ New project</button>}
            />
            <div className="toolbar">
              <input placeholder="Search projects…" value={projectSearch} onChange={e => setProjectSearch(e.target.value)} />
            </div>

            {editingProject && (
              <div className="editor">
                <div className="editor-top">
                  <h2>{editingProject.id ? 'Edit project' : 'New project'}</h2>
                  <button className="ghost" onClick={() => setEditingProject(null)}>Close</button>
                </div>

                <div className="grid2">
                  <Input label="Title — English" value={editingProject.title_en || ''} onChange={v => setEditingProject({...editingProject, title_en: v})} />
                  <Input label="عنوان — فارسی" value={editingProject.title_fa} onChange={v => setEditingProject({...editingProject, title_fa: v})} />
                  <Input label="Category" value={editingProject.category} onChange={v => setEditingProject({...editingProject, category: v})} />
                  <Input label="Sort order" type="number" value={editingProject.sort_order ?? 0} onChange={v => setEditingProject({...editingProject, sort_order: Number(v) || 0})} />
                  <Input label="Cover URL" value={editingProject.cover_url || ''} onChange={v => setEditingProject({...editingProject, cover_url: v})} />
                  <Input label="Main media URL" value={editingProject.media_url || ''} onChange={v => setEditingProject({...editingProject, media_url: v})} />
                  <Textarea label="Description — English" value={editingProject.description_en} onChange={v => setEditingProject({...editingProject, description_en: v})} />
                  <Textarea label="توضیحات — فارسی" value={editingProject.description_fa} onChange={v => setEditingProject({...editingProject, description_fa: v})} />
                </div>

                <div className="editor-block">
                  <h3>Publication</h3>
                  <div className="checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={!!editingProject.published}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          published: e.target.checked
                        })}
                      />
                      Published
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={!!editingProject.featured}
                        onChange={e => setEditingProject({
                          ...editingProject,
                          featured: e.target.checked
                        })}
                      />
                      Featured
                    </label>
                  </div>
                </div>

                <div className="editor-block">
                  <h3>Destinations</h3>
                  <div className="checks">
                    {destinations.map(([key, label]) => {
                      const checked = (destMap[editingProject.id] || []).includes(key);
                      return <label key={key}><input type="checkbox" checked={checked} onChange={() => setDestMap(m => ({
                        ...m,
                        [editingProject.id]: checked
                          ? (m[editingProject.id] || []).filter(x => x !== key)
                          : [...(m[editingProject.id] || []), key],
                      }))} /> {label}</label>;
                    })}
                  </div>
                </div>

                <div className="editor-block">
                  <h3>Project Media</h3>
                  <p style={{ opacity: .65, marginBottom: 18 }}>
                    Choose cover, main media, optional video preview and gallery files independently.
                  </p>

                  <div style={{ marginBottom: 28 }}>
                    <h3>1. Cover Image</h3>
                    <p style={{ opacity: .6 }}>
                      Used as the project thumbnail and video poster.
                    </p>

                    <div className="media-picker">
                      {media
                        .filter(item => !item.mime_type?.startsWith('video'))
                        .map(item => {
                          const selected = editingProject.cover_url === item.file_url;

                          return (
                            <label
                              className={selected ? 'media-pick selected' : 'media-pick'}
                              key={`cover-${item.id}`}
                            >
                              <input
                                type="radio"
                                name="project-cover"
                                checked={selected}
                                onChange={() =>
                                  setEditingProject({
                                    ...editingProject,
                                    cover_url: item.file_url,
                                  })
                                }
                              />
                              IMAGE · {item.name}
                            </label>
                          );
                        })}
                    </div>

                    {editingProject.cover_url && (
                      <button
                        type="button"
                        className="ghost"
                        style={{ marginTop: 10 }}
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            cover_url: '',
                          })
                        }
                      >
                        Clear cover
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <h3>2. Main Media</h3>
                    <p style={{ opacity: .6 }}>
                      The main photo or video shown inside the project.
                    </p>

                    <div className="media-picker">
                      {media.map(item => {
                        const selected = editingProject.media_url === item.file_url;
                        const isVideo = !!item.mime_type?.startsWith('video');

                        return (
                          <label
                            className={selected ? 'media-pick selected' : 'media-pick'}
                            key={`main-${item.id}`}
                          >
                            <input
                              type="radio"
                              name="project-main-media"
                              checked={selected}
                              onChange={() =>
                                setEditingProject({
                                  ...editingProject,
                                  media_url: item.file_url,
                                  media_type: isVideo ? 'video' : 'image',
                                })
                              }
                            />
                            {isVideo ? 'VIDEO' : 'IMAGE'} · {item.name}
                          </label>
                        );
                      })}
                    </div>

                    {editingProject.media_url && (
                      <button
                        type="button"
                        className="ghost"
                        style={{ marginTop: 10 }}
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            media_url: '',
                            media_type: 'image',
                          })
                        }
                      >
                        Clear main media
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <h3>3. Video Preview</h3>
                    <p style={{ opacity: .6 }}>
                      Optional short video preview for cards / homepage / hero.
                    </p>

                    <div className="checks" style={{ marginBottom: 12 }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!editingProject.preview_enabled}
                          onChange={e =>
                            setEditingProject({
                              ...editingProject,
                              preview_enabled: e.target.checked,
                            })
                          }
                        />
                        Enable video preview
                      </label>
                    </div>

                    <div className="media-picker">
                      {media
                        .filter(item => item.mime_type?.startsWith('video'))
                        .map(item => {
                          const selected = editingProject.preview_url === item.file_url;

                          return (
                            <label
                              className={selected ? 'media-pick selected' : 'media-pick'}
                              key={`preview-${item.id}`}
                            >
                              <input
                                type="radio"
                                name="project-preview"
                                checked={selected}
                                onChange={() =>
                                  setEditingProject({
                                    ...editingProject,
                                    preview_url: item.file_url,
                                    preview_type: 'video',
                                  })
                                }
                              />
                              VIDEO · {item.name}
                            </label>
                          );
                        })}
                    </div>

                    {editingProject.preview_url && (
                      <button
                        type="button"
                        className="ghost"
                        style={{ marginTop: 10 }}
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            preview_url: '',
                            preview_type: 'video',
                            preview_enabled: false,
                          })
                        }
                      >
                        Clear preview
                      </button>
                    )}
                  </div>

                  <div>
                    <h3>4. Project Gallery</h3>
                    <p style={{ opacity: .6 }}>
                      Select any number of uploaded images or videos for this project.
                    </p>

                    <div className="media-picker">
                      {media.map(item => {
                        const currentIds =
                          projectMediaMap[editingProject.id] || [];

                        const selected = currentIds.includes(item.id);

                        return (
                          <label
                            className={selected ? 'media-pick selected' : 'media-pick'}
                            key={`gallery-${item.id}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setProjectMediaMap(current => {
                                  const ids =
                                    current[editingProject.id] || [];

                                  return {
                                    ...current,
                                    [editingProject.id]: selected
                                      ? ids.filter(id => id !== item.id)
                                      : [...ids, item.id],
                                  };
                                })
                              }
                            />

                            {item.mime_type?.startsWith('video')
                              ? 'VIDEO'
                              : 'IMAGE'} · {item.name}
                          </label>
                        );
                      })}

                      {!media.length && (
                        <EmptyState text="Upload media first." />
                      )}
                    </div>
                  </div>
                </div>

                <div className="editor-actions">
                  {editingProject.id > 0 && <button className="danger" onClick={() => deleteProject(editingProject.id)}>Delete</button>}
                  <div />
                  <button className="ghost" onClick={() => setEditingProject(null)}>Cancel</button>
                  <button className="primary" disabled={saving} onClick={saveProject}>{saving ? 'Saving…' : 'Save project'}</button>
                </div>
              </div>
            )}

            <div className="list">
              {filteredProjects.map(project => (
                <article className="row-card" key={project.id}>
                  <div className="thumb">
                    {project.cover_url ? <img src={project.cover_url} alt="" /> : <span>NO COVER</span>}
                  </div>
                  <div className="row-main">
                    <b>{project.title_en || project.title_fa || 'Untitled project'}</b>
                    <span>{project.category} · {project.published ? 'Published' : 'Draft'} · {project.featured ? 'Featured' : 'Standard'}</span>
                    <small>{(destMap[project.id] || []).join(' · ') || 'No destinations'}</small>
                  </div>
                  <button className="ghost" onClick={() => setEditingProject(project)}>Edit</button>
                </article>
              ))}
              {!filteredProjects.length && <EmptyState text="No projects yet." />}
            </div>
          </>
        )}

        {section === 'media' && (
          <>
            <SectionHeader title="Media Library" description="Upload images and videos once and reuse them across the site." action={<MediaUploader onDone={loadAll} onError={setError} />} />
            <div className="toolbar">
              <input placeholder="Search media…" value={mediaSearch} onChange={e => setMediaSearch(e.target.value)} />
              <select value={mediaFilter} onChange={e => setMediaFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
            <div className="media-grid">
              {filteredMedia.map(item => (
                <article className="media-card" key={item.id}>
                  <div className="preview">
                    {item.mime_type?.startsWith('video')
                      ? <video src={item.file_url} controls preload="metadata" />
                      : <img src={item.file_url} alt={item.alt_text_en || item.name} />}
                  </div>
                  <div className="media-meta">
                    <b>{item.name}</b>
                    <span>{item.file_type || 'file'} · {item.file_size ? `${Math.round(item.file_size / 1024)} KB` : '—'}</span>
                    <div className="media-actions">
                      <button className="ghost" onClick={() => navigator.clipboard?.writeText(item.file_url)}>Copy URL</button>
                      <button className="danger" onClick={() => deleteMedia(item)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!filteredMedia.length && <EmptyState text="No media uploaded yet." />}
          </>
        )}

        {section === 'hero' && (
          <>
            <SectionHeader title="Hero Slides" description="Manage the homepage hero carousel." action={<button className="primary" onClick={() => setEditingHero({
              id: 0, title_fa: '', title_en: '', description_fa: '', description_en: '',
              media_url: '', media_type: 'image', button_text_fa: '', button_text_en: '',
              button_url: '', sort_order: hero.length, published: false,
            })}>+ New slide</button>} />
            {editingHero && (
              <div className="editor">
                <div className="editor-top"><h2>{editingHero.id ? 'Edit slide' : 'New slide'}</h2><button className="ghost" onClick={() => setEditingHero(null)}>Close</button></div>
                <div className="grid2">
                  <Input label="Title — English" value={editingHero.title_en || ''} onChange={v => setEditingHero({...editingHero, title_en: v})} />
                  <Input label="عنوان — فارسی" value={editingHero.title_fa || ''} onChange={v => setEditingHero({...editingHero, title_fa: v})} />
                  <Textarea label="Description — English" value={editingHero.description_en} onChange={v => setEditingHero({...editingHero, description_en: v})} />
                  <Textarea label="توضیحات — فارسی" value={editingHero.description_fa} onChange={v => setEditingHero({...editingHero, description_fa: v})} />
                  <Input label="Media URL" value={editingHero.media_url || ''} onChange={v => setEditingHero({...editingHero, media_url: v})} />
                  <select className="field-select" value={editingHero.media_type} onChange={e => setEditingHero({...editingHero, media_type: e.target.value})}><option value="image">Image</option><option value="video">Video</option></select>
                  <Input label="Button — English" value={editingHero.button_text_en || ''} onChange={v => setEditingHero({...editingHero, button_text_en: v})} />
                  <Input label="Button — فارسی" value={editingHero.button_text_fa || ''} onChange={v => setEditingHero({...editingHero, button_text_fa: v})} />
                  <Input label="Button URL" value={editingHero.button_url || ''} onChange={v => setEditingHero({...editingHero, button_url: v})} />
                  <Input label="Sort order" type="number" value={editingHero.sort_order} onChange={v => setEditingHero({...editingHero, sort_order: Number(v) || 0})} />
                </div>
                <Toggle label="Published" value={editingHero.published} onChange={v => setEditingHero({...editingHero, published: v})} />
                <div className="editor-actions"><button className="danger" onClick={() => editingHero.id && deleteHero(editingHero.id)}>Delete</button><div /><button className="ghost" onClick={() => setEditingHero(null)}>Cancel</button><button className="primary" disabled={saving} onClick={saveHero}>{saving ? 'Saving…' : 'Save slide'}</button></div>
              </div>
            )}
            <div className="list">
              {hero.map(item => <article className="row-card" key={item.id}><div className="row-main"><b>{item.title_en || item.title_fa || 'Untitled slide'}</b><span>{item.media_type} · {item.published ? 'Published' : 'Draft'} · #{item.sort_order}</span></div><button className="ghost" onClick={() => setEditingHero(item)}>Edit</button></article>)}
              {!hero.length && <EmptyState text="No hero slides." />}
            </div>
          </>
        )}

        {section === 'brands' && (
          <>
            <SectionHeader title="Brands" description="Client logos and links." action={<button className="primary" onClick={() => {
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
            }}>+ New brand</button>} />
            {editingBrand && <div className="editor">
              <div className="editor-top"><h2>{editingBrand.id ? 'Edit brand' : 'New brand'}</h2><button className="ghost" onClick={() => setEditingBrand(null)}>Close</button></div>
              <div className="grid2"><Input label="Name" value={editingBrand.name} onChange={v => setEditingBrand({...editingBrand,name:v})}/><Input label="Logo URL" value={editingBrand.logo_url || ''} onChange={v => setEditingBrand({...editingBrand,logo_url:v})}/><Input label="Website URL" value={editingBrand.website_url || ''} onChange={v => setEditingBrand({...editingBrand,website_url:v})}/><Input label="Sort order" type="number" value={editingBrand.sort_order ?? 0} onChange={v => setEditingBrand({...editingBrand,sort_order:Number(v)||0})}/></div>
              <Toggle label="Published" value={!!editingBrand.published} onChange={v => setEditingBrand({...editingBrand,published:v})}/>
              <div className="editor-actions">{editingBrand.id > 0 && <button className="danger" onClick={() => deleteBrand(editingBrand.id)}>Delete</button>}<div/><button className="ghost" onClick={() => setEditingBrand(null)}>Cancel</button><button className="primary" onClick={saveBrand}>Save brand</button></div>
            </div>}
            <div className="list">{brands.map(item => <article className="row-card" key={item.id}><div className="thumb">{item.logo_url ? <img src={item.logo_url} alt="" /> : <span>LOGO</span>}</div><div className="row-main"><b>{item.name}</b><span>{item.published ? 'Published' : 'Draft'}</span></div><button className="ghost" onClick={() => setEditingBrand(item)}>Edit</button></article>)}{!brands.length && <EmptyState text="No brands."/>}</div>
          </>
        )}

        {section === 'services' && (
          <>
            <SectionHeader title="Services" description="Services are stored in the CMS instead of local component state." action={<button className="primary" onClick={() => setEditingService({id:0,title_en:'',title_fa:'',description_en:'',description_fa:'',published:true,sort_order:services.length})}>+ New service</button>} />
            {editingService && <div className="editor">
              <div className="editor-top"><h2>{editingService.id ? 'Edit service' : 'New service'}</h2><button className="ghost" onClick={() => setEditingService(null)}>Close</button></div>
              <div className="grid2"><Input label="Title — English" value={editingService.title_en} onChange={v => setEditingService({...editingService,title_en:v})}/><Input label="عنوان — فارسی" value={editingService.title_fa || ''} onChange={v => setEditingService({...editingService,title_fa:v})}/><Textarea label="Description — English" value={editingService.description_en} onChange={v => setEditingService({...editingService,description_en:v})}/><Textarea label="توضیحات — فارسی" value={editingService.description_fa} onChange={v => setEditingService({...editingService,description_fa:v})}/><Input label="Sort order" type="number" value={editingService.sort_order} onChange={v => setEditingService({...editingService,sort_order:Number(v)||0})}/></div>
              <Toggle label="Published" value={editingService.published} onChange={v => setEditingService({...editingService,published:v})}/>
              <div className="editor-actions">{editingService.id > 0 && <button className="danger" onClick={() => deleteService(editingService.id)}>Delete</button>}<div/><button className="ghost" onClick={() => setEditingService(null)}>Cancel</button><button className="primary" onClick={saveService}>Save service</button></div>
            </div>}
            <div className="list">{services.map(item => <article className="row-card" key={item.id}><div className="row-main"><b>{item.title_en || item.title_fa}</b><span>{item.published ? 'Published' : 'Draft'} · #{item.sort_order}</span></div><button className="ghost" onClick={() => setEditingService(item)}>Edit</button></article>)}{!services.length && <EmptyState text="No services yet."/>}</div>
          </>
        )}

        {section === 'content' && (
          <>
            <SectionHeader title="Content" description="Homepage, About, Contact and SEO text." action={<button className="primary" disabled={saving} onClick={saveContent}>{saving ? 'Saving…' : 'Save content'}</button>} />
            <div className="editor">
              <h2>Hero</h2><div className="grid2"><Input label="Hero title — English" value={content.hero_title_en} onChange={v => setContent({...content,hero_title_en:v})}/><Input label="Hero title — فارسی" value={content.hero_title_fa} onChange={v => setContent({...content,hero_title_fa:v})}/><Textarea label="Hero description — English" value={content.hero_description_en} onChange={v => setContent({...content,hero_description_en:v})}/><Textarea label="Hero description — فارسی" value={content.hero_description_fa} onChange={v => setContent({...content,hero_description_fa:v})}/><Input label="Hero button — English" value={content.hero_button_en} onChange={v => setContent({...content,hero_button_en:v})}/><Input label="Hero button — فارسی" value={content.hero_button_fa} onChange={v => setContent({...content,hero_button_fa:v})}/></div>
              <h2>About</h2>
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

              <div className="about-media-editor">
                <label className="field">
                  <span>About image — Media Library</span>

                  <select
                    className="field-select"
                    value={content.about_image_url || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        about_image_url: e.target.value
                      })
                    }
                  >
                    <option value="">No image selected</option>

                    {media
                      .filter(item => item.mime_type?.startsWith('image/'))
                      .map(item => (
                        <option key={item.id} value={item.file_url}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>

                {content.about_image_url ? (
                  <div className="about-media-preview">
                    <img
                      src={content.about_image_url}
                      alt="About preview"
                    />

                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        setContent({
                          ...content,
                          about_image_url: ''
                        })
                      }
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <p className="hint">
                    Upload an image in Media Library, then select it here.
                  </p>
                )}
              </div>
              <h2>Contact</h2><div className="grid2"><Input label="Contact title — English" value={content.contact_title_en} onChange={v => setContent({...content,contact_title_en:v})}/><Input label="Contact title — فارسی" value={content.contact_title_fa} onChange={v => setContent({...content,contact_title_fa:v})}/><Input label="Email" value={content.contact_email} onChange={v => setContent({...content,contact_email:v})}/><Input label="Phone" value={content.contact_phone} onChange={v => setContent({...content,contact_phone:v})}/><Input label="NURANICO Instagram URL" value={content.contact_instagram} onChange={v => setContent({...content,contact_instagram:v})}/><Input label="Shayan Instagram URL" value={content.personal_instagram} onChange={v => setContent({...content,personal_instagram:v})}/><Input label="Start Project URL" value={content.start_project_url || ''} onChange={v => setContent({...content,start_project_url:v})} placeholder="/contact or https://..."/></div>
              <h2>SEO</h2><div className="grid2"><Input label="SEO title — English" value={content.seo_title_en} onChange={v => setContent({...content,seo_title_en:v})}/><Input label="SEO title — فارسی" value={content.seo_title_fa} onChange={v => setContent({...content,seo_title_fa:v})}/><Textarea label="SEO description — English" value={content.seo_description_en} onChange={v => setContent({...content,seo_description_en:v})}/><Textarea label="SEO description — فارسی" value={content.seo_description_fa} onChange={v => setContent({...content,seo_description_fa:v})}/></div>
            </div>

            <div className="editor">
              <div className="editor-top">
                <div>
                  <h2>Page Texts</h2>
                  <p className="hint">
                    Edit reusable English and Persian text used across individual pages.
                  </p>
                </div>

                <button
                  className="primary"
                  disabled={saving || pageTexts.length === 0}
                  onClick={savePageTexts}
                >
                  {saving ? 'Saving…' : 'Save page texts'}
                </button>
              </div>

              {pageTexts.length === 0 ? (
                <EmptyState text="No page texts found in CMS." />
              ) : (
                Array.from(new Set(pageTexts.map(item => item.page))).map(page => {
                  const rows = pageTexts
                    .filter(item => item.page === page)
                    .sort((a, b) => {
                      const orderCompare =
                        (a.sort_order || 0) - (b.sort_order || 0);

                      return orderCompare !== 0
                        ? orderCompare
                        : a.id - b.id;
                    });

                  return (
                    <div
                      key={page}
                      style={{
                        marginTop: 28,
                        paddingTop: 24,
                        borderTop: '1px solid var(--border, #333)'
                      }}
                    >
                      <h2
                        style={{
                          textTransform: 'capitalize',
                          marginBottom: 18
                        }}
                      >
                        {page.replace(/-/g, ' ')}
                      </h2>

                      <div style={{ display: 'grid', gap: 22 }}>
                        {rows.map(row => (
                          <div
                            key={row.id}
                            style={{
                              padding: 18,
                              border: '1px solid var(--border, #333)',
                              borderRadius: 12
                            }}
                          >
                            <div style={{ marginBottom: 14 }}>
                              <strong>
                                {row.label || row.text_key}
                              </strong>

                              <div
                                className="hint"
                                style={{ marginTop: 4 }}
                              >
                                {row.text_key}
                              </div>
                            </div>

                            <div className="grid2">
                              <Textarea
                                label="English"
                                value={row.value_en}
                                onChange={value =>
                                  setPageTexts(current =>
                                    current.map(item =>
                                      item.id === row.id
                                        ? { ...item, value_en: value }
                                        : item
                                    )
                                  )
                                }
                              />

                              <Textarea
                                label="فارسی"
                                value={row.value_fa}
                                onChange={value =>
                                  setPageTexts(current =>
                                    current.map(item =>
                                      item.id === row.id
                                        ? { ...item, value_fa: value }
                                        : item
                                    )
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {section === 'settings' && (
          <>
            <SectionHeader title="Settings" description="Global visual settings. These are stored in Supabase." action={<button className="primary" disabled={saving} onClick={saveSettings}>{saving ? 'Saving…' : 'Save settings'}</button>} />
            <div className="editor">
              <h2>Colors</h2>

              <p className="hint">
                Complete website color system. Changes affect colors only —
                typography and layout remain untouched.
              </p>

              <div className="color-grid">
                {([
                  ['bg_color', 'Main background'],
                  ['surface_color', 'Surface / About'],
                  ['card_bg', 'Services / Cards'],
                  ['text_color', 'Main text'],
                  ['heading_color', 'Headings'],
                  ['muted_color', 'Muted text'],
                  ['tag_color', 'Labels / Tags'],
                  ['border_color', 'Borders / Lines'],

                  ['nav_bg', 'Navigation background'],
                  ['nav_text', 'Navigation text'],
                  ['nav_active', 'Navigation active'],
                  ['logo_color', 'Logo'],
                  ['link_color', 'Links'],

                  ['button_color', 'Button background'],
                  ['button_text', 'Button text'],
                  ['button_hover', 'Button hover'],

                  ['footer_bg', 'Footer background'],
                  ['footer_text', 'Footer text'],

                  ['brands_bg', 'Brands background'],
                  ['brands_text', 'Brands text'],
                  ['brands_muted', 'Brands muted text'],
                  ['brands_hover', 'Brands card hover'],

                  ['contact_bg', 'Contact background'],
                  ['contact_text', 'Contact text'],
                  ['contact_muted', 'Contact muted text'],
                  ['contact_button', 'Contact button'],
                  ['contact_button_text', 'Contact button text'],
                ] as const).map(([key, label]) => (
                  <label className="color-field" key={key}>
                    <span>{label}</span>

                    <input
                      type="color"
                      value={settings[key] || '#000000'}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          [key]: e.target.value
                        })
                      }
                    />

                    <code>{settings[key]}</code>
                  </label>
                ))}
              </div>
              <div className="font-section-head">
                <div>
                  <h2>Typography</h2>
                  <p className="hint">
                    Upload custom fonts and assign them to English or Persian.
                  </p>
                </div>

                <FontUploader
                  onUploaded={font => {
                    setFonts(current => [
                      font,
                      ...current.filter(x => x.id !== font.id)
                    ]);
                    flash('Font uploaded.');
                  }}
                  onError={setError}
                />
              </div>

              <div className="grid2 typography-controls">
                <label className="field">
                  <span>English font</span>
                  <select
                    className="field-select"
                    value={settings.font_en}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        font_en: e.target.value
                      })
                    }
                  >
                    <option value="DM Sans">DM Sans</option>
                    <option value="Space Grotesk">Space Grotesk</option>

                    {fonts.map(font => (
                      <option
                        key={font.id}
                        value={font.family_name}
                      >
                        {font.family_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Persian font</span>
                  <select
                    className="field-select"
                    value={settings.font_fa}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        font_fa: e.target.value
                      })
                    }
                  >
                    <option value="Yekan Bakh">Yekan Bakh</option>

                    {fonts.map(font => (
                      <option
                        key={font.id}
                        value={font.family_name}
                      >
                        {font.family_name}
                      </option>
                    ))}
                  </select>
                </label>

              </div>

              <div style={{marginTop:24}}>
                <h3 style={{marginBottom:12}}>English Typography</h3>

                <div className="grid2 typography-controls">
                  <Input label="English heading size (px)" type="number"
                    value={settings.heading_size_en}
                    onChange={v => setSettings({...settings,heading_size_en:Number(v)||0})}
                  />

                  <Input label="English body size (px)" type="number"
                    value={settings.body_size_en}
                    onChange={v => setSettings({...settings,body_size_en:Number(v)||0})}
                  />

                  <Input label="English small size (px)" type="number"
                    value={settings.small_size_en}
                    onChange={v => setSettings({...settings,small_size_en:Number(v)||0})}
                  />

                  <Input label="English line height" type="number"
                    value={settings.line_height_en}
                    onChange={v => setSettings({...settings,line_height_en:Number(v)||0})}
                  />

                  <Input label="English letter spacing (px)" type="number"
                    value={settings.letter_spacing_en}
                    onChange={v => setSettings({...settings,letter_spacing_en:Number(v)||0})}
                  />
                </div>
              </div>

              <div style={{marginTop:24}}>
                <h3 style={{marginBottom:12}}>Persian Typography</h3>

                <div className="grid2 typography-controls">
                  <Input label="Persian heading size (px)" type="number"
                    value={settings.heading_size_fa}
                    onChange={v => setSettings({...settings,heading_size_fa:Number(v)||0})}
                  />

                  <Input label="Persian body size (px)" type="number"
                    value={settings.body_size_fa}
                    onChange={v => setSettings({...settings,body_size_fa:Number(v)||0})}
                  />

                  <Input label="Persian small size (px)" type="number"
                    value={settings.small_size_fa}
                    onChange={v => setSettings({...settings,small_size_fa:Number(v)||0})}
                  />

                  <Input label="Persian line height" type="number"
                    value={settings.line_height_fa}
                    onChange={v => setSettings({...settings,line_height_fa:Number(v)||0})}
                  />

                  <Input label="Persian letter spacing (px)" type="number"
                    value={settings.letter_spacing_fa}
                    onChange={v => setSettings({...settings,letter_spacing_fa:Number(v)||0})}
                  />
                </div>
              </div>

              <div className="grid2 typography-controls" style={{marginTop:24}}>
                <Input label="Heading weight" type="number"
                  value={settings.heading_weight}
                  onChange={v => setSettings({...settings,heading_weight:Number(v)||400})}
                />

                <Input label="Body weight" type="number"
                  value={settings.body_weight}
                  onChange={v => setSettings({...settings,body_weight:Number(v)||400})}
                />

                <div className="settings-logo-field">
                  <label className="settings-field-title">
                    Site Logo
                  </label>

                  <LogoUploader
                    value={settings.logo_url}
                    onChange={url =>
                      setSettings({
                        ...settings,
                        logo_url: url
                      })
                    }
                    onError={setError}
                  />
                </div>
              </div>

              <h2>Font Library</h2>

              <div className="font-library">
                {fonts.map(font => (
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
                        Delete
                      </button>
                    </div>

                    <div
                      className="font-preview"
                      style={{
                        fontFamily: `'${font.family_name}', sans-serif`,
                        fontWeight: font.font_weight || 400
                      }}
                    >
                      <div>
                        The quick brown fox jumps over the lazy dog.
                      </div>

                      <div dir="rtl">
                        نورانیکو، استودیوی خلاق برای روایت تصویر.
                      </div>
                    </div>

                    <div className="font-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            font_en: font.family_name
                          })
                        }
                      >
                        Use for English
                      </button>

                      <button
                        className="ghost"
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            font_fa: font.family_name
                          })
                        }
                      >
                        Use for Persian
                      </button>
                    </div>
                  </article>
                ))}

                {!fonts.length && (
                  <EmptyState text="No custom fonts uploaded yet." />
                )}
              </div>
            </div>
          </>
        )}
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
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

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
      'Font family name:',
      suggestedFamily || 'Custom Font'
    );

    if (!familyName?.trim()) return;

    const weightText = window.prompt(
      'Font weight (100–900):',
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
        {busy ? 'Uploading…' : '+ Upload Font'}
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
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

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
            alt="Site logo preview"
          />
        ) : (
          <div className="logo-admin-placeholder">
            <strong>NURANICO</strong>
            <span>No custom logo</span>
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
            ? 'Uploading…'
            : value
              ? 'Replace logo'
              : '+ Upload logo'}
        </button>

        {value ? (
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => onChange('')}
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="logo-admin-url">
        <label>Logo URL</label>

        <input
          type="text"
          value={value}
          placeholder="Upload a logo or paste image URL"
          onChange={e =>
            onChange(e.target.value)
          }
        />
      </div>

      <small className="logo-admin-help">
        PNG, JPG, WEBP or SVG. Transparent PNG/SVG is recommended.
        Save Settings after uploading.
      </small>
    </div>
  );
}


function MediaUploader({ onDone, onError }: { onDone: () => Promise<void>; onError: (s: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
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

        const put = await fetch(urlData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!put.ok) throw new Error(`${file.name}: storage upload failed.`);

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
      }
      await onDone();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <label className={busy ? 'upload disabled' : 'upload'}>
      <input ref={input} type="file" accept="image/*,video/*" multiple disabled={busy} onChange={e => upload(e.target.files)} />
      {busy ? 'Uploading…' : '+ Upload media'}
    </label>
  );
}

const styles = `

.logo-admin-control {
  width:100%;
  display:flex;
  flex-direction:column;
  gap:12px;
  margin-top:8px;
}

.settings-logo-field {
  grid-column:1 / -1;
  width:100%;
}

.settings-field-title {
  display:block;
  margin-bottom:10px;
  color:#aaa;
  font-size:11px;
}

.logo-admin-preview {
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

.logo-admin-preview img {
  display:block;
  width:auto;
  height:auto;
  max-width:min(320px, 80%);
  max-height:90px;
  object-fit:contain;
}

.logo-admin-placeholder {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  color:#666;
}

.logo-admin-placeholder strong {
  color:#aaa;
  font-size:20px;
  letter-spacing:.18em;
}

.logo-admin-placeholder span {
  font-size:10px;
}

.logo-admin-actions {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.logo-admin-url {
  display:flex;
  flex-direction:column;
  gap:7px;
}

.logo-admin-url label {
  color:#777;
  font-size:10px;
}

.logo-admin-url input {
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

.logo-admin-url input:focus {
  border-color:#666;
}

.logo-admin-help {
  color:#666;
  font-size:9px;
  line-height:1.6;
}


:root { color-scheme: dark; }
* { box-sizing:border-box; }
.admin { min-height:100vh; display:flex; background:#141413; color:#eee; font-family:Arial,Helvetica,sans-serif; }
.sidebar { width:235px; min-height:100vh; position:sticky; top:0; display:flex; flex-direction:column; padding:28px 18px; border-right:1px solid #292927; background:#111110; }
.brand { padding:5px 10px 30px; display:flex; flex-direction:column; gap:7px; }
.brand strong { letter-spacing:.22em; font-size:18px; font-weight:600; }
.brand span { font-size:9px; color:#777; letter-spacing:.18em; }
.sidebar nav { display:grid; gap:3px; }
.sidebar nav button,.logout { border:0; background:transparent; color:#888; padding:11px 12px; text-align:left; border-radius:7px; cursor:pointer; font-size:12px; }
.sidebar nav button:hover,.nav-active { background:#20201e !important; color:#f4f2ec !important; }
.logout { margin-top:auto; border:1px solid #2d2d2a; }
.workspace { width:min(1400px,100%); padding:42px clamp(20px,4vw,55px); }
.section-header { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:28px; }
.section-header h1 { margin:0 0 7px; font-size:31px; font-weight:450; letter-spacing:-.02em; }
.section-header p { margin:0; color:#777; font-size:12px; }
button { font:inherit; }
.primary,.ghost,.danger,.upload { display:inline-flex; align-items:center; justify-content:center; border-radius:7px; padding:10px 15px; cursor:pointer; font-size:12px; }
.primary { background:#eee; color:#151515; border:1px solid #eee; }
.primary:disabled,.upload.disabled { opacity:.5; cursor:wait; }
.ghost { background:#191918; color:#bbb; border:1px solid #30302d; }
.danger { background:#241818; color:#e9aaaa; border:1px solid #4b2929; }
.upload { background:#eee; color:#151515; border:1px solid #eee; }

.upload input { display:none; }

.about-media-editor {
  margin:18px 0 28px;
  padding:18px;
  border:1px solid #30302d;
  border-radius:8px;
  background:#141413;
}

.about-media-preview {
  margin-top:14px;
  display:flex;
  align-items:flex-end;
  gap:14px;
  flex-wrap:wrap;
}

.about-media-preview img {
  width:min(420px,100%);
  height:240px;
  object-fit:cover;
  display:block;
  border-radius:7px;
  border:1px solid #30302d;
}

.notice { padding:13px 15px; margin-bottom:20px; border:1px solid #383834; background:#1b1b19; color:#ddd; border-radius:7px; font-size:12px; }
.notice.error { border-color:#5a3030; color:#efb5b5; }
.stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:20px; }
.stat { padding:22px; border:1px solid #292927; background:#1a1a18; border-radius:8px; }
.stat b { display:block; font-size:29px; font-weight:400; margin-bottom:8px; }
.stat span { color:#777; font-size:11px; }
.panel,.editor { border:1px solid #292927; background:#181817; border-radius:8px; padding:22px; margin-bottom:18px; }
.panel h2,.editor h2 { font-size:14px; font-weight:500; margin:0 0 16px; }
.panel p,.hint { color:#858580; font-size:12px; line-height:1.8; }
.chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:18px; }
.chips span { padding:7px 9px; border:1px solid #30302d; border-radius:20px; color:#999; font-size:10px; }
.toolbar { display:flex; gap:8px; margin-bottom:15px; }
.toolbar input { flex:1; }
input,textarea,select,.field-select { width:100%; background:#121211; border:1px solid #30302d; color:#eee; border-radius:6px; padding:11px 12px; outline:none; font:inherit; font-size:12px; }
input:focus,textarea:focus,select:focus { border-color:#777; }
.field { display:grid; gap:7px; margin-bottom:14px; }
.field > span { color:#8d8d88; font-size:10px; }
.field-select { margin-bottom:14px; }
.grid2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px 15px; }
.editor-top,.editor-actions { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; margin-bottom:20px; }
.editor-top { grid-template-columns:1fr auto; }
.editor-top h2 { margin:0; }
.editor-actions { margin:22px 0 0; }
.editor-block { border-top:1px solid #2a2a27; padding-top:18px; margin-top:5px; }
.editor-block h3 { font-size:11px; color:#aaa; font-weight:500; }
.checks { display:flex; flex-wrap:wrap; gap:8px; }
.checks label,.toggle { font-size:11px; color:#aaa; padding:8px 10px; border:1px solid #30302d; border-radius:6px; }
.toggle { display:inline-flex; align-items:center; gap:8px; margin-top:4px; cursor:pointer; }
.toggle input,.checks input,.media-pick input { width:auto; }
.list { display:grid; gap:8px; }
.row-card { display:flex; align-items:center; gap:14px; border:1px solid #292927; background:#181817; padding:11px; border-radius:8px; }
.thumb { width:68px; height:52px; background:#111; border-radius:5px; overflow:hidden; display:grid; place-items:center; color:#555; font-size:8px; flex:none; }
.thumb img { width:100%; height:100%; object-fit:cover; }
.row-main { min-width:0; flex:1; display:grid; gap:5px; }
.row-main b { font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.row-main span,.row-main small { color:#777; font-size:10px; }
.media-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }
.media-card { overflow:hidden; border:1px solid #292927; border-radius:8px; background:#181817; }
.preview { aspect-ratio:16/10; background:#0d0d0c; display:grid; place-items:center; overflow:hidden; }
.preview img,.preview video { width:100%; height:100%; object-fit:cover; }
.media-meta { padding:13px; display:grid; gap:6px; }
.media-meta b { font-size:12px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.media-meta span { color:#777; font-size:10px; }
.media-actions { display:flex; gap:6px; margin-top:6px; }
.media-actions button { padding:7px 9px; font-size:10px; }
.media-picker { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:7px; }
.media-pick { padding:9px; border:1px solid #30302d; border-radius:6px; color:#999; font-size:10px; cursor:pointer; }
.media-pick.selected { border-color:#777; color:#eee; background:#20201e; }
.color-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:8px; margin-bottom:25px; }
.color-field { display:grid; grid-template-columns:1fr auto; align-items:center; gap:8px; border:1px solid #30302d; padding:9px; border-radius:6px; color:#888; font-size:10px; }
.color-field input { width:35px; height:28px; padding:0; }
.color-field code { grid-column:1/-1; color:#aaa; font-size:10px; }
.empty { border:1px dashed #343430; color:#666; padding:30px; text-align:center; border-radius:8px; font-size:11px; }
.admin-loading { min-height:100vh; display:grid; place-items:center; background:#141413; color:#777; font:12px Arial; }
@media(max-width:800px){ .admin{display:block}.sidebar{position:relative;width:100%;min-height:auto;border-right:0;border-bottom:1px solid #292927}.sidebar nav{grid-template-columns:repeat(4,1fr)}.logout{margin-top:15px}.grid2{grid-template-columns:1fr}.workspace{padding:25px 16px}.section-header{align-items:flex-start;flex-direction:column}.row-card{align-items:flex-start}.row-card>.ghost{margin-left:auto}.editor-actions{grid-template-columns:auto 1fr auto}.stats{grid-template-columns:repeat(2,1fr)} }

.font-section-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:20px;
  margin-top:30px;
}
.font-section-head h2{margin-bottom:6px}
.typography-controls{margin-top:20px}
.font-library{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  margin-top:15px;
}
.font-card{
  border:1px solid #343432;
  background:#181817;
  padding:18px;
  min-width:0;
}
.font-card-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:15px;
}
.font-card-top>div{
  display:flex;
  flex-direction:column;
  gap:6px;
  min-width:0;
}
.font-card-top b{
  font-size:14px;
  overflow:hidden;
  text-overflow:ellipsis;
}
.font-card-top span{
  color:#777;
  font-size:10px;
  letter-spacing:.08em;
}
.font-preview{
  margin:20px 0;
  padding:18px 0;
  border-top:1px solid #30302e;
  border-bottom:1px solid #30302e;
  font-size:22px;
  line-height:1.7;
  overflow-wrap:anywhere;
}
.font-preview div+div{
  margin-top:10px;
}
.font-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}
@media(max-width:900px){
  .font-library{grid-template-columns:1fr}
  .font-section-head{
    align-items:flex-start;
    flex-direction:column;
  }
}

`;
