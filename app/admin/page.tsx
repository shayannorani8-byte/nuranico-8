'use client';

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

type Section =
  | 'dashboard'
  | 'projects'
  | 'media'
  | 'hero'
  | 'brands'
  | 'services'
  | 'content'
  | 'contact'
  | 'settings';

type Project = {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  image: string;
  description: string;
};

type MediaItem = {
  id: string;
  name: string;
  type: 'Image' | 'Video';
  url: string;
};

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  media: string;
  active: boolean;
};

type Brand = {
  id: string;
  name: string;
  logo: string;
};

type Service = {
  id: string;
  title: string;
  description: string;
  active: boolean;
};

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Luxury Campaign',
    category: 'Advertising',
    status: 'Published',
    image: '',
    description: 'Luxury advertising campaign.',
  },
  {
    id: '2',
    title: 'Fashion Film',
    category: 'Film',
    status: 'Published',
    image: '',
    description: 'Creative fashion film.',
  },
  {
    id: '3',
    title: 'Social Content',
    category: 'Content',
    status: 'Draft',
    image: '',
    description: 'Social media content project.',
  },
];

const initialMedia: MediaItem[] = [
  {
    id: '1',
    name: 'Hero Preview',
    type: 'Video',
    url: '',
  },
  {
    id: '2',
    name: 'Project Cover',
    type: 'Image',
    url: '',
  },
];

const initialHero: HeroSlide[] = [
  {
    id: '1',
    title: 'CREATE',
    subtitle: 'Visual stories with intention.',
    media: '',
    active: true,
  },
  {
    id: '2',
    title: 'CAPTURE',
    subtitle: 'Images that stay.',
    media: '',
    active: true,
  },
  {
    id: '3',
    title: 'DELIVER',
    subtitle: 'Creative work for ambitious brands.',
    media: '',
    active: true,
  },
];

const initialBrands: Brand[] = [
  { id: '1', name: 'Brand One', logo: '' },
  { id: '2', name: 'Brand Two', logo: '' },
  { id: '3', name: 'Brand Three', logo: '' },
];

const initialServices: Service[] = [
  {
    id: '1',
    title: 'Video Production',
    description: 'Creative video production and teaser creation.',
    active: true,
  },
  {
    id: '2',
    title: 'Photography',
    description: 'Commercial and creative photography.',
    active: true,
  },
  {
    id: '3',
    title: 'Content Production',
    description: 'Social media and branded content.',
    active: true,
  },
  {
    id: '4',
    title: 'Advertising',
    description: 'Visual campaigns for brands.',
    active: true,
  },
];

function Field({
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
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}


function ServicesSection({
  services,
  editingService,
  setEditingService,
  onAdd,
  onUpdate,
  onDelete,
}: {
  services: Service[];
  editingService: string | null;
  setEditingService: (id: string | null) => void;
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Service,
    value: string | boolean
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Services</div>
          <div className="panel-subtitle">
            Manage the services shown on the NURANICO website.
          </div>
        </div>

        <button
          className="button primary"
          type="button"
          onClick={onAdd}
        >
          + Add Service
        </button>
      </div>

      <div className="service-list">
        {services.map((service) => {
          const editing = editingService === service.id;

          return (
            <div className="service-card" key={service.id}>
              {editing ? (
                <div className="form-grid">
                  <Field
                    label="Title"
                    value={service.title}
                    onChange={(value) =>
                      onUpdate(service.id, "title", value)
                    }
                  />

                  <div className="field">
                    <label>Description</label>
                    <textarea
                      value={service.description}
                      onChange={(event) =>
                        onUpdate(
                          service.id,
                          "description",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Active</label>
                    <select
                      value={service.active ? "true" : "false"}
                      onChange={(event) =>
                        onUpdate(
                          service.id,
                          "active",
                          event.target.value === "true"
                        )
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => setEditingService(null)}
                    >
                      Done
                    </button>

                    <button
                      className="button"
                      type="button"
                      onClick={() => onDelete(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="panel-title">{service.title}</div>
                    <div className="panel-subtitle">
                      {service.description}
                    </div>
                  </div>

                  <div className="admin-actions">
                    <span className="status">
                      {service.active ? "Active" : "Hidden"}
                    </span>

                    <button
                      className="button"
                      type="button"
                      onClick={() => setEditingService(service.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="button"
                      type="button"
                      onClick={() => onDelete(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContentSection({
  siteTitle,
  setSiteTitle,
  siteDescription,
  setSiteDescription,
}: {
  siteTitle: string;
  setSiteTitle: (value: string) => void;
  siteDescription: string;
  setSiteDescription: (value: string) => void;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Website Content</div>
          <div className="panel-subtitle">
            Edit the main website title and description.
          </div>
        </div>
      </div>

      <div className="form-grid">
        <Field
          label="Site Title"
          value={siteTitle}
          onChange={setSiteTitle}
        />

        <div className="field">
          <label>Site Description</label>
          <textarea
            value={siteDescription}
            onChange={(event) =>
              setSiteDescription(event.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}

function ContactSection({
  email,
  setEmail,
  instagram,
  setInstagram,
}: {
  email: string;
  setEmail: (value: string) => void;
  instagram: string;
  setInstagram: (value: string) => void;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Contact</div>
          <div className="panel-subtitle">
            Manage the contact information displayed on the website.
          </div>
        </div>
      </div>

      <div className="form-grid">
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
        />

        <Field
          label="Instagram"
          value={instagram}
          onChange={setInstagram}
        />
      </div>
    </div>
  );
}

function SettingsSection() {
  const [englishFont, setEnglishFont] = useState('DM Sans');
  const [persianFont, setPersianFont] = useState('Vazirmatn');

  const [typography, setTypography] = useState({
    headingSize: 48,
    bodySize: 16,
    smallSize: 11,
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: 0,
  });

  const [colors, setColors] = useState({
    background: '#171716',
    surface: '#101010',
    primaryText: '#f1efe9',
    secondaryText: '#99958d',
    accent: '#e9e6df',
    border: '#292927',
  });

  const palettes = {
    'NURANICO Dark': {
      background: '#171716',
      surface: '#101010',
      primaryText: '#f1efe9',
      secondaryText: '#99958d',
      accent: '#e9e6df',
      border: '#292927',
    },
    'Pure Black': {
      background: '#080808',
      surface: '#111111',
      primaryText: '#ffffff',
      secondaryText: '#999999',
      accent: '#ffffff',
      border: '#292929',
    },
    'Warm Minimal': {
      background: '#211f1b',
      surface: '#151411',
      primaryText: '#f4eee3',
      secondaryText: '#aaa195',
      accent: '#d8c3a5',
      border: '#38332c',
    },
    'Soft Stone': {
      background: '#292826',
      surface: '#34322f',
      primaryText: '#f2eee7',
      secondaryText: '#b6b0a7',
      accent: '#e2ddd4',
      border: '#4a4742',
    },
  };

  function updateColor(
    key: keyof typeof colors,
    value: string
  ) {
    setColors((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyPalette(
    palette: typeof palettes[keyof typeof palettes]
  ) {
    setColors({ ...palette });
  }

  function saveSettings() {
    localStorage.setItem(
      'nuranico-settings',
      JSON.stringify({
        englishFont,
        persianFont,
        typography,
        colors,
      })
    );
    alert('Settings saved.');
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nuranico-settings');

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (parsed.englishFont) {
        setEnglishFont(parsed.englishFont);
      }

      if (parsed.persianFont) {
        setPersianFont(parsed.persianFont);
      }

      if (parsed.typography) {
        setTypography((current) => ({
          ...current,
          ...parsed.typography,
        }));
      }

      if (parsed.colors) {
        setColors((current) => ({
          ...current,
          ...parsed.colors,
        }));
      }
    } catch {
      // Ignore invalid local settings.
    }
  }, []);

  const colorFields: {
    key: keyof typeof colors;
    label: string;
    description: string;
  }[] = [
    {
      key: 'background',
      label: 'Background',
      description: 'Main website background.',
    },
    {
      key: 'surface',
      label: 'Surface',
      description: 'Cards, panels and secondary surfaces.',
    },
    {
      key: 'primaryText',
      label: 'Primary Text',
      description: 'Main headings and important text.',
    },
    {
      key: 'secondaryText',
      label: 'Secondary Text',
      description: 'Descriptions and muted text.',
    },
    {
      key: 'accent',
      label: 'Accent',
      description: 'Buttons, highlights and key actions.',
    },
    {
      key: 'border',
      label: 'Border',
      description: 'Lines, outlines and separators.',
    },
  ];

  return (
    <div>
      <div className="page-intro">
        <h2>Settings</h2>
        <p>
          Control NURANICO typography and visual colors from one place.
        </p>
      </div>

      <div className="settings-section-card">
        <div className="settings-section-head">
          <div>
            <div className="settings-section-title">
              Typography
            </div>
            <div className="settings-section-copy">
              Choose separate fonts for English and Persian content.
            </div>
          </div>
        </div>

        <div className="settings-fields">
          <label className="settings-field">
            <span>English Font</span>
            <select
              value={englishFont}
              onChange={(event) =>
                setEnglishFont(event.target.value)
              }
            >
              <option>DM Sans</option>
              <option>Space Grotesk</option>
              <option>Inter</option>
              <option>Montserrat</option>
              <option>Manrope</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Persian Font</span>
            <select
              value={persianFont}
              onChange={(event) =>
                setPersianFont(event.target.value)
              }
            >
              <option>Vazirmatn</option>
              <option>Yekan Bakh</option>
              <option>Tahoma</option>
              <option>Arial</option>
              <option>system-ui</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Heading Size</span>
            <div className="settings-range-row">
              <input
                type="range"
                min="24"
                max="96"
                step="1"
                value={typography.headingSize}
                onChange={(event) =>
                  setTypography((current) => ({
                    ...current,
                    headingSize: Number(event.target.value),
                  }))
                }
              />
              <strong>{typography.headingSize}px</strong>
            </div>
          </label>

          <label className="settings-field">
            <span>Body Size</span>
            <div className="settings-range-row">
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={typography.bodySize}
                onChange={(event) =>
                  setTypography((current) => ({
                    ...current,
                    bodySize: Number(event.target.value),
                  }))
                }
              />
              <strong>{typography.bodySize}px</strong>
            </div>
          </label>

          <label className="settings-field">
            <span>Small Text Size</span>
            <div className="settings-range-row">
              <input
                type="range"
                min="8"
                max="20"
                step="1"
                value={typography.smallSize}
                onChange={(event) =>
                  setTypography((current) => ({
                    ...current,
                    smallSize: Number(event.target.value),
                  }))
                }
              />
              <strong>{typography.smallSize}px</strong>
            </div>
          </label>

          <label className="settings-field">
            <span>Heading Weight</span>
            <select
              value={typography.headingWeight}
              onChange={(event) =>
                setTypography((current) => ({
                  ...current,
                  headingWeight: Number(event.target.value),
                }))
              }
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Body Weight</span>
            <select
              value={typography.bodyWeight}
              onChange={(event) =>
                setTypography((current) => ({
                  ...current,
                  bodyWeight: Number(event.target.value),
                }))
              }
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Letter Spacing</span>
            <div className="settings-range-row">
              <input
                type="range"
                min="-2"
                max="5"
                step="0.1"
                value={typography.letterSpacing}
                onChange={(event) =>
                  setTypography((current) => ({
                    ...current,
                    letterSpacing: Number(event.target.value),
                  }))
                }
              />
              <strong>{typography.letterSpacing}px</strong>
            </div>
          </label>
        </div>
      </div>

      <div className="settings-section-card">
        <div className="settings-section-head">
          <div>
            <div className="settings-section-title">
              Color Palette
            </div>
            <div className="settings-section-copy">
              Change the main visual system without editing the site code.
            </div>
          </div>
        </div>

        <div className="settings-palettes">
          {Object.entries(palettes).map(([name, palette]) => (
            <button
              key={name}
              type="button"
              className="palette-card"
              onClick={() => applyPalette(palette)}
            >
              <div className="palette-preview">
                <i style={{ background: palette.background }} />
                <i style={{ background: palette.surface }} />
                <i style={{ background: palette.accent }} />
                <i style={{ background: palette.primaryText }} />
              </div>
              <span>{name}</span>
            </button>
          ))}
        </div>

        <div className="settings-color-list">
          {colorFields.map((field) => (
            <div className="settings-color-row" key={field.key}>
              <div>
                <strong>{field.label}</strong>
                <span>{field.description}</span>
              </div>

              <div className="color-control">
                <input
                  type="color"
                  value={colors[field.key]}
                  onChange={(event) =>
                    updateColor(field.key, event.target.value)
                  }
                />
                <input
                  type="text"
                  value={colors[field.key]}
                  onChange={(event) =>
                    updateColor(field.key, event.target.value)
                  }
                  spellCheck={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section-card">
        <div className="settings-section-head">
          <div>
            <div className="settings-section-title">
              Live Preview
            </div>
            <div className="settings-section-copy">
              Preview the selected visual system before saving.
            </div>
          </div>
        </div>

        <div
          className="settings-preview"
          style={{
            background: colors.background,
            borderColor: colors.border,
            color: colors.primaryText,
          }}
        >
          <div
            className="settings-preview-small"
            style={{ color: colors.secondaryText }}
          >
            NURANICO / CREATIVE STUDIO
          </div>

          <div className="settings-preview-title">
            Visual stories.
            <br />
            Crafted with intent.
          </div>

          <div
            className="settings-preview-line"
            style={{ background: colors.border }}
          />

          <button
            type="button"
            style={{
              background: colors.accent,
              color: colors.background,
            }}
          >
            VIEW PROJECTS →
          </button>
        </div>
      </div>

      <div className="settings-save-row">
        <button
          type="button"
          className="settings-save-button"
          onClick={saveSettings}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHero);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [services, setServices] = useState<Service[]>(initialServices);

  const [projectSearch, setProjectSearch] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');

  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);

  const [siteTitle, setSiteTitle] = useState('NURANICO');
  const [siteDescription, setSiteDescription] = useState(
    'Creative studio for film, photography and visual content.'
  );
  const [contactEmail, setContactEmail] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    setUserEmail('Admin');
    setLoading(false);
  }, []);

  async function logout() {
    window.location.href = '/api/auth/signout?callbackUrl=/admin/login';
  }

  function addProject() {
    const id = Date.now().toString();

    setProjects((current) => [
      ...current,
      {
        id,
        title: 'New Project',
        category: 'Advertising',
        status: 'Draft',
        image: '',
        description: '',
      },
    ]);

    setEditingProject(id);
  }

  function updateProject(
    id: string,
    field: keyof Project,
    value: string
  ) {
    setProjects((current) =>
      current.map((project) =>
        project.id === id
          ? {
              ...project,
              [field]: value,
            }
          : project
      )
    );
  }

  function deleteProject(id: string) {
    setProjects((current) =>
      current.filter((project) => project.id !== id)
    );

    if (editingProject === id) {
      setEditingProject(null);
    }
  }

  function addMedia() {
    setMedia((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: 'New Media',
        type: 'Image',
        url: '',
      },
    ]);
  }

  function deleteMedia(id: string) {
    setMedia((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function updateMedia(
    id: string,
    field: keyof MediaItem,
    value: string
  ) {
    setMedia((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function updateHero(
    id: string,
    field: keyof HeroSlide,
    value: string | boolean
  ) {
    setHeroSlides((current) =>
      current.map((slide) =>
        slide.id === id
          ? {
              ...slide,
              [field]: value,
            }
          : slide
      )
    );
  }

  function addHeroSlide() {
    setHeroSlides((current) => [
      ...current,
      {
        id: Date.now().toString(),
        title: 'NEW SLIDE',
        subtitle: 'New hero slide.',
        media: '',
        active: true,
      },
    ]);
  }

  function deleteHeroSlide(id: string) {
    setHeroSlides((current) =>
      current.filter((slide) => slide.id !== id)
    );
  }

  function addBrand() {
    const id = Date.now().toString();

    setBrands((current) => [
      ...current,
      {
        id,
        name: 'New Brand',
        logo: '',
      },
    ]);

    setEditingBrand(id);
  }

  function updateBrand(
    id: string,
    field: keyof Brand,
    value: string
  ) {
    setBrands((current) =>
      current.map((brand) =>
        brand.id === id
          ? {
              ...brand,
              [field]: value,
            }
          : brand
      )
    );
  }

  function deleteBrand(id: string) {
    setBrands((current) =>
      current.filter((brand) => brand.id !== id)
    );

    if (editingBrand === id) {
      setEditingBrand(null);
    }
  }

  function addService() {
    const id = Date.now().toString();

    setServices((current) => [
      ...current,
      {
        id,
        title: 'New Service',
        description: 'Service description.',
        active: true,
      },
    ]);

    setEditingService(id);
  }

  function updateService(
    id: string,
    field: keyof Service,
    value: string | boolean
  ) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]: value,
            }
          : service
      )
    );
  }

  function deleteService(id: string) {
    setServices((current) =>
      current.filter((service) => service.id !== id)
    );

    if (editingService === id) {
      setEditingService(null);
    }
  }

  const filteredProjects = useMemo(() => {
    const query = projectSearch.toLowerCase().trim();

    if (!query) return projects;

    return projects.filter((project) =>
      `${project.title} ${project.category} ${project.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [projects, projectSearch]);

  const filteredMedia = useMemo(() => {
    const query = mediaSearch.toLowerCase().trim();

    if (!query) return media;

    return media.filter((item) =>
      `${item.name} ${item.type}`
        .toLowerCase()
        .includes(query)
    );
  }, [media, mediaSearch]);

  const publishedProjects = projects.filter(
    (project) => project.status === 'Published'
  ).length;

  const activeBrands = brands.length;

  const activeServices = services.filter(
    (service) => service.active
  ).length;

  if (loading) {
    return (
      <>
        <div className="loading-screen">
          <div className="loading-mark">N</div>
          <p>Loading admin...</p>
        </div>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #0b0b0b;
            color: #f5f5f5;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            background: #0b0b0b;
            color: #999;
          }

          .loading-mark {
            width: 56px;
            height: 56px;
            border: 1px solid #444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #fff;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="admin-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-symbol">N</div>

            <div>
              <div className="brand-name">NURANICO</div>
              <div className="brand-label">ADMIN PANEL</div>
            </div>
          </div>

          <nav className="navigation">
            <NavButton
              active={section === 'dashboard'}
              onClick={() => setSection('dashboard')}
              icon="⌂"
              label="Dashboard"
            />

            <NavButton
              active={section === 'projects'}
              onClick={() => setSection('projects')}
              icon="□"
              label="Projects"
            />

            <NavButton
              active={section === 'media'}
              onClick={() => setSection('media')}
              icon="▧"
              label="Media"
            />

            <NavButton
              active={section === 'hero'}
              onClick={() => setSection('hero')}
              icon="✦"
              label="Hero"
            />

            <NavButton
              active={section === 'brands'}
              onClick={() => setSection('brands')}
              icon="◇"
              label="Brands"
            />

            <NavButton
              active={section === 'services'}
              onClick={() => setSection('services')}
              icon="＋"
              label="Services"
            />

            <NavButton
              active={section === 'content'}
              onClick={() => setSection('content')}
              icon="≡"
              label="Content"
            />

            <NavButton
              active={section === 'contact'}
              onClick={() => setSection('contact')}
              icon="✉"
              label="Contact"
            />

            <NavButton
              active={section === 'settings'}
              onClick={() => setSection('settings')}
              icon="⚙"
              label="Settings"
            />
          </nav>

          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="user-avatar">
                {(userEmail[0] ?? 'A').toUpperCase()}
              </div>

              <div className="user-info">
                <strong>Administrator</strong>
                <span>{userEmail || 'Admin account'}</span>
              </div>
            </div>

            <button className="logout-button" onClick={logout}>
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <div className="eyebrow">NURANICO / ADMIN</div>
              <h1>{sectionTitle(section)}</h1>
            </div>

            <a
              className="view-site"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              View website ↗
            </a>
          </header>

          <div className="content">
            {section === 'dashboard' && (
              <Dashboard
                projects={projects}
                media={media}
                brands={brands}
                services={services}
                publishedProjects={publishedProjects}
                activeBrands={activeBrands}
                activeServices={activeServices}
                onSectionChange={setSection}
              />
            )}

            {section === 'projects' && (
              <ProjectsSection
                projects={filteredProjects}
                search={projectSearch}
                setSearch={setProjectSearch}
                editingProject={editingProject}
                setEditingProject={setEditingProject}
                onAdd={addProject}
                onUpdate={updateProject}
                onDelete={deleteProject}
              />
            )}

            {section === 'media' && (
              <MediaSection
                media={filteredMedia}
                search={mediaSearch}
                setSearch={setMediaSearch}
                onAdd={addMedia}
                onUpdate={updateMedia}
                onDelete={deleteMedia}
              />
            )}

            {section === 'hero' && (
              <HeroSection
                slides={heroSlides}
                onAdd={addHeroSlide}
                onUpdate={updateHero}
                onDelete={deleteHeroSlide}
              />
            )}

            {section === 'brands' && (
              <BrandsSection
                brands={brands}
                editingBrand={editingBrand}
                setEditingBrand={setEditingBrand}
                onAdd={addBrand}
                onUpdate={updateBrand}
                onDelete={deleteBrand}
              />
            )}

            {section === 'services' && (
              <ServicesSection
                services={services}
                editingService={editingService}
                setEditingService={setEditingService}
                onAdd={addService}
                onUpdate={updateService}
                onDelete={deleteService}
              />
            )}

            {section === 'content' && (
              <ContentSection
                siteTitle={siteTitle}
                setSiteTitle={setSiteTitle}
                siteDescription={siteDescription}
                setSiteDescription={setSiteDescription}
              />
            )}

            {section === 'contact' && (
              <ContactSection
                email={contactEmail}
                setEmail={setContactEmail}
                instagram={instagram}
                setInstagram={setInstagram}
              />
            )}

            {section === 'settings' && <SettingsSection />}
          </div>
        </main>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #090909;
          color: #f4f4f4;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
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
          background: #090909;
        }

        .sidebar {
          width: 250px;
          min-height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #222;
          background: #0d0d0d;
          z-index: 20;
        }

        .brand {
          min-height: 92px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 13px;
          border-bottom: 1px solid #222;
        }

        .brand-symbol {
          width: 42px;
          height: 42px;
          border: 1px solid #555;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          letter-spacing: 1px;
        }

        .brand-name {
          font-size: 14px;
          letter-spacing: 3px;
          font-weight: 600;
        }

        .brand-label {
          margin-top: 5px;
          color: #666;
          font-size: 8px;
          letter-spacing: 2px;
        }

        .navigation {
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .nav-button {
          width: 100%;
          border: 0;
          background: transparent;
          color: #777;
          padding: 12px 13px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .nav-button:hover {
          background: #151515;
          color: #ddd;
        }

        .nav-button.active {
          background: #1b1b1b;
          color: #fff;
        }

        .nav-icon {
          width: 20px;
          text-align: center;
          font-size: 15px;
          color: inherit;
        }

        .nav-label {
          font-size: 12px;
          letter-spacing: 0.2px;
        }

        .sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #222;
          padding: 16px 13px;
        }

        .user-card {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 9px;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border: 1px solid #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }

        .user-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-info strong {
          font-size: 11px;
          font-weight: 500;
        }

        .user-info span {
          color: #666;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 165px;
        }

        .logout-button {
          width: 100%;
          margin-top: 7px;
          padding: 10px;
          border: 1px solid #222;
          background: transparent;
          color: #777;
          border-radius: 6px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .logout-button:hover {
          color: #fff;
          border-color: #444;
        }

        .main {
          width: calc(100% - 250px);
          margin-left: 250px;
          min-height: 100vh;
        }

        .topbar {
          min-height: 92px;
          padding: 20px 34px;
          border-bottom: 1px solid #222;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(9, 9, 9, 0.94);
          backdrop-filter: blur(14px);
        }

        .eyebrow {
          color: #555;
          font-size: 8px;
          letter-spacing: 2.5px;
          margin-bottom: 8px;
        }

        .topbar h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        .view-site {
          color: #aaa;
          text-decoration: none;
          border: 1px solid #292929;
          padding: 10px 13px;
          border-radius: 5px;
          font-size: 10px;
          transition:
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .view-site:hover {
          color: #fff;
          border-color: #555;
        }

        .content {
          padding: 34px;
          max-width: 1500px;
        }

        .page-intro {
          margin-bottom: 25px;
        }

        .page-intro h2 {
          margin: 0 0 7px;
          font-size: 20px;
          font-weight: 400;
        }

        .page-intro p {
          margin: 0;
          color: #666;
          font-size: 11px;
          line-height: 1.7;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }

        .stat-card {
          min-height: 135px;
          padding: 20px;
          border: 1px solid #202020;
          background: #0d0d0d;
          border-radius: 8px;
        }

        .stat-label {
          color: #666;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .stat-value {
          margin-top: 24px;
          font-size: 31px;
          font-weight: 300;
        }

        .stat-note {
          margin-top: 6px;
          color: #555;
          font-size: 9px;
        }

        .panel {
          border: 1px solid #202020;
          background: #0d0d0d;
          border-radius: 8px;
          overflow: hidden;
        }

        .panel + .panel {
          margin-top: 15px;
        }

        .panel-header {
          min-height: 62px;
          padding: 15px 18px;
          border-bottom: 1px solid #202020;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .panel-title {
          font-size: 12px;
          font-weight: 500;
        }

        .panel-subtitle {
          margin-top: 4px;
          color: #555;
          font-size: 9px;
        }

        .panel-body {
          padding: 18px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search {
          width: 250px;
          height: 36px;
          border: 1px solid #262626;
          border-radius: 5px;
          outline: none;
          background: #111;
          color: #fff;
          padding: 0 12px;
          font-size: 10px;
        }

        .search:focus {
          border-color: #444;
        }

        .button {
          min-height: 36px;
          border: 1px solid #303030;
          border-radius: 5px;
          padding: 0 13px;
          background: #151515;
          color: #ddd;
          font-size: 10px;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .button:hover {
          background: #1d1d1d;
          border-color: #4a4a4a;
          color: #fff;
        }

        .button.primary {
          background: #eee;
          color: #0a0a0a;
          border-color: #eee;
        }

        .button.primary:hover {
          background: #fff;
        }

        .button.danger {
          color: #b5b5b5;
        }

        .button.danger:hover {
          border-color: #633;
          color: #fff;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          text-align: left;
          color: #555;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 11px 10px;
          border-bottom: 1px solid #202020;
        }

        .table td {
          padding: 13px 10px;
          border-bottom: 1px solid #181818;
          font-size: 10px;
          color: #aaa;
          vertical-align: middle;
        }

        .table tr:last-child td {
          border-bottom: 0;
        }

        .table-title {
          color: #eee;
          font-size: 11px;
        }

        .muted {
          color: #555;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          border: 1px solid #2c2c2c;
          color: #888;
          font-size: 8px;
          letter-spacing: 0.6px;
        }

        .badge.active {
          color: #ddd;
          border-color: #454545;
        }

        .badge.draft {
          color: #666;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .icon-button {
          width: 29px;
          height: 29px;
          border: 1px solid #292929;
          border-radius: 5px;
          background: #111;
          color: #777;
          font-size: 10px;
        }

        .icon-button:hover {
          color: #fff;
          border-color: #444;
        }

        .editor {
          margin-top: 15px;
          padding: 18px;
          border: 1px solid #292929;
          background: #101010;
          border-radius: 7px;
        }

        .editor-title {
          margin-bottom: 16px;
          font-size: 11px;
          color: #ddd;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .form-grid.single {
          grid-template-columns: 1fr;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #666;
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #282828;
          background: #0b0b0b;
          color: #eee;
          border-radius: 5px;
          outline: none;
          padding: 10px 11px;
          font-size: 10px;
        }

        .field textarea {
          min-height: 95px;
          resize: vertical;
          line-height: 1.6;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #4a4a4a;
        }

        .editor-actions {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
          margin-top: 15px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .hero-card {
          border: 1px solid #222;
          background: #101010;
          border-radius: 7px;
          overflow: hidden;
        }

        .hero-preview {
          height: 180px;
          border-bottom: 1px solid #222;
          background:
            radial-gradient(circle at center, #252525 0, #101010 55%, #080808 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hero-preview span {
          color: #444;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .hero-active {
          position: absolute;
          right: 10px;
          top: 10px;
        }

        .hero-info {
          padding: 15px;
        }

        .hero-info h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 400;
        }

        .hero-info p {
          min-height: 34px;
          color: #666;
          font-size: 9px;
          line-height: 1.5;
        }

        .brand-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .brand-card {
          min-height: 180px;
          border: 1px solid #222;
          background: #101010;
          border-radius: 7px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .brand-logo {
          flex: 1;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #444;
          border-bottom: 1px solid #202020;
          letter-spacing: 2px;
          font-size: 11px;
        }

        .brand-details {
          padding: 12px;
        }

        .brand-details strong {
          font-size: 10px;
          font-weight: 400;
        }

        .brand-actions {
          margin-top: 9px;
          display: flex;
          gap: 5px;
        }

        .service-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .service-card {
          border: 1px solid #222;
          background: #101010;
          border-radius: 7px;
          padding: 17px;
        }

        .service-card h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 400;
        }

        .service-card p {
          color: #666;
          font-size: 10px;
          line-height: 1.7;
          min-height: 36px;
        }

        .service-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #202020;
        }

        .switch {
          width: 34px;
          height: 20px;
          padding: 2px;
          border: 1px solid #333;
          border-radius: 99px;
          background: #151515;
        }

        .switch-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #555;
          transition: transform 0.2s ease;
        }

        .switch.on {
          background: #252525;
        }

        .switch.on .switch-dot {
          transform: translateX(13px);
          background: #eee;
        }

        .content-editor {
          max-width: 900px;
        }

        .save-bar {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
        }

        .notice {
          border: 1px solid #242424;
          background: #101010;
          border-radius: 6px;
          padding: 13px 15px;
          color: #777;
          font-size: 9px;
          line-height: 1.7;
          margin-bottom: 15px;
        }

        .settings-section-card {
          margin-bottom: 14px;
          border: 1px solid #222;
          background: #0f0f0f;
          border-radius: 7px;
          overflow: hidden;
        }

        .settings-section-head {
          padding: 20px 18px;
          border-bottom: 1px solid #202020;
        }

        .settings-section-title {
          font-size: 12px;
          font-weight: 500;
          color: #eee;
          margin-bottom: 5px;
        }

        .settings-section-copy {
          color: #555;
          font-size: 9px;
          line-height: 1.6;
        }

        .settings-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 18px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-field > span {
          color: #aaa;
          font-size: 9px;
        }

        .settings-field select {
          width: 100%;
          height: 43px;
          padding: 0 12px;
          border: 1px solid #292929;
          border-radius: 5px;
          background: #151515;
          color: #eee;
          outline: none;
          cursor: pointer;
        }

        .settings-field select:focus {
          border-color: #555;
        }

        .settings-palettes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 18px;
          border-bottom: 1px solid #202020;
        }

        .palette-card {
          appearance: none;
          border: 1px solid #292929;
          border-radius: 6px;
          background: #141414;
          padding: 9px;
          text-align: left;
          color: #aaa;
          cursor: pointer;
          transition:
            border-color .2s ease,
            transform .2s ease;
        }

        .palette-card:hover {
          border-color: #555;
          transform: translateY(-1px);
        }

        .palette-preview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: 34px;
          margin-bottom: 9px;
          border-radius: 4px;
          overflow: hidden;
        }

        .palette-preview i {
          display: block;
        }

        .palette-card > span {
          font-size: 8px;
        }

        .settings-color-list {
          display: flex;
          flex-direction: column;
        }

        .settings-color-row {
          min-height: 67px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #202020;
        }

        .settings-color-row:last-child {
          border-bottom: 0;
        }

        .settings-color-row > div:first-child {
          min-width: 0;
        }

        .settings-color-row strong {
          display: block;
          color: #ddd;
          font-size: 10px;
          font-weight: 400;
          margin-bottom: 4px;
        }

        .settings-color-row span {
          display: block;
          color: #555;
          font-size: 8px;
        }

        .color-control {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }

        .color-control input[type="color"] {
          width: 38px;
          height: 38px;
          padding: 2px;
          border: 1px solid #292929;
          border-radius: 5px;
          background: #151515;
          cursor: pointer;
        }

        .color-control input[type="text"] {
          width: 82px;
          height: 38px;
          padding: 0 9px;
          border: 1px solid #292929;
          border-radius: 5px;
          background: #151515;
          color: #ddd;
          font-size: 9px;
          text-transform: uppercase;
          outline: none;
        }

        .color-control input[type="text"]:focus {
          border-color: #555;
        }

        .settings-preview {
          margin: 18px;
          min-height: 230px;
          padding: 30px;
          border: 1px solid;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition:
            background .2s ease,
            color .2s ease,
            border-color .2s ease;
        }

        .settings-preview-small {
          font-size: 8px;
          letter-spacing: .14em;
          margin-bottom: 18px;
        }

        .settings-preview-title {
          font-family: Georgia, serif;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -.04em;
        }

        .settings-preview-line {
          width: 100%;
          height: 1px;
          margin: 25px 0;
        }

        .settings-preview button {
          align-self: flex-start;
          border: 0;
          border-radius: 999px;
          padding: 11px 15px;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .08em;
          cursor: pointer;
        }

        .settings-save-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .settings-save-button {
          border: 1px solid #333;
          border-radius: 999px;
          background: #eee;
          color: #111;
          padding: 12px 18px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity .2s ease;
        }

        .settings-range-row {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
        }

        .settings-range-row input[type="range"] {
          flex: 1;
          width: 100%;
          accent-color: #e9e6df;
          cursor: pointer;
        }

        .settings-range-row strong {
          min-width: 58px;
          text-align: right;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .04em;
          color: #99958d;
        }

        .settings-field select {
          min-height: 42px;
        }

        .settings-save-button:hover {
          opacity: .82;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
        }

        .setting-row {
          min-height: 72px;
          padding: 15px 18px;
          border-bottom: 1px solid #202020;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .setting-row:last-child {
          border-bottom: 0;
        }

        .setting-copy strong {
          display: block;
          font-size: 11px;
          font-weight: 400;
          margin-bottom: 5px;
        }

        .setting-copy span {
          color: #555;
          font-size: 9px;
        }

        .empty {
          padding: 50px 20px;
          text-align: center;
          color: #555;
          font-size: 10px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .quick-card {
          min-height: 110px;
          border: 1px solid #222;
          background: #101010;
          border-radius: 7px;
          padding: 17px;
          text-align: left;
          color: #aaa;
        }

        .quick-card:hover {
          border-color: #444;
          color: #fff;
        }

        .quick-card-icon {
          font-size: 18px;
          margin-bottom: 17px;
        }

        .quick-card-title {
          font-size: 10px;
          margin-bottom: 4px;
        }

        .quick-card-copy {
          color: #555;
          font-size: 8px;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .brand-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 800px) {
          .sidebar {
            width: 72px;
          }

          .brand {
            justify-content: center;
            padding: 15px;
          }

          .brand > div:last-child,
          .nav-label,
          .user-info,
          .logout-button span:last-child {
            display: none;
          }

          .navigation {
            padding: 12px 8px;
          }

          .nav-button {
            justify-content: center;
            padding: 12px 8px;
          }

          .sidebar-bottom {
            padding: 10px 8px;
          }

          .user-card {
            justify-content: center;
          }

          .logout-button {
            font-size: 14px;
          }

          .main {
            width: calc(100% - 72px);
            margin-left: 72px;
          }

          .content {
            padding: 20px;
          }

          .topbar {
            padding: 17px 20px;
          }

          .form-grid,
          .service-list,
          .quick-grid {
            grid-template-columns: 1fr;
          }

          .hero-grid,
          .brand-grid {
            grid-template-columns: 1fr 1fr;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .toolbar-left,
          .toolbar-right {
            width: 100%;
          }

          .search {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .stats-grid,
          .hero-grid,
          .brand-grid {
            grid-template-columns: 1fr;
          }

          .content {
            padding: 15px;
          }

          .topbar h1 {
            font-size: 20px;
          }

          .view-site {
            display: none;
          }

          .table {
            min-width: 650px;
          }

          .panel-body {
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  );
}

function sectionTitle(section: Section) {
  const titles: Record<Section, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    media: 'Media Library',
    hero: 'Hero Slides',
    brands: 'Brands',
    services: 'Services',
    content: 'Site Content',
    contact: 'Contact',
    settings: 'Settings',
  };

  return titles[section];
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      className={`nav-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

function Dashboard({
  projects,
  media,
  brands,
  services,
  publishedProjects,
  activeBrands,
  activeServices,
  onSectionChange,
}: {
  projects: Project[];
  media: MediaItem[];
  brands: Brand[];
  services: Service[];
  publishedProjects: number;
  activeBrands: number;
  activeServices: number;
  onSectionChange: Dispatch<SetStateAction<Section>>;
}) {
  return (
    <div>
      <div className="page-intro">
        <h2>Welcome to NURANICO.</h2>
        <p>
          Manage your creative studio website from one place.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Projects</div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-note">
            {publishedProjects} published
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Media</div>
          <div className="stat-value">{media.length}</div>
          <div className="stat-note">Images & videos</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Brands</div>
          <div className="stat-value">{activeBrands}</div>
          <div className="stat-note">Client showcase</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Services</div>
          <div className="stat-value">{activeServices}</div>
          <div className="stat-note">
            {services.length} configured
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Quick actions</div>
            <div className="panel-subtitle">
              Jump directly to a section.
            </div>
          </div>
        </div>

        <div className="panel-body">
          <div className="quick-grid">
            <button
              className="quick-card"
              onClick={() => onSectionChange('projects')}
            >
              <div className="quick-card-icon">□</div>
              <div className="quick-card-title">
                Manage Projects
              </div>
              <div className="quick-card-copy">
                Add and edit portfolio work.
              </div>
            </button>

            <button
              className="quick-card"
              onClick={() => onSectionChange('media')}
            >
              <div className="quick-card-icon">▧</div>
              <div className="quick-card-title">
                Media Library
              </div>
              <div className="quick-card-copy">
                Manage images and videos.
              </div>
            </button>

            <button
              className="quick-card"
              onClick={() => onSectionChange('hero')}
            >
              <div className="quick-card-icon">✦</div>
              <div className="quick-card-title">
                Hero Slides
              </div>
              <div className="quick-card-copy">
                Control the homepage hero.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({
  projects,
  search,
  setSearch,
  editingProject,
  setEditingProject,
  onAdd,
  onUpdate,
  onDelete,
}: {
  projects: Project[];
  search: string;
  setSearch: (value: string) => void;
  editingProject: string | null;
  setEditingProject: (id: string | null) => void;
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Project,
    value: string
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Portfolio Projects</div>
            <div className="panel-subtitle">
              Manage work displayed on the website.
            </div>
          </div>

          <button className="button primary" onClick={onAdd}>
            + New project
          </button>
        </div>

        <div className="panel-body">
          <div className="toolbar">
            <div className="toolbar-left">
              <input
                className="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search projects..."
              />
            </div>

            <div className="toolbar-right">
              <span className="badge">
                {projects.length} items
              </span>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="empty">No projects found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Media</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="table-title">
                        {project.title}
                      </div>
                    </td>

                    <td>{project.category}</td>

                    <td>
                      <span
                        className={`badge ${
                          project.status === 'Published'
                            ? 'active'
                            : 'draft'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>

                    <td>
                      {project.image ? 'Added' : 'Not added'}
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="icon-button"
                          onClick={() =>
                            setEditingProject(project.id)
                          }
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button"
                          onClick={() =>
                            onDelete(project.id)
                          }
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {editingProject && (
            <div className="editor">
              {projects
                .filter(
                  (project) => project.id === editingProject
                )
                .map((project) => (
                  <div key={project.id}>
                    <div className="editor-title">
                      Edit project
                    </div>

                    <div className="form-grid">
                      <Field
                        label="Title"
                        value={project.title}
                        onChange={(value) =>
                          onUpdate(
                            project.id,
                            'title',
                            value
                          )
                        }
                      />

                      <Field
                        label="Category"
                        value={project.category}
                        onChange={(value) =>
                          onUpdate(
                            project.id,
                            'category',
                            value
                          )
                        }
                      />

                      <div className="field">
                        <label>Status</label>

                        <select
                          value={project.status}
                          onChange={(event) =>
                            onUpdate(
                              project.id,
                              'status',
                              event.target.value
                            )
                          }
                        >
                          <option value="Published">
                            Published
                          </option>
                          <option value="Draft">
                            Draft
                          </option>
                        </select>
                      </div>

                      <Field
                        label="Image URL"
                        value={project.image}
                        onChange={(value) =>
                          onUpdate(
                            project.id,
                            'image',
                            value
                          )
                        }
                      />

                      <div className="field">
                        <label>Description</label>

                        <textarea
                          value={project.description}
                          onChange={(event) =>
                            onUpdate(
                              project.id,
                              'description',
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="editor-actions">
                      <button
                        className="button"
                        onClick={() =>
                          setEditingProject(null)
                        }
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaSection({
  media,
  search,
  setSearch,
  onAdd,
  onUpdate,
  onDelete,
}: {
  media: MediaItem[];
  search: string;
  setSearch: (value: string) => void;
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof MediaItem,
    value: string
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="notice">
        Media upload will be connected to ServerNet Object
        Storage after the admin UI is confirmed.
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Media Library</div>
            <div className="panel-subtitle">
              Images and videos used by NURANICO.
            </div>
          </div>

          <button className="button primary" onClick={onAdd}>
            + Add media
          </button>
        </div>

        <div className="panel-body">
          <div className="toolbar">
            <input
              className="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search media..."
            />
          </div>

          {media.length === 0 ? (
            <div className="empty">No media found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>URL</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {media.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-title">
                        {item.name}
                      </div>
                    </td>

                    <td>
                      <span className="badge">
                        {item.type}
                      </span>
                    </td>

                    <td>
                      {item.url ? (
                        <span className="muted">
                          URL added
                        </span>
                      ) : (
                        <span className="muted">
                          Not added
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="icon-button"
                          onClick={() =>
                            onUpdate(
                              item.id,
                              'name',
                              `${item.name}*`
                            )
                          }
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button"
                          onClick={() =>
                            onDelete(item.id)
                          }
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection({
  slides,
  onAdd,
  onUpdate,
  onDelete,
}: {
  slides: HeroSlide[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof HeroSlide,
    value: string | boolean
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="notice">
        Each hero slide can later use an image or video stored in
        ServerNet Object Storage.
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Homepage Hero</div>
            <div className="panel-subtitle">
              Control the main visual presentation.
            </div>
          </div>

          <button className="button primary" onClick={onAdd}>
            + Add slide
          </button>
        </div>

        <div className="panel-body">
          <div className="hero-grid">
            {slides.map((slide) => (
              <div className="hero-card" key={slide.id}>
                <div className="hero-preview">
                  <span>
                    {slide.media ? 'MEDIA' : 'NO MEDIA'}
                  </span>

                  <div className="hero-active">
                    <button
                      className={`switch ${
                        slide.active ? 'on' : ''
                      }`}
                      onClick={() =>
                        onUpdate(
                          slide.id,
                          'active',
                          !slide.active
                        )
                      }
                      aria-label="Toggle slide"
                    >
                      <div className="switch-dot" />
                    </button>
                  </div>
                </div>

                <div className="hero-info">
                  <h3>{slide.title}</h3>
                  <p>{slide.subtitle}</p>

                  <div className="field">
                    <label>Media URL</label>

                    <input
                      value={slide.media}
                      onChange={(event) =>
                        onUpdate(
                          slide.id,
                          'media',
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="editor-actions">
                    <button
                      className="button danger"
                      onClick={() => onDelete(slide.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandsSection({
  brands,
  editingBrand,
  setEditingBrand,
  onAdd,
  onUpdate,
  onDelete,
}: {
  brands: Brand[];
  editingBrand: string | null;
  setEditingBrand: (id: string | null) => void;
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Brand,
    value: string
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Client Brands</div>
            <div className="panel-subtitle">
              Logos of brands NURANICO has worked with.
            </div>
          </div>

          <button
            className="button primary"
            onClick={onAdd}
            type="button"
          >
            + Add Brand
          </button>
        </div>

        <div className="brand-grid">
          {brands.map((brand) => {
            const isEditing = editingBrand === brand.id;

            return (
              <div className="brand-card" key={brand.id}>
                {isEditing ? (
                  <div className="form-grid">
                    <label>
                      <span>Name</span>
                      <input
                        value={brand.name || ""}
                        onChange={(e) =>
                          onUpdate(brand.id, "name", e.target.value)
                        }
                      />
                    </label>

                    <label>
                      <span>Logo URL</span>
                      <input
                        value={brand.logo || ""}
                        onChange={(e) =>
                          onUpdate(brand.id, "logo", e.target.value)
                        }
                      />
                    </label>

                    <div className="admin-actions">
                      <button
                        className="button primary"
                        type="button"
                        onClick={() => setEditingBrand(null)}
                      >
                        Done
                      </button>

                      <button
                        className="button"
                        type="button"
                        onClick={() => onDelete(brand.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="brand-preview">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name || "Brand"}
                        />
                      ) : (
                        <div className="brand-placeholder">
                          {brand.name || "Brand"}
                        </div>
                      )}
                    </div>

                    <div className="brand-info">
                      <strong>{brand.name || "Unnamed Brand"}</strong>

                      <div className="admin-actions">
                        <button
                          className="button"
                          type="button"
                          onClick={() => setEditingBrand(brand.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="button"
                          type="button"
                          onClick={() => onDelete(brand.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!brands.length && (
          <div className="empty-state">
            No client brands added yet.
          </div>
        )}
      </div>
    </div>
  );
}
