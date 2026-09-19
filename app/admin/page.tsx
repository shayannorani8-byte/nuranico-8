'use client';

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Section =
  | 'dashboard'
  | 'content'
  | 'portfolio'
  | 'hero'
  | 'brands'
  | 'media'
  | 'appearance'
  | 'settings';

type Portfolio = {
  id: number;
  title_fa: string;
  title_en: string | null;
  description_fa: string | null;
  description_en: string | null;
  category: string;
  cover_url: string | null;
  media_url: string | null;
  media_type: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

type Brand = {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  published: boolean;
  sort_order: number;
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

const destinations = [
  { key: 'home', label: 'Home' },
  { key: 'work', label: 'Work' },
  { key: 'film', label: 'Film & Teasers' },
  { key: 'photography', label: 'Photography' },
  { key: 'content', label: 'Content' },
  { key: 'featured', label: 'Featured' },
  { key: 'bts', label: 'Behind the Scenes' },
];

const emptyPortfolio: Portfolio = {
  id: 0,
  title_fa: '',
  title_en: '',
  description_fa: '',
  description_en: '',
  category: 'content',
  cover_url: '',
  media_url: '',
  media_type: 'image',
  featured: false,
  published: true,
  sort_order: 0,
};

const emptyBrand: Brand = {
  id: 0,
  name: '',
  logo_url: '',
  website_url: '',
  published: true,
  sort_order: 0,
};

const emptyHero: HeroSlide = {
  id: 0,
  title_fa: '',
  title_en: '',
  description_fa: '',
  description_en: '',
  media_url: '',
  media_type: 'image',
  button_text_fa: '',
  button_text_en: '',
  button_url: '',
  sort_order: 0,
  published: true,
};

export default function AdminPage() {
  const [section, setSection] = useState<Section>('dashboard');

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  const [content, setContent] = useState<Record<string, unknown>>({});
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  const [destMap, setDestMap] = useState<Record<number, string[]>>({});

  const [editingPortfolio, setEditingPortfolio] =
    useState<Portfolio | null>(null);

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);

  const stats = useMemo(
    () => ({
      projects: portfolio.length,
      brands: brands.length,
      media: media.length,
      hero: heroSlides.length,
    }),
    [portfolio, brands, media, heroSlides]
  );

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setLoading(true);

    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      window.location.href = '/admin/login';
      return;
    }

    setAuthenticated(true);
    await loadAll();
    setLoading(false);
  }

  async function loadAll() {
    const [
      contentRes,
      settingsRes,
      portfolioRes,
      brandsRes,
      mediaRes,
      heroRes,
      destinationRes,
    ] = await Promise.all([
      supabaseBrowser.from('site_content').select('*').limit(1).maybeSingle(),
      supabaseBrowser.from('site_settings').select('*').limit(1).maybeSingle(),
      supabaseBrowser
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabaseBrowser
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabaseBrowser
        .from('media_assets')
        .select('*')
        .order('id', { ascending: false }),
      supabaseBrowser
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabaseBrowser.from('project_destinations').select('*'),
    ]);

    if (contentRes.data) {
      setContent(contentRes.data);
    }

    if (settingsRes.data) {
      setSettings(settingsRes.data);
    }

    if (portfolioRes.data) {
      setPortfolio(portfolioRes.data as Portfolio[]);
    }

    if (brandsRes.data) {
      setBrands(brandsRes.data as Brand[]);
    }

    if (mediaRes.data) {
      setMedia(mediaRes.data as MediaAsset[]);
    }

    if (heroRes.data) {
      setHeroSlides(heroRes.data as HeroSlide[]);
    }

    if (destinationRes.data) {
      const map: Record<number, string[]> = {};

      destinationRes.data.forEach((item: any) => {
        if (!map[item.project_id]) {
          map[item.project_id] = [];
        }

        map[item.project_id].push(item.destination);
      });

      setDestMap(map);
    }
  }

  function notify(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage('');
    }, 3500);
  }

  async function saveContent() {
    setSaving(true);

    const existing = await supabaseBrowser
      .from('site_content')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;

    if (existing.data?.id) {
      result = await supabaseBrowser
        .from('site_content')
        .update(content)
        .eq('id', existing.data.id);
    } else {
      result = await supabaseBrowser.from('site_content').insert(content);
    }

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Site content saved.');
      await loadAll();
    }

    setSaving(false);
  }

  async function saveSettings() {
    setSaving(true);

    const existing = await supabaseBrowser
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;

    if (existing.data?.id) {
      result = await supabaseBrowser
        .from('site_settings')
        .update(settings)
        .eq('id', existing.data.id);
    } else {
      result = await supabaseBrowser.from('site_settings').insert(settings);
    }

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Settings saved.');
      await loadAll();
    }

    setSaving(false);
  }

  async function saveProject() {
    if (!editingPortfolio) return;

    setSaving(true);

    const { id, ...payload } = editingPortfolio;

    let result;

    if (id) {
      result = await supabaseBrowser
        .from('portfolio')
        .update(payload)
        .eq('id', id);
    } else {
      result = await supabaseBrowser
        .from('portfolio')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      notify(result.error.message);
      setSaving(false);
      return;
    }

    const savedId = id || result.data?.id;

    if (savedId) {
      await supabaseBrowser
        .from('project_destinations')
        .delete()
        .eq('project_id', savedId);

      const selected = destMap[savedId] || [];

      if (selected.length) {
        await supabaseBrowser.from('project_destinations').insert(
          selected.map((destination) => ({
            project_id: savedId,
            destination,
          }))
        );
      }
    }

    notify('Project saved successfully.');
    setEditingPortfolio(null);

    await loadAll();

    setSaving(false);
  }

  function editProject(project: Portfolio) {
    setEditingPortfolio({ ...project });
    setSection('portfolio');
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this project?')) return;

    setSaving(true);

    await supabaseBrowser
      .from('project_destinations')
      .delete()
      .eq('project_id', id);

    await supabaseBrowser
      .from('project_media')
      .delete()
      .eq('project_id', id);

    await supabaseBrowser
      .from('project_seo')
      .delete()
      .eq('project_id', id);

    await supabaseBrowser
      .from('project_social')
      .delete()
      .eq('project_id', id);

    const result = await supabaseBrowser
      .from('portfolio')
      .delete()
      .eq('id', id);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Project deleted.');
    }

    setEditingPortfolio(null);
    await loadAll();

    setSaving(false);
  }

  function toggleDestination(projectId: number, destination: string) {
    setDestMap((current) => {
      const existing = current[projectId] || [];

      return {
        ...current,
        [projectId]: existing.includes(destination)
          ? existing.filter((item) => item !== destination)
          : [...existing, destination],
      };
    });
  }

  async function saveBrand() {
    if (!editingBrand) return;

    setSaving(true);

    const { id, ...payload } = editingBrand;

    const result = id
      ? await supabaseBrowser
          .from('brands')
          .update(payload)
          .eq('id', id)
      : await supabaseBrowser.from('brands').insert(payload);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Brand saved.');
      setEditingBrand(null);
      await loadAll();
    }

    setSaving(false);
  }

  async function deleteBrand(id: number) {
    if (!confirm('Delete this brand?')) return;

    const result = await supabaseBrowser
      .from('brands')
      .delete()
      .eq('id', id);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Brand deleted.');
    }

    setEditingBrand(null);
    await loadAll();
  }

  async function saveHero() {
    if (!editingHero) return;

    setSaving(true);

    const { id, ...payload } = editingHero;

    const result = id
      ? await supabaseBrowser
          .from('hero_slides')
          .update(payload)
          .eq('id', id)
      : await supabaseBrowser.from('hero_slides').insert(payload);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Hero slide saved.');
      setEditingHero(null);
      await loadAll();
    }

    setSaving(false);
  }

  async function deleteHero(id: number) {
    if (!confirm('Delete this hero slide?')) return;

    const result = await supabaseBrowser
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Hero slide deleted.');
    }

    setEditingHero(null);
    await loadAll();
  }

  async function uploadFile(file: File) {
    setSaving(true);

    const extension = file.name.split('.').pop() || 'file';

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const path = `admin/${filename}`;

    const upload = await supabaseBrowser.storage
      .from('nuranico-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (upload.error) {
      notify(upload.error.message);
      setSaving(false);
      return null;
    }

    const publicUrl = supabaseBrowser.storage
      .from('nuranico-media')
      .getPublicUrl(path).data.publicUrl;

    const inserted = await supabaseBrowser
      .from('media_assets')
      .insert({
        name: file.name,
        file_url: publicUrl,
        file_path: path,
        file_type: file.type.startsWith('video') ? 'video' : 'image',
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (inserted.error) {
      notify(inserted.error.message);
      setSaving(false);
      return null;
    }

    notify('File uploaded.');
    await loadAll();

    setSaving(false);

    return inserted.data;
  }

  async function deleteMedia(item: MediaAsset) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    setSaving(true);

    if (item.file_path) {
      await supabaseBrowser.storage
        .from('nuranico-media')
        .remove([item.file_path]);
    }

    const result = await supabaseBrowser
      .from('media_assets')
      .delete()
      .eq('id', item.id);

    if (result.error) {
      notify(result.error.message);
    } else {
      notify('Media deleted.');
    }

    await loadAll();
    setSaving(false);
  }

  async function logout() {
    await supabaseBrowser.auth.signOut();
    window.location.href = '/admin/login';
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading NURANICO CMS...
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>NURANICO</div>

        <div style={styles.sidebarLabel}>CMS</div>

        <NavButton
          active={section === 'dashboard'}
          onClick={() => setSection('dashboard')}
        >
          Dashboard
        </NavButton>

        <NavButton
          active={section === 'content'}
          onClick={() => setSection('content')}
        >
          Site Content
        </NavButton>

        <NavButton
          active={section === 'portfolio'}
          onClick={() => setSection('portfolio')}
        >
          Projects
        </NavButton>

        <NavButton
          active={section === 'hero'}
          onClick={() => setSection('hero')}
        >
          Hero Slider
        </NavButton>

        <NavButton
          active={section === 'brands'}
          onClick={() => setSection('brands')}
        >
          Brands
        </NavButton>

        <NavButton
          active={section === 'media'}
          onClick={() => setSection('media')}
        >
          Media Library
        </NavButton>

        <NavButton
          active={section === 'appearance'}
          onClick={() => setSection('appearance')}
        >
          Appearance
        </NavButton>

        <NavButton
          active={section === 'settings'}
          onClick={() => setSection('settings')}
        >
          Settings
        </NavButton>

        <button style={styles.logout} onClick={logout}>
          Logout
        </button>
      </aside>

      <section style={styles.content}>
        {message && <div style={styles.message}>{message}</div>}

        {section === 'dashboard' && (
          <>
            <PageTitle
              title="Dashboard"
              subtitle="NURANICO content management"
            />

            <div style={styles.statsGrid}>
              <Stat label="Projects" value={stats.projects} />
              <Stat label="Brands" value={stats.brands} />
              <Stat label="Media" value={stats.media} />
              <Stat label="Hero Slides" value={stats.hero} />
            </div>

            <div style={styles.panel}>
              <h2 style={styles.panelTitle}>Quick actions</h2>

              <div style={styles.actionGrid}>
                <button
                  style={styles.actionButton}
                  onClick={() => {
                    setEditingPortfolio({ ...emptyPortfolio });
                    setSection('portfolio');
                  }}
                >
                  + New Project
                </button>

                <button
                  style={styles.actionButton}
                  onClick={() => {
                    setEditingHero({ ...emptyHero });
                    setSection('hero');
                  }}
                >
                  + New Hero
                </button>

                <button
                  style={styles.actionButton}
                  onClick={() => {
                    setEditingBrand({ ...emptyBrand });
                    setSection('brands');
                  }}
                >
                  + New Brand
                </button>
              </div>
            </div>
          </>
        )}

        {section === 'content' && (
          <>
            <PageTitle
              title="Site Content"
              subtitle="Edit global website content as JSON"
            />

            <div style={styles.panel}>
              <JsonEditor
                value={content}
                onChange={setContent}
                label="Site Content"
              />

              <SaveButton
                saving={saving}
                onClick={saveContent}
              />
            </div>
          </>
        )}

        {section === 'portfolio' && (
          <>
            <PageTitle
              title="Projects"
              subtitle="Manage your portfolio work"
            />

            <button
              style={styles.primaryButton}
              onClick={() =>
                setEditingPortfolio({ ...emptyPortfolio })
              }
            >
              + New Project
            </button>

            {editingPortfolio && (
              <div style={styles.editor}>
                <div style={styles.editorHeader}>
                  <h2 style={styles.panelTitle}>
                    {editingPortfolio.id
                      ? 'Edit Project'
                      : 'New Project'}
                  </h2>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setEditingPortfolio(null)}
                  >
                    Close
                  </button>
                </div>

                <div style={styles.formGrid}>
                  <Field
                    label="Title FA"
                    value={editingPortfolio.title_fa}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        title_fa: value,
                      })
                    }
                  />

                  <Field
                    label="Title EN"
                    value={editingPortfolio.title_en || ''}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        title_en: value,
                      })
                    }
                  />

                  <Field
                    label="Category"
                    value={editingPortfolio.category}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        category: value,
                      })
                    }
                  />

                  <Field
                    label="Sort Order"
                    type="number"
                    value={String(editingPortfolio.sort_order)}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        sort_order: Number(value) || 0,
                      })
                    }
                  />

                  <Field
                    label="Cover URL"
                    value={editingPortfolio.cover_url || ''}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        cover_url: value,
                      })
                    }
                  />

                  <Field
                    label="Media URL"
                    value={editingPortfolio.media_url || ''}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        media_url: value,
                      })
                    }
                  />

                  <Field
                    label="Media Type"
                    value={editingPortfolio.media_type}
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        media_type: value,
                      })
                    }
                  />

                  <Field
                    label="Description FA"
                    value={editingPortfolio.description_fa || ''}
                    textarea
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        description_fa: value,
                      })
                    }
                  />

                  <Field
                    label="Description EN"
                    value={editingPortfolio.description_en || ''}
                    textarea
                    onChange={(value) =>
                      setEditingPortfolio({
                        ...editingPortfolio,
                        description_en: value,
                      })
                    }
                  />
                </div>

                <div style={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingPortfolio.featured}
                      onChange={(event) =>
                        setEditingPortfolio({
                          ...editingPortfolio,
                          featured: event.target.checked,
                        })
                      }
                    />{' '}
                    Featured
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={editingPortfolio.published}
                      onChange={(event) =>
                        setEditingPortfolio({
                          ...editingPortfolio,
                          published: event.target.checked,
                        })
                      }
                    />{' '}
                    Published
                  </label>
                </div>

                {editingPortfolio.id > 0 && (
                  <div style={styles.destinationBox}>
                    <h3 style={styles.smallTitle}>
                      Destinations
                    </h3>

                    <div style={styles.destinationGrid}>
                      {destinations.map((destination) => {
                        const selected = (
                          destMap[editingPortfolio.id] || []
                        ).includes(destination.key);

                        return (
                          <button
                            key={destination.key}
                            type="button"
                            style={{
                              ...styles.destinationButton,
                              ...(selected
                                ? styles.destinationActive
                                : {}),
                            }}
                            onClick={() =>
                              toggleDestination(
                                editingPortfolio.id,
                                destination.key
                              )
                            }
                          >
                            {destination.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={styles.buttonRow}>
                  <SaveButton
                    saving={saving}
                    onClick={saveProject}
                  />

                  {editingPortfolio.id > 0 && (
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        deleteProject(editingPortfolio.id)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={styles.list}>
              {portfolio.map((project) => (
                <div style={styles.listItem} key={project.id}>
                  <div>
                    <strong>{project.title_en || project.title_fa}</strong>
                    <span style={styles.muted}>
                      {project.category}
                    </span>
                  </div>

                  <div style={styles.rowActions}>
                    <button
                      style={styles.smallButton}
                      onClick={() => editProject(project)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.smallDelete}
                      onClick={() => deleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!portfolio.length && (
                <EmptyState text="No projects yet." />
              )}
            </div>
          </>
        )}

        {section === 'hero' && (
          <>
            <PageTitle
              title="Hero Slider"
              subtitle="Manage homepage hero slides"
            />

            <button
              style={styles.primaryButton}
              onClick={() => setEditingHero({ ...emptyHero })}
            >
              + New Hero Slide
            </button>

            {editingHero && (
              <div style={styles.editor}>
                <div style={styles.editorHeader}>
                  <h2 style={styles.panelTitle}>
                    {editingHero.id
                      ? 'Edit Hero'
                      : 'New Hero'}
                  </h2>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setEditingHero(null)}
                  >
                    Close
                  </button>
                </div>

                <div style={styles.formGrid}>
                  <Field
                    label="Title FA"
                    value={editingHero.title_fa || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        title_fa: value,
                      })
                    }
                  />

                  <Field
                    label="Title EN"
                    value={editingHero.title_en || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        title_en: value,
                      })
                    }
                  />

                  <Field
                    label="Media URL"
                    value={editingHero.media_url || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        media_url: value,
                      })
                    }
                  />

                  <Field
                    label="Media Type"
                    value={editingHero.media_type}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        media_type: value,
                      })
                    }
                  />

                  <Field
                    label="Button Text FA"
                    value={editingHero.button_text_fa || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        button_text_fa: value,
                      })
                    }
                  />

                  <Field
                    label="Button Text EN"
                    value={editingHero.button_text_en || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        button_text_en: value,
                      })
                    }
                  />

                  <Field
                    label="Button URL"
                    value={editingHero.button_url || ''}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        button_url: value,
                      })
                    }
                  />

                  <Field
                    label="Sort Order"
                    type="number"
                    value={String(editingHero.sort_order)}
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        sort_order: Number(value) || 0,
                      })
                    }
                  />

                  <Field
                    label="Description FA"
                    value={editingHero.description_fa || ''}
                    textarea
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        description_fa: value,
                      })
                    }
                  />

                  <Field
                    label="Description EN"
                    value={editingHero.description_en || ''}
                    textarea
                    onChange={(value) =>
                      setEditingHero({
                        ...editingHero,
                        description_en: value,
                      })
                    }
                  />
                </div>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingHero.published}
                    onChange={(event) =>
                      setEditingHero({
                        ...editingHero,
                        published: event.target.checked,
                      })
                    }
                  />{' '}
                  Published
                </label>

                <div style={styles.buttonRow}>
                  <SaveButton
                    saving={saving}
                    onClick={saveHero}
                  />

                  {editingHero.id > 0 && (
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        deleteHero(editingHero.id)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={styles.list}>
              {heroSlides.map((slide) => (
                <div style={styles.listItem} key={slide.id}>
                  <div>
                    <strong>
                      {slide.title_en ||
                        slide.title_fa ||
                        `Hero #${slide.id}`}
                    </strong>

                    <span style={styles.muted}>
                      {slide.media_type}
                    </span>
                  </div>

                  <button
                    style={styles.smallButton}
                    onClick={() =>
                      setEditingHero({ ...slide })
                    }
                  >
                    Edit
                  </button>
                </div>
              ))}

              {!heroSlides.length && (
                <EmptyState text="No hero slides yet." />
              )}
            </div>
          </>
        )}

        {section === 'brands' && (
          <>
            <PageTitle
              title="Brands"
              subtitle="Manage client and partner logos"
            />

            <button
              style={styles.primaryButton}
              onClick={() => setEditingBrand({ ...emptyBrand })}
            >
              + New Brand
            </button>

            {editingBrand && (
              <div style={styles.editor}>
                <div style={styles.editorHeader}>
                  <h2 style={styles.panelTitle}>
                    {editingBrand.id
                      ? 'Edit Brand'
                      : 'New Brand'}
                  </h2>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setEditingBrand(null)}
                  >
                    Close
                  </button>
                </div>

                <div style={styles.formGrid}>
                  <Field
                    label="Brand Name"
                    value={editingBrand.name}
                    onChange={(value) =>
                      setEditingBrand({
                        ...editingBrand,
                        name: value,
                      })
                    }
                  />

                  <Field
                    label="Logo URL"
                    value={editingBrand.logo_url || ''}
                    onChange={(value) =>
                      setEditingBrand({
                        ...editingBrand,
                        logo_url: value,
                      })
                    }
                  />

                  <Field
                    label="Website URL"
                    value={editingBrand.website_url || ''}
                    onChange={(value) =>
                      setEditingBrand({
                        ...editingBrand,
                        website_url: value,
                      })
                    }
                  />

                  <Field
                    label="Sort Order"
                    type="number"
                    value={String(editingBrand.sort_order)}
                    onChange={(value) =>
                      setEditingBrand({
                        ...editingBrand,
                        sort_order: Number(value) || 0,
                      })
                    }
                  />
                </div>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingBrand.published}
                    onChange={(event) =>
                      setEditingBrand({
                        ...editingBrand,
                        published: event.target.checked,
                      })
                    }
                  />{' '}
                  Published
                </label>

                <div style={styles.buttonRow}>
                  <SaveButton
                    saving={saving}
                    onClick={saveBrand}
                  />

                  {editingBrand.id > 0 && (
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        deleteBrand(editingBrand.id)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={styles.list}>
              {brands.map((brand) => (
                <div style={styles.listItem} key={brand.id}>
                  <div style={styles.brandItem}>
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        style={styles.brandLogo}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        LOGO
                      </div>
                    )}

                    <div>
                      <strong>{brand.name}</strong>

                      <span style={styles.muted}>
                        {brand.website_url || 'No website'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.rowActions}>
                    <button
                      style={styles.smallButton}
                      onClick={() =>
                        setEditingBrand({ ...brand })
                      }
                    >
                      Edit
                    </button>

                    <button
                      style={styles.smallDelete}
                      onClick={() => deleteBrand(brand.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!brands.length && (
                <EmptyState text="No brands yet." />
              )}
            </div>
          </>
        )}

        {section === 'media' && (
          <>
            <PageTitle
              title="Media Library"
              subtitle="Upload and manage images and videos"
            />

            <div style={styles.uploadBox}>
              <label style={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      uploadFile(file);
                    }

                    event.currentTarget.value = '';
                  }}
                />

                <span style={styles.uploadIcon}>+</span>
                Upload image or video
              </label>
            </div>

            <div style={styles.mediaGrid}>
              {media.map((item) => (
                <div style={styles.mediaCard} key={item.id}>
                  <div style={styles.mediaPreview}>
                    {item.file_type === 'video' ? (
                      <video
                        src={item.file_url}
                        muted
                        controls
                        style={styles.mediaElement}
                      />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={item.name}
                        style={styles.mediaElement}
                      />
                    )}
                  </div>

                  <div style={styles.mediaInfo}>
                    <strong>{item.name}</strong>

                    <span style={styles.muted}>
                      {item.file_type || item.mime_type || 'file'}
                    </span>

                    <button
                      style={styles.smallDelete}
                      onClick={() => deleteMedia(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!media.length && (
              <EmptyState text="No media uploaded yet." />
            )}
          </>
        )}

        {section === 'appearance' && (
          <>
            <PageTitle
              title="Appearance"
              subtitle="Global visual settings"
            />

            <div style={styles.panel}>
              <JsonEditor
                value={settings}
                onChange={setSettings}
                label="Appearance / Settings"
              />

              <SaveButton
                saving={saving}
                onClick={saveSettings}
              />
            </div>
          </>
        )}

        {section === 'settings' && (
          <>
            <PageTitle
              title="Settings"
              subtitle="Website configuration"
            />

            <div style={styles.panel}>
              <JsonEditor
                value={settings}
                onChange={setSettings}
                label="Site Settings"
              />

              <SaveButton
                saving={saving}
                onClick={saveSettings}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function NavButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navButton,
        ...(active ? styles.navButtonActive : {}),
      }}
    >
      {children}
    </button>
  );
}

function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={styles.pageTitle}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={styles.textarea}
          rows={5}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={styles.input}
        />
      )}
    </label>
  );
}

function SaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={styles.primaryButton}
      onClick={onClick}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

function JsonEditor({
  value,
  onChange,
  label,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  label: string;
}) {
  const [text, setText] = useState(() =>
    JSON.stringify(value, null, 2)
  );

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  function handleChange(next: string) {
    setText(next);

    try {
      const parsed = JSON.parse(next);

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        onChange(parsed);
      }
    } catch {
      // Wait until JSON becomes valid.
    }
  }

  return (
    <label style={styles.field}>
      <span>{label}</span>

      <textarea
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        style={styles.codeArea}
        spellCheck={false}
        rows={18}
      />
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={styles.empty}>
      {text}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#101010',
    color: '#f5f5f5',
    fontFamily:
      'Arial, Helvetica, sans-serif',
  },

  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#101010',
    color: '#aaa',
    fontFamily:
      'Arial, Helvetica, sans-serif',
  },

  sidebar: {
    width: 230,
    minHeight: '100vh',
    padding: '32px 20px',
    borderRight: '1px solid #262626',
    background: '#0b0b0b',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    boxSizing: 'border-box',
  },

  logo: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 4,
    marginBottom: 40,
  },

  sidebarLabel: {
    color: '#555',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  navButton: {
    width: '100%',
    border: 0,
    background: 'transparent',
    color: '#777',
    textAlign: 'left',
    padding: '12px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 4,
    fontSize: 13,
  },

  navButtonActive: {
    background: '#1d1d1d',
    color: '#fff',
  },

  logout: {
    width: '100%',
    marginTop: 40,
    padding: '12px 10px',
    border: '1px solid #292929',
    borderRadius: 8,
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
  },

  content: {
    flex: 1,
    padding: '42px 50px',
    maxWidth: 1400,
    boxSizing: 'border-box',
  },

  message: {
    position: 'fixed',
    top: 22,
    right: 22,
    zIndex: 20,
    background: '#fff',
    color: '#111',
    padding: '13px 18px',
    borderRadius: 8,
    fontSize: 13,
    boxShadow: '0 10px 30px rgba(0,0,0,.3)',
  },

  pageTitle: {
    marginBottom: 30,
  },

  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 500,
  },

  pageTitleH1: {
    fontSize: 34,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 30,
  },

  stat: {
    background: '#171717',
    border: '1px solid #242424',
    borderRadius: 12,
    padding: 24,
  },

  panel: {
    background: '#151515',
    border: '1px solid #242424',
    borderRadius: 12,
    padding: 25,
    marginBottom: 25,
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },

  actionButton: {
    border: '1px solid #303030',
    background: '#1c1c1c',
    color: '#fff',
    padding: 18,
    borderRadius: 9,
    cursor: 'pointer',
    textAlign: 'left',
  },

  primaryButton: {
    border: 0,
    background: '#f5f5f5',
    color: '#111',
    padding: '12px 18px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: 22,
  },

  secondaryButton: {
    border: '1px solid #333',
    background: 'transparent',
    color: '#aaa',
    padding: '9px 14px',
    borderRadius: 7,
    cursor: 'pointer',
  },

  deleteButton: {
    border: '1px solid #592b2b',
    background: '#211414',
    color: '#e88',
    padding: '12px 18px',
    borderRadius: 8,
    cursor: 'pointer',
  },

  editor: {
    background: '#151515',
    border: '1px solid #292929',
    borderRadius: 12,
    padding: 25,
    marginBottom: 30,
  },

  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: 18,
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 18,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #303030',
    background: '#0e0e0e',
    color: '#eee',
    borderRadius: 7,
    padding: '12px 13px',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #303030',
    background: '#0e0e0e',
    color: '#eee',
    borderRadius: 7,
    padding: '12px 13px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  codeArea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #303030',
    background: '#0b0b0b',
    color: '#ddd',
    borderRadius: 7,
    padding: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily:
      'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.6,
  },

  checkboxRow: {
    display: 'flex',
    gap: 25,
    margin: '8px 0 25px',
  },

  checkboxLabel: {
    display: 'block',
    margin: '10px 0 25px',
    color: '#bbb',
  },

  destinationBox: {
    borderTop: '1px solid #292929',
    paddingTop: 20,
    marginTop: 20,
  },

  smallTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#aaa',
    marginBottom: 14,
  },

  destinationGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },

  destinationButton: {
    border: '1px solid #303030',
    background: '#101010',
    color: '#777',
    borderRadius: 20,
    padding: '8px 13px',
    cursor: 'pointer',
  },

  destinationActive: {
    background: '#eee',
    color: '#111',
    borderColor: '#eee',
  },

  buttonRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    marginTop: 25,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#151515',
    border: '1px solid #252525',
    borderRadius: 9,
    padding: '16px 18px',
  },

  rowActions: {
    display: 'flex',
    gap: 7,
  },

  smallButton: {
    border: '1px solid #303030',
    background: '#202020',
    color: '#ddd',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  smallDelete: {
    border: '1px solid #4a2929',
    background: '#1c1111',
    color: '#d88',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  muted: {
    display: 'block',
    color: '#666',
    fontSize: 11,
    marginTop: 5,
  },

  brandItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },

  brandLogo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
    background: '#fff',
    borderRadius: 7,
    padding: 5,
    boxSizing: 'border-box',
  },

  logoPlaceholder: {
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#222',
    color: '#666',
    borderRadius: 7,
    fontSize: 9,
  },

  uploadBox: {
    border: '1px dashed #383838',
    borderRadius: 12,
    padding: 35,
    marginBottom: 25,
    textAlign: 'center',
    background: '#141414',
  },

  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    color: '#bbb',
    cursor: 'pointer',
  },

  uploadIcon: {
    fontSize: 25,
    color: '#fff',
  },

  mediaGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: 15,
  },

  mediaCard: {
    background: '#151515',
    border: '1px solid #272727',
    borderRadius: 10,
    overflow: 'hidden',
  },

  mediaPreview: {
    width: '100%',
    height: 190,
    background: '#0b0b0b',
  },

  mediaElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  mediaInfo: {
    padding: 13,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  empty: {
    border: '1px dashed #303030',
    borderRadius: 10,
    padding: 35,
    textAlign: 'center',
    color: '#555',
    marginTop: 15,
  },
};