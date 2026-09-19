'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';

type Section =
  | 'dashboard'
  | 'content'
  | 'portfolio'
  | 'brands'
  | 'media'
  | 'appearance'
  | 'settings';

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
  contact_title_fa: string;
  contact_title_en: string;
  contact_email: string;
  contact_phone: string;
  contact_instagram: string;
  seo_title_fa: string;
  seo_title_en: string;
  seo_description_fa: string;
  seo_description_en: string;
};

type Appearance = {
  bg_color: string;
  text_color: string;
  button_color: string;
  surface_color: string;
  muted_color: string;
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
};

type PortfolioItem = {
  id: number;
  title_fa: string;
  title_en: string;
  description_fa: string;
  description_en: string;
  category: string;
  cover_url: string | null;
  media_url: string | null;
  media_type: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  media_sources?: Record<string, string> | null;
  gallery_urls?: string[] | null;
  brand_id?: number | null;
  bts_media_url?: string | null;
  bts_media_type?: string | null;
  bts_gallery_urls?: string[] | null;
};

type Brand = {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  published: boolean;
  sort_order: number;
};

type Media = {
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

const defaultContent: Content = {
  hero_title_fa: 'تصویر می‌سازیم، اثر می‌گذاریم.',
  hero_title_en: 'We create images that leave an impact.',
  hero_description_fa:
    'استودیو خلاق NURANICO برای برندهایی که می‌خواهند متفاوت دیده شوند.',
  hero_description_en:
    'NURANICO creative studio for brands that want to be seen differently.',
  hero_button_fa: 'شروع یک پروژه',
  hero_button_en: 'Start a project',
  about_title_fa: 'درباره NURANICO',
  about_title_en: 'About NURANICO',
  about_text_fa: '',
  about_text_en: '',
  contact_title_fa: 'بیایید چیزی بسازیم.',
  contact_title_en: 'Let’s create something.',
  contact_email: 'hello@nuranico.com',
  contact_phone: '',
  contact_instagram: '',
  seo_title_fa: 'NURANICO — Creative Studio',
  seo_title_en: 'NURANICO — Creative Studio',
  seo_description_fa: '',
  seo_description_en: '',
};

const defaultAppearance: Appearance = {
  bg_color: '#f2f0eb',
  text_color: '#111111',
  button_color: '#111111',
  surface_color: '#ddd9d0',
  muted_color: '#666666',
  heading_color: '#111111',
  logo_color: '#111111',
  link_color: '#111111',
  nav_bg: '#f2f0eb',
  nav_text: '#111111',
  nav_active: '#111111',
  button_text: '#ffffff',
  button_hover: '#333333',
  card_bg: '#ddd9d0',
  card_text: '#111111',
  tag_color: '#666666',
  footer_bg: '#111111',
  footer_text: '#ffffff',
  border_color: '#bdbab2',
};

const defaultFonts = {
  persian: 'Vazirmatn',
  heading: 'Vazirmatn',
  english: 'Inter',
  weight: '400',
};

const defaultLanguage = {
  defaultLanguage: 'fa',
  englishEnabled: true,
};

const navItems: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'داشبورد' },
  { id: 'content', label: 'محتوای سایت' },
  { id: 'portfolio', label: 'نمونه‌کارها' },
  { id: 'brands', label: 'برندها' },
  { id: 'media', label: 'Media' },
  { id: 'appearance', label: 'ظاهر و فونت' },
  { id: 'settings', label: 'تنظیمات' },
];

export default function AdminPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [content, setContent] = useState<Content>(defaultContent);
  const [appearance, setAppearance] =
    useState<Appearance>(defaultAppearance);
  const [fonts, setFonts] = useState(defaultFonts);
  const [language, setLanguage] = useState(defaultLanguage);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const [editingPortfolio, setEditingPortfolio] =
    useState<PortfolioItem | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadEverything();
  }, []);

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  }

  async function loadEverything() {
    setLoading(true);

    const [
      contentResult,
      settingsResult,
      portfolioResult,
      brandsResult,
      mediaResult,
    ] = await Promise.all([
      supabase.from('site_content').select('*').limit(1).maybeSingle(),
      supabase.from('site_settings').select('*').limit(1).maybeSingle(),
      supabase
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true }),
      supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (contentResult.data) {
      setContent({ ...defaultContent, ...contentResult.data });
    }

    if (settingsResult.data) {
      const row = settingsResult.data;

      const appearanceData =
        row.appearance && typeof row.appearance === 'object'
          ? row.appearance
          : {};

      const fontsData =
        row.fonts && typeof row.fonts === 'object' ? row.fonts : {};

      const languageData =
        row.language && typeof row.language === 'object'
          ? row.language
          : {};

      setAppearance({
        ...defaultAppearance,
        ...appearanceData,
        bg_color: row.bg_color || appearanceData.bg_color || defaultAppearance.bg_color,
        text_color:
          row.text_color ||
          appearanceData.text_color ||
          defaultAppearance.text_color,
        button_color:
          row.button_color ||
          appearanceData.button_color ||
          defaultAppearance.button_color,
      });

      setFonts({ ...defaultFonts, ...fontsData });
      setLanguage({ ...defaultLanguage, ...languageData });
    }

    setPortfolio(portfolioResult.data || []);
    setBrands(brandsResult.data || []);
    setMedia(mediaResult.data || []);

    setLoading(false);
  }

  async function saveContent() {
    setSaving(true);

    const payload = {
      ...content,
      updated_at: new Date().toISOString(),
    };

    const result = content.id
      ? await supabase
          .from('site_content')
          .update(payload)
          .eq('id', content.id)
      : await supabase
          .from('site_content')
          .insert(payload)
          .select()
          .single();

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      if (result.data) setContent(result.data);
      notify('محتوای سایت ذخیره شد ✓');
    }

    setSaving(false);
  }

  async function saveAppearance() {
    setSaving(true);

    const result = await supabase
      .from('site_settings')
      .update({
        bg_color: appearance.bg_color,
        text_color: appearance.text_color,
        button_color: appearance.button_color,
        appearance,
        fonts,
        language,
      })
      .not('id', 'is', null);

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      notify('ظاهر، رنگ‌ها، فونت و زبان ذخیره شد ✓');
    }

    setSaving(false);
  }

  async function uploadFile(
    file: File,
    folder: string
  ): Promise<{ url: string; path: string } | null> {
    const extension = file.name.split('.').pop() || 'file';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    const path = `${folder}/${Date.now()}-${safeName}.${extension}`;

    const upload = await supabase.storage
      .from('nuranico-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (upload.error) {
      notify(`خطای آپلود: ${upload.error.message}`);
      return null;
    }

    const publicUrl = supabase.storage
      .from('nuranico-media')
      .getPublicUrl(path).data.publicUrl;

    return {
      url: publicUrl,
      path,
    };
  }

  async function handleMediaUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setSaving(true);

    for (const file of files) {
      const uploaded = await uploadFile(file, 'media');

      if (!uploaded) continue;

      const result = await supabase
        .from('media_assets')
        .insert({
          name: file.name,
          file_url: uploaded.url,
          file_path: uploaded.path,
          file_type: file.type.startsWith('video') ? 'video' : 'image',
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (result.data) {
        setMedia((prev) => [result.data, ...prev]);
      }
    }

    notify('فایل‌ها با موفقیت آپلود شدند ✓');
    setSaving(false);
    e.target.value = '';
  }

  async function deleteStorageFile(path: string | null) {
    if (!path) return;

    await supabase.storage.from('nuranico-media').remove([path]);
  }

  async function deleteMedia(item: Media) {
    if (!confirm(`حذف "${item.name}"؟`)) return;

    setSaving(true);

    await deleteStorageFile(item.file_path);

    const result = await supabase
      .from('media_assets')
      .delete()
      .eq('id', item.id);

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      setMedia((prev) => prev.filter((x) => x.id !== item.id));
      notify('فایل حذف شد ✓');
    }

    setSaving(false);
  }

  function emptyPortfolio(): PortfolioItem {
    return {
      id: 0,
      title_fa: '',
      title_en: '',
      description_fa: '',
      description_en: '',
      category: 'video',
      cover_url: null,
      media_url: null,
      media_type: 'image',
      featured: false,
      published: true,
      sort_order: portfolio.length,
      media_sources: null,
      gallery_urls: [],
      brand_id: null,
      bts_media_url: null,
      bts_media_type: null,
      bts_gallery_urls: [],
    };
  }

  async function uploadPortfolioMedia(
    file: File,
    field: 'cover_url' | 'media_url' | 'bts_media_url'
  ) {
    const uploaded = await uploadFile(file, field === 'bts_media_url' ? 'behind-the-scenes' : 'portfolio');

    if (!uploaded) return;

    setEditingPortfolio((prev) =>
      prev
        ? {
            ...prev,
            [field]: uploaded.url,
            media_type:
              field === 'media_url' && file.type.startsWith('video') ? 'video' : prev.media_type,
            bts_media_type:
              field === 'bts_media_url' ? (file.type.startsWith('video') ? 'video' : 'image') : prev.bts_media_type,
          }
        : prev
    );
  }

  async function savePortfolio() {
    if (!editingPortfolio) return;

    if (!editingPortfolio.title_fa.trim()) {
      notify('عنوان فارسی نمونه‌کار را وارد کن.');
      return;
    }

    setSaving(true);

    const payload = {
      title_fa: editingPortfolio.title_fa,
      title_en: editingPortfolio.title_en,
      description_fa: editingPortfolio.description_fa,
      description_en: editingPortfolio.description_en,
      category: editingPortfolio.category,
      cover_url: editingPortfolio.cover_url,
      media_url: editingPortfolio.media_url,
      media_type: editingPortfolio.media_type,
      featured: editingPortfolio.featured,
      published: editingPortfolio.published,
      sort_order: editingPortfolio.sort_order,
      media_sources: editingPortfolio.media_sources || null,
      gallery_urls: editingPortfolio.gallery_urls || [],
      brand_id: editingPortfolio.brand_id || null,
      bts_media_url: editingPortfolio.bts_media_url || null,
      bts_media_type: editingPortfolio.bts_media_type || null,
      bts_gallery_urls: editingPortfolio.bts_gallery_urls || [],
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingPortfolio.id) {
      result = await supabase
        .from('portfolio')
        .update(payload)
        .eq('id', editingPortfolio.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('portfolio')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else if (result.data) {
      setPortfolio((prev) => {
        const exists = prev.some((x) => x.id === result.data.id);
        return exists
          ? prev.map((x) => (x.id === result.data.id ? result.data : x))
          : [...prev, result.data];
      });

      setEditingPortfolio(null);
      notify('نمونه‌کار ذخیره شد ✓');
    }

    setSaving(false);
  }

  async function deletePortfolio(item: PortfolioItem) {
    if (!confirm(`نمونه‌کار "${item.title_fa}" حذف شود؟`)) return;

    setSaving(true);

    const result = await supabase
      .from('portfolio')
      .delete()
      .eq('id', item.id);

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      setPortfolio((prev) => prev.filter((x) => x.id !== item.id));
      notify('نمونه‌کار حذف شد ✓');
    }

    setSaving(false);
  }

  function emptyBrand(): Brand {
    return {
      id: 0,
      name: '',
      logo_url: null,
      website_url: null,
      published: true,
      sort_order: brands.length,
    };
  }

  async function uploadBrandLogo(file: File) {
    const uploaded = await uploadFile(file, 'brands');

    if (!uploaded) return;

    setEditingBrand((prev) =>
      prev ? { ...prev, logo_url: uploaded.url } : prev
    );
  }

  async function saveBrand() {
    if (!editingBrand) return;

    if (!editingBrand.name.trim()) {
      notify('نام برند را وارد کن.');
      return;
    }

    setSaving(true);

    const payload = {
      name: editingBrand.name,
      logo_url: editingBrand.logo_url,
      website_url: editingBrand.website_url,
      published: editingBrand.published,
      sort_order: editingBrand.sort_order,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingBrand.id) {
      result = await supabase
        .from('brands')
        .update(payload)
        .eq('id', editingBrand.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('brands')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else if (result.data) {
      setBrands((prev) => {
        const exists = prev.some((x) => x.id === result.data.id);
        return exists
          ? prev.map((x) => (x.id === result.data.id ? result.data : x))
          : [...prev, result.data];
      });

      setEditingBrand(null);
      notify('برند ذخیره شد ✓');
    }

    setSaving(false);
  }

  async function deleteBrand(item: Brand) {
    if (!confirm(`برند "${item.name}" حذف شود؟`)) return;

    setSaving(true);

    const result = await supabase
      .from('brands')
      .delete()
      .eq('id', item.id);

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      setBrands((prev) => prev.filter((x) => x.id !== item.id));
      notify('برند حذف شد ✓');
    }

    setSaving(false);
  }

  async function uploadSiteLogo(file: File, type: 'logo' | 'favicon') {
    const uploaded = await uploadFile(file, type);

    if (!uploaded) return;

    const update =
      type === 'logo'
        ? { logo_url: uploaded.url }
        : { favicon_url: uploaded.url };

    const result = await supabase
      .from('site_settings')
      .update(update)
      .not('id', 'is', null);

    if (result.error) {
      notify(`خطا: ${result.error.message}`);
    } else {
      notify(type === 'logo' ? 'لوگو ذخیره شد ✓' : 'Favicon ذخیره شد ✓');
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f2f0eb',
          color: '#111',
          fontFamily: 'Vazirmatn, sans-serif',
        }}
      >
        در حال بارگذاری پنل مدیریت...
      </main>
    );
  }

  return (
    <main className="admin-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">NURANICO®</div>

        <div className="sidebar-title">مدیریت سایت</div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={section === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="view-site"
        >
          مشاهده سایت ↗
        </a>
      </aside>

      <section className="admin-main">
        <header className="topbar">
          <div>
            <div className="eyebrow">NURANICO CMS</div>
            <h1>{navItems.find((x) => x.id === section)?.label}</h1>
          </div>

          {message && <div className="toast">{message}</div>}
        </header>

        {section === 'dashboard' && (
          <Dashboard
            portfolio={portfolio}
            brands={brands}
            media={media}
            onNavigate={setSection}
          />
        )}

        {section === 'content' && (
          <ContentEditor
            content={content}
            setContent={setContent}
            saving={saving}
            onSave={saveContent}
          />
        )}

        {section === 'portfolio' && (
          <PortfolioManager
            items={portfolio}
            editing={editingPortfolio}
            setEditing={setEditingPortfolio}
            saving={saving}
            onSave={savePortfolio}
            onDelete={deletePortfolio}
            onUpload={uploadPortfolioMedia}
          />
        )}

        {section === 'brands' && (
          <BrandsManager
            items={brands}
            editing={editingBrand}
            setEditing={setEditingBrand}
            saving={saving}
            onSave={saveBrand}
            onDelete={deleteBrand}
            onUpload={uploadBrandLogo}
          />
        )}

        {section === 'media' && (
          <MediaManager
            items={media}
            saving={saving}
            onUpload={handleMediaUpload}
            onDelete={deleteMedia}
          />
        )}

        {section === 'appearance' && (
          <AppearanceEditor
            appearance={appearance}
            setAppearance={setAppearance}
            fonts={fonts}
            setFonts={setFonts}
            language={language}
            setLanguage={setLanguage}
            saving={saving}
            onSave={saveAppearance}
          />
        )}

        {section === 'settings' && (
          <SettingsManager
            onUploadLogo={uploadSiteLogo}
          />
        )}
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f2f0eb;
          color: #111;
          font-family: Vazirmatn, Arial, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .admin-shell {
          min-height: 100vh;
          display: flex;
          background: #f2f0eb;
          color: #111;
        }

        .sidebar {
          width: 260px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          align-self: flex-start;
          padding: 32px 22px;
          border-left: 1px solid #bdbab2;
          background: #111;
          color: white;
        }

        .brand {
          font-family: Arial, sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          font-size: 19px;
        }

        .sidebar-title {
          color: #999;
          font-size: 12px;
          margin: 45px 0 16px;
        }

        .sidebar nav {
          display: grid;
          gap: 7px;
        }

        .nav-item {
          border: 0;
          background: transparent;
          color: #aaa;
          text-align: right;
          padding: 13px 14px;
          border-radius: 8px;
        }

        .nav-item:hover,
        .nav-item.active {
          background: #262626;
          color: white;
        }

        .view-site {
          display: block;
          margin-top: 35px;
          color: #999;
          text-decoration: none;
          font-size: 13px;
        }

        .admin-main {
          flex: 1;
          min-width: 0;
          padding: 36px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #777;
          font-family: Arial, sans-serif;
          font-size: 11px;
          letter-spacing: 0.16em;
          margin-bottom: 8px;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        h1 {
          font-size: 30px;
          margin-bottom: 0;
        }

        h2 {
          font-size: 20px;
        }

        .toast {
          background: #111;
          color: white;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 13px;
        }

        .grid {
          display: grid;
          gap: 18px;
        }

        .grid-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .grid-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .card {
          background: white;
          border: 1px solid #d4d0c8;
          border-radius: 14px;
          padding: 22px;
        }

        .stat {
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stat-number {
          font-size: 42px;
          font-family: Arial, sans-serif;
        }

        .stat-label {
          color: #777;
          font-size: 13px;
        }

        .section-card {
          margin-bottom: 20px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .field {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }

        .field label {
          font-size: 12px;
          color: #555;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #c8c4bc;
          border-radius: 8px;
          padding: 12px 13px;
          background: #fff;
          color: #111;
          outline: none;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #111;
        }

        textarea {
          min-height: 130px;
          resize: vertical;
        }

        .button {
          border: 0;
          background: #111;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
        }

        .button.secondary {
          background: #e8e5df;
          color: #111;
        }

        .button.danger {
          background: #9b2020;
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 14px 10px;
          border-bottom: 1px solid #ddd9d0;
          text-align: right;
          white-space: nowrap;
          font-size: 13px;
        }

        th {
          color: #666;
          font-weight: 500;
        }

        .thumb {
          width: 72px;
          height: 52px;
          border-radius: 6px;
          object-fit: cover;
          background: #ddd9d0;
          display: block;
        }

        .upload-box {
          border: 1px dashed #aaa;
          border-radius: 10px;
          padding: 22px;
          text-align: center;
          color: #666;
        }

        .upload-box input {
          border: 0;
          padding: 0;
          margin-top: 10px;
        }

        .switch {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .switch input {
          width: auto;
        }

        .color-row {
          display: grid;
          grid-template-columns: 1fr 80px;
          gap: 10px;
          align-items: center;
        }

        .color-row input[type='color'] {
          padding: 3px;
          height: 45px;
        }

        .preview {
          width: 100%;
          height: 150px;
          border-radius: 10px;
          margin-top: 10px;
          border: 1px solid #ccc;
        }

        .logo-preview {
          width: 120px;
          height: 70px;
          object-fit: contain;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #eee;
          padding: 8px;
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 210px;
          }

          .admin-main {
            padding: 24px;
          }

          .grid-2,
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .admin-shell {
            display: block;
          }

          .sidebar {
            width: 100%;
            min-height: auto;
            position: static;
            border-left: 0;
            border-bottom: 1px solid #333;
          }

          .sidebar nav {
            display: flex;
            overflow-x: auto;
          }

          .nav-item {
            white-space: nowrap;
          }

          .admin-main {
            padding: 18px;
          }

          .topbar {
            display: block;
          }

          .toast {
            margin-top: 15px;
          }
        }
      `}</style>
    </main>
  );
}

function Dashboard({
  portfolio,
  brands,
  media,
  onNavigate,
}: {
  portfolio: PortfolioItem[];
  brands: Brand[];
  media: Media[];
  onNavigate: (section: Section) => void;
}) {
  return (
    <div className="grid grid-3">
      <div className="card stat">
        <div className="stat-number">{portfolio.length}</div>
        <div className="stat-label">نمونه‌کار</div>
        <button
          className="button secondary"
          onClick={() => onNavigate('portfolio')}
        >
          مدیریت نمونه‌کار
        </button>
      </div>

      <div className="card stat">
        <div className="stat-number">{brands.length}</div>
        <div className="stat-label">برند</div>
        <button
          className="button secondary"
          onClick={() => onNavigate('brands')}
        >
          مدیریت برندها
        </button>
      </div>

      <div className="card stat">
        <div className="stat-number">{media.length}</div>
        <div className="stat-label">فایل Media</div>
        <button
          className="button secondary"
          onClick={() => onNavigate('media')}
        >
          مدیریت Media
        </button>
      </div>
    </div>
  );
}

function ContentEditor({
  content,
  setContent,
  saving,
  onSave,
}: {
  content: Content;
  setContent: React.Dispatch<React.SetStateAction<Content>>;
  saving: boolean;
  onSave: () => void;
}) {
  const update = (key: keyof Content, value: string) =>
    setContent((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <div className="card section-card">
        <div className="section-head">
          <h2>Hero</h2>
          <button className="button" disabled={saving} onClick={onSave}>
            {saving ? 'در حال ذخیره...' : 'ذخیره همه'}
          </button>
        </div>

        <div className="grid grid-2">
          <Field
            label="عنوان فارسی"
            value={content.hero_title_fa}
            onChange={(v) => update('hero_title_fa', v)}
          />
          <Field
            label="عنوان انگلیسی"
            value={content.hero_title_en}
            onChange={(v) => update('hero_title_en', v)}
          />
          <Textarea
            label="توضیحات فارسی"
            value={content.hero_description_fa}
            onChange={(v) => update('hero_description_fa', v)}
          />
          <Textarea
            label="توضیحات انگلیسی"
            value={content.hero_description_en}
            onChange={(v) => update('hero_description_en', v)}
          />
          <Field
            label="متن دکمه فارسی"
            value={content.hero_button_fa}
            onChange={(v) => update('hero_button_fa', v)}
          />
          <Field
            label="متن دکمه انگلیسی"
            value={content.hero_button_en}
            onChange={(v) => update('hero_button_en', v)}
          />
        </div>
      </div>

      <div className="card section-card">
        <div className="section-head">
          <h2>درباره</h2>
        </div>

        <div className="grid grid-2">
          <Field
            label="عنوان فارسی"
            value={content.about_title_fa}
            onChange={(v) => update('about_title_fa', v)}
          />
          <Field
            label="عنوان انگلیسی"
            value={content.about_title_en}
            onChange={(v) => update('about_title_en', v)}
          />
          <Textarea
            label="متن فارسی"
            value={content.about_text_fa}
            onChange={(v) => update('about_text_fa', v)}
          />
          <Textarea
            label="متن انگلیسی"
            value={content.about_text_en}
            onChange={(v) => update('about_text_en', v)}
          />
        </div>
      </div>

      <div className="card section-card">
        <h2>تماس</h2>

        <div className="grid grid-2">
          <Field
            label="عنوان فارسی"
            value={content.contact_title_fa}
            onChange={(v) => update('contact_title_fa', v)}
          />
          <Field
            label="عنوان انگلیسی"
            value={content.contact_title_en}
            onChange={(v) => update('contact_title_en', v)}
          />
          <Field
            label="ایمیل"
            value={content.contact_email}
            onChange={(v) => update('contact_email', v)}
          />
          <Field
            label="تلفن"
            value={content.contact_phone}
            onChange={(v) => update('contact_phone', v)}
          />
          <Field
            label="Instagram"
            value={content.contact_instagram}
            onChange={(v) => update('contact_instagram', v)}
          />
        </div>
      </div>

      <div className="card section-card">
        <h2>SEO</h2>

        <div className="grid grid-2">
          <Field
            label="SEO Title فارسی"
            value={content.seo_title_fa}
            onChange={(v) => update('seo_title_fa', v)}
          />
          <Field
            label="SEO Title انگلیسی"
            value={content.seo_title_en}
            onChange={(v) => update('seo_title_en', v)}
          />
          <Textarea
            label="SEO Description فارسی"
            value={content.seo_description_fa}
            onChange={(v) => update('seo_description_fa', v)}
          />
          <Textarea
            label="SEO Description انگلیسی"
            value={content.seo_description_en}
            onChange={(v) => update('seo_description_en', v)}
          />
        </div>
      </div>
    </>
  );
}

function PortfolioManager({
  items,
  editing,
  setEditing,
  saving,
  onSave,
  onDelete,
  onUpload,
}: {
  items: PortfolioItem[];
  editing: PortfolioItem | null;
  setEditing: React.Dispatch<React.SetStateAction<PortfolioItem | null>>;
  saving: boolean;
  onSave: () => void;
  onDelete: (item: PortfolioItem) => void;
  onUpload: (file: File, field: 'cover_url' | 'media_url' | 'bts_media_url') => void;
}) {
  return (
    <>
      <div className="card section-card">
        <div className="section-head">
          <div>
            <h2>نمونه‌کارها</h2>
            <p>افزودن، ویرایش، حذف و آپلود واقعی فایل</p>
          </div>

          <button
            className="button"
            onClick={() => setEditing(null)}
            style={{ display: 'none' }}
          >
            جدید
          </button>

          <button
            className="button"
            onClick={() =>
              setEditing({
                id: 0,
                title_fa: '',
                title_en: '',
                description_fa: '',
                description_en: '',
                category: 'video',
                cover_url: null,
                media_url: null,
                media_type: 'image',
                featured: false,
                published: true,
                sort_order: items.length,
                media_sources: null,
                gallery_urls: [],
                brand_id: null,
                bts_media_url: null,
                bts_media_type: null,
                bts_gallery_urls: [],
              })
            }
          >
            + افزودن نمونه‌کار
          </button>
        </div>

        {editing && (
          <div className="card" style={{ background: '#f7f5f1' }}>
            <h3>{editing.id ? 'ویرایش نمونه‌کار' : 'نمونه‌کار جدید'}</h3>

            <div className="grid grid-2">
              <Field
                label="عنوان فارسی"
                value={editing.title_fa}
                onChange={(v) =>
                  setEditing((p) => (p ? { ...p, title_fa: v } : p))
                }
              />

              <Field
                label="عنوان انگلیسی"
                value={editing.title_en}
                onChange={(v) =>
                  setEditing((p) => (p ? { ...p, title_en: v } : p))
                }
              />

              <Textarea
                label="توضیحات فارسی"
                value={editing.description_fa}
                onChange={(v) =>
                  setEditing((p) => (p ? { ...p, description_fa: v } : p))
                }
              />

              <Textarea
                label="توضیحات انگلیسی"
                value={editing.description_en}
                onChange={(v) =>
                  setEditing((p) => (p ? { ...p, description_en: v } : p))
                }
              />

              <Textarea
                label="Quality sources (JSON) — optional"
                value={JSON.stringify(editing.media_sources || {}, null, 2)}
                onChange={(v) => {
                  try {
                    const parsed = v.trim() ? JSON.parse(v) : {};
                    setEditing((p) => (p ? { ...p, media_sources: parsed } : p));
                  } catch {
                    setEditing((p) => (p ? { ...p, media_sources: p.media_sources || {} } : p));
                  }
                }}
              />

              <Textarea
                label="Gallery image URLs — one per line"
                value={(editing.gallery_urls || []).join('\n')}
                onChange={(v) =>
                  setEditing((p) =>
                    p ? { ...p, gallery_urls: v.split('\n').map((item) => item.trim()).filter(Boolean) } : p
                  )
                }
              />

              <div className="field">
                <label>دسته‌بندی</label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, category: e.target.value } : p
                    )
                  }
                >
                  <option value="video">ساخت تیزر</option>
                  <option value="photo">عکس</option>
                  <option value="content">محتوا</option>
                  <option value="advertising">پروژه تبلیغاتی</option>
                </select>
              </div>

              <div className="field">
                <label>برند / Client</label>
                <select
                  value={editing.brand_id ? String(editing.brand_id) : ''}
                  onChange={(e) => setEditing((p) => p ? { ...p, brand_id: e.target.value ? Number(e.target.value) : null } : p)}
                >
                  <option value="">بدون برند</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>

              <Field
                label="ترتیب نمایش"
                type="number"
                value={String(editing.sort_order)}
                onChange={(v) =>
                  setEditing((p) =>
                    p ? { ...p, sort_order: Number(v) } : p
                  )
                }
              />
            </div>

            <div className="grid grid-2">
              <div className="upload-box">
                <strong>تصویر Cover</strong>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file, 'cover_url');
                  }}
                />
                {editing.cover_url && (
                  <img
                    src={editing.cover_url}
                    className="thumb"
                    style={{ margin: '12px auto 0' }}
                    alt=""
                  />
                )}
              </div>

              <div className="upload-box">
                <strong>فایل اصلی پروژه</strong>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file, 'media_url');
                  }}
                />
                {editing.media_url && (
                  <div style={{ marginTop: 12, fontSize: 12 }}>
                    فایل آپلود شد ✓
                  </div>
                )}
              </div>

              <div className="upload-box">
                <strong>Behind The Scenes — اختیاری</strong>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file, 'bts_media_url');
                  }}
                />
                {editing.bts_media_url ? <div style={{ marginTop: 12, fontSize: 12 }}>BTS ذخیره شد ✓</div> : null}
              </div>
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, featured: e.target.checked } : p
                    )
                  }
                />
                Featured
              </label>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, published: e.target.checked } : p
                    )
                  }
                />
                نمایش در سایت
              </label>
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <button className="button" disabled={saving} onClick={onSave}>
                ذخیره
              </button>
              <button
                className="button secondary"
                onClick={() => setEditing(null)}
              >
                لغو
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>عنوان</th>
                <th>دسته</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.cover_url ? (
                      <img className="thumb" src={item.cover_url} alt="" />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{item.title_fa}</td>
                  <td>{item.category}</td>
                  <td>{item.published ? 'فعال' : 'مخفی'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="button secondary"
                        onClick={() => setEditing(item)}
                      >
                        ویرایش
                      </button>
                      <button
                        className="button danger"
                        onClick={() => onDelete(item)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td colSpan={5}>هنوز نمونه‌کاری اضافه نشده.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function BrandsManager({
  items,
  editing,
  setEditing,
  saving,
  onSave,
  onDelete,
  onUpload,
}: {
  items: Brand[];
  editing: Brand | null;
  setEditing: React.Dispatch<React.SetStateAction<Brand | null>>;
  saving: boolean;
  onSave: () => void;
  onDelete: (item: Brand) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <>
      <div className="card section-card">
        <div className="section-head">
          <div>
            <h2>برندها</h2>
            <p>لوگوهای برندهایی که با NURANICO کار کرده‌اند</p>
          </div>

          <button
            className="button"
            onClick={() =>
              setEditing({
                id: 0,
                name: '',
                logo_url: null,
                website_url: null,
                published: true,
                sort_order: items.length,
              })
            }
          >
            + افزودن برند
          </button>
        </div>

        {editing && (
          <div className="card" style={{ background: '#f7f5f1' }}>
            <h3>{editing.id ? 'ویرایش برند' : 'برند جدید'}</h3>

            <div className="grid grid-2">
              <Field
                label="نام برند"
                value={editing.name}
                onChange={(v) =>
                  setEditing((p) => (p ? { ...p, name: v } : p))
                }
              />

              <Field
                label="Website"
                value={editing.website_url || ''}
                onChange={(v) =>
                  setEditing((p) =>
                    p ? { ...p, website_url: v } : p
                  )
                }
              />
            </div>

            <div className="upload-box">
              <strong>لوگوی برند</strong>
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
              />

              {editing.logo_url && (
                <img
                  src={editing.logo_url}
                  className="logo-preview"
                  alt=""
                  style={{ marginTop: 12 }}
                />
              )}
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, published: e.target.checked } : p
                    )
                  }
                />
                نمایش در سایت
              </label>
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <button className="button" disabled={saving} onClick={onSave}>
                ذخیره
              </button>
              <button
                className="button secondary"
                onClick={() => setEditing(null)}
              >
                لغو
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="grid grid-3">
          {items.map((item) => (
            <div className="card" key={item.id}>
              {item.logo_url ? (
                <img
                  src={item.logo_url}
                  alt={item.name}
                  className="logo-preview"
                />
              ) : (
                <div
                  className="logo-preview"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                  }}
                >
                  بدون لوگو
                </div>
              )}

              <h3 style={{ marginTop: 14 }}>{item.name}</h3>

              <div className="actions">
                <button
                  className="button secondary"
                  onClick={() => setEditing(item)}
                >
                  ویرایش
                </button>

                <button
                  className="button danger"
                  onClick={() => onDelete(item)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}

          {!items.length && <p>هنوز برندی اضافه نشده.</p>}
        </div>
      </div>
    </>
  );
}

function MediaManager({
  items,
  saving,
  onUpload,
  onDelete,
}: {
  items: Media[];
  saving: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onDelete: (item: Media) => void;
}) {
  return (
    <>
      <div className="card section-card">
        <div className="section-head">
          <div>
            <h2>Media Library</h2>
            <p>مرجع فایل‌های آپلودشده برای استفاده در سایت</p>
          </div>
        </div>

        <div className="upload-box">
          <strong>آپلود فایل</strong>
          <p>تصویر، ویدیو و فایل‌های رسانه‌ای</p>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            disabled={saving}
            onChange={onUpload}
          />
        </div>
      </div>

      <div className="card">
        <div className="grid grid-3">
          {items.map((item) => (
            <div className="card" key={item.id}>
              {item.file_type === 'video' ? (
                <video
                  src={item.file_url}
                  controls
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              ) : (
                <img
                  src={item.file_url}
                  alt={item.alt_text_fa || item.name}
                  style={{
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              )}

              <div style={{ marginTop: 12, fontSize: 13 }}>
                {item.name}
              </div>

              <div
                style={{
                  color: '#777',
                  fontSize: 11,
                  marginTop: 6,
                }}
              >
                {item.mime_type || 'media'}
              </div>

              <button
                className="button danger"
                style={{ marginTop: 12 }}
                onClick={() => onDelete(item)}
              >
                حذف فایل
              </button>
            </div>
          ))}

          {!items.length && <p>Media Library خالی است.</p>}
        </div>
      </div>
    </>
  );
}

function AppearanceEditor({
  appearance,
  setAppearance,
  fonts,
  setFonts,
  language,
  setLanguage,
  saving,
  onSave,
}: {
  appearance: Appearance;
  setAppearance: React.Dispatch<React.SetStateAction<Appearance>>;
  fonts: typeof defaultFonts;
  setFonts: React.Dispatch<React.SetStateAction<typeof defaultFonts>>;
  language: typeof defaultLanguage;
  setLanguage: React.Dispatch<React.SetStateAction<typeof defaultLanguage>>;
  saving: boolean;
  onSave: () => void;
}) {
  const updateColor = (key: keyof Appearance, value: string) =>
    setAppearance((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <div className="card section-card">
        <div className="section-head">
          <h2>رنگ‌های سایت</h2>
          <button className="button" disabled={saving} onClick={onSave}>
            ذخیره تغییرات
          </button>
        </div>

        <div className="grid grid-2">
          {(
            [
              ['bg_color', 'پس‌زمینه اصلی'],
              ['text_color', 'متن اصلی'],
              ['heading_color', 'تیترها'],
              ['button_color', 'دکمه'],
              ['button_text', 'متن دکمه'],
              ['button_hover', 'Hover دکمه'],
              ['surface_color', 'Surface'],
              ['card_bg', 'پس‌زمینه کارت'],
              ['card_text', 'متن کارت'],
              ['muted_color', 'متن کم‌رنگ'],
              ['link_color', 'لینک'],
              ['tag_color', 'Tag'],
              ['nav_bg', 'پس‌زمینه منو'],
              ['nav_text', 'متن منو'],
              ['nav_active', 'منوی فعال'],
              ['footer_bg', 'Footer'],
              ['footer_text', 'متن Footer'],
              ['border_color', 'Border'],
              ['logo_color', 'Logo'],
            ] as [keyof Appearance, string][]
          ).map(([key, label]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <div className="color-row">
                <input
                  value={appearance[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                />
                <input
                  type="color"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(appearance[key])
                      ? appearance[key]
                      : '#111111'
                  }
                  onChange={(e) => updateColor(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card section-card">
        <h2>فونت</h2>

        <div className="grid grid-2">
          <Field
            label="فونت فارسی"
            value={fonts.persian}
            onChange={(v) => setFonts((p) => ({ ...p, persian: v }))}
          />

          <Field
            label="فونت تیتر"
            value={fonts.heading}
            onChange={(v) => setFonts((p) => ({ ...p, heading: v }))}
          />

          <Field
            label="فونت انگلیسی"
            value={fonts.english}
            onChange={(v) => setFonts((p) => ({ ...p, english: v }))}
          />

          <div className="field">
            <label>Weight</label>
            <select
              value={fonts.weight}
              onChange={(e) =>
                setFonts((p) => ({ ...p, weight: e.target.value }))
              }
            >
              <option value="300">300 — Light</option>
              <option value="400">400 — Regular</option>
              <option value="500">500 — Medium</option>
              <option value="600">600 — Semi Bold</option>
              <option value="700">700 — Bold</option>
              <option value="800">800 — Extra Bold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card section-card">
        <h2>زبان سایت</h2>

        <div className="grid grid-2">
          <div className="field">
            <label>زبان پیش‌فرض</label>
            <select
              value={language.defaultLanguage}
              onChange={(e) =>
                setLanguage((p) => ({
                  ...p,
                  defaultLanguage: e.target.value,
                }))
              }
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
          </div>

          <label className="switch" style={{ marginTop: 28 }}>
            <input
              type="checkbox"
              checked={language.englishEnabled}
              onChange={(e) =>
                setLanguage((p) => ({
                  ...p,
                  englishEnabled: e.target.checked,
                }))
              }
            />
            فعال بودن نسخه انگلیسی
          </label>
        </div>
      </div>
    </>
  );
}

function SettingsManager({
  onUploadLogo,
}: {
  onUploadLogo: (file: File, type: 'logo' | 'favicon') => void;
}) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Logo</h2>
        <p>لوگوی اصلی سایت را آپلود کن.</p>

        <div className="upload-box">
          <input
            type="file"
            accept="image/*,.svg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLogo(file, 'logo');
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>Favicon</h2>
        <p>آیکون مرورگر سایت.</p>

        <div className="upload-box">
          <input
            type="file"
            accept="image/png,image/svg+xml,image/x-icon"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLogo(file, 'favicon');
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}