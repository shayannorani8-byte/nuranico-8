'use client';

import { useMemo, useState } from 'react';
import { useAdminLocale } from './AdminLocale';
import { isVideoAsset } from '../../lib/media';

export type MediaAsset = {
  id: number; name: string; file_url: string; file_path: string | null;
  file_type: string | null; mime_type: string | null; file_size: number | null;
  alt_text_fa: string | null; alt_text_en: string | null; created_at: string | null;
  brand_name?: string | null; project_name?: string | null;
  destinations?: string[]; show_on_home?: boolean; published?: boolean;
};

export function MediaThumbnail({ item }: { item: MediaAsset }) {
  const {t} = useAdminLocale();
  return isVideoAsset(item)
    ? <div className="asset-image"><video src={item.file_url} preload="metadata" muted playsInline /><span className="asset-kind">{t("VIDEO")}</span></div>
    : <div className="asset-image"><img src={item.file_url} alt="" loading="lazy" /></div>;
}

export default function MediaPicker({ title, media, ids, onChange, kind = 'all', multiple = false, upload, hideSelection = false }: {
  title: string; media: MediaAsset[]; ids: number[]; onChange: (ids: number[]) => void;
  kind?: 'all' | 'image' | 'video'; multiple?: boolean; upload?: React.ReactNode; hideSelection?:boolean;
}) {
  const {t} = useAdminLocale();
  const [query, setQuery] = useState('');
  const [type, setType] = useState(kind);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selectionLimit,setSelectionLimit]=useState(8);
  const selected = ids.map(id => media.find(item => item.id === id)).filter((item): item is MediaAsset => !!item);
  const matches = useMemo(() => media.filter(item => {
    const video = isVideoAsset(item);
    return (kind === 'all' || (kind === 'video' ? video : !video)) &&
      (type === 'all' || (type === 'video' ? video : !video)) &&
      (!selectedOnly || ids.includes(item.id)) &&
      [item.name, item.brand_name, item.project_name, item.alt_text_en, item.alt_text_fa].join(' ').toLowerCase().includes(query.trim().toLowerCase());
  }), [media, ids, kind, type, selectedOnly, query]);
  const pages = Math.max(1, Math.ceil(matches.length / 24));
  const currentPage = Math.min(page, pages - 1);
  function move(index: number, direction: number) {
    const next = [...ids];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  return <section className="asset-role">
    <div className="asset-role-head"><h3>{t(title)}</h3><span>{ids.length} {t("selected")}</span></div>
    {!hideSelection && !!selected.length && <div className="asset-selection">{selected.slice(0,selectionLimit).map((item, index) => <article key={item.id} className="asset-selected">
      <MediaThumbnail item={item} /><div><b dir="auto">{item.name}</b><small dir="auto">{[item.brand_name, item.project_name].filter(Boolean).join(' · ')}</small>
      <div className="asset-order">{multiple && <><button type="button" disabled={!index} aria-label={`${t('Move earlier')}: ${item.name}`} onClick={() => move(index, -1)}>↑</button><button type="button" disabled={index === ids.length - 1} aria-label={`${t('Move later')}: ${item.name}`} onClick={() => move(index, 1)}>↓</button></>}<button type="button" aria-label={`${t('Remove')}: ${item.name}`} onClick={() => onChange(ids.filter(id => id !== item.id))}>{t("Remove")}</button></div></div>
    </article>)}</div>}
    {!hideSelection && selected.length>selectionLimit && <button type="button" className="ghost" onClick={()=>setSelectionLimit(value=>value+8)}>{t('Show more selected files')}</button>}
    <details className="asset-browser"><summary>{selected.length ? t("Change / add media") : t("Choose media")}</summary>
      <div className="asset-browser-body">
        <div className="asset-tools"><input aria-label={`${t('Search')} ${t(title)}`} placeholder={t("File, brand or project…")} value={query} onChange={e => {setQuery(e.target.value);setPage(0);}} />
        {kind === 'all' && <select aria-label={`${t('Type')} ${t(title)}`} value={type} onChange={e => {setType(e.target.value as typeof type);setPage(0);}}><option value="all">{t("Photos & videos")}</option><option value="image">{t("Photos")}</option><option value="video">{t("Videos")}</option></select>}
        <label><input type="checkbox" checked={selectedOnly} onChange={e => {setSelectedOnly(e.target.checked);setPage(0);}} /> {t("Selected only")}</label>{upload}</div>
        <p className="hint">{matches.length} {t("files ·")}{multiple ? t("Select files in the order you want, then adjust with the arrows.") : t("Choose one file.")}</p>
        <div className="asset-grid">{matches.slice(currentPage * 24, (currentPage + 1) * 24).map(item => <button type="button" key={item.id} aria-pressed={ids.includes(item.id)} className={`asset-tile${ids.includes(item.id) ? ' selected' : ''}`} onClick={() => onChange(multiple ? (ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]) : [item.id])}>
          <MediaThumbnail item={item} /><span className="asset-name" dir="auto">{item.name}</span><small dir="auto">{[item.brand_name, item.project_name].filter(Boolean).join(' · ') || (isVideoAsset(item) ? t("Video") : t("Photo"))}</small><span className="asset-check">{ids.includes(item.id) ? t("✓ Selected") : t("Select")}</span>
        </button>)}</div>
        {!matches.length && <p className="empty">{t("No matching files. Try another search or upload media.")}</p>}
        <div className="asset-pagination"><button type="button" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>{t("Previous")}</button><span>{currentPage + 1} / {pages}</span><button type="button" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>{t("Next")}</button></div>
      </div>
    </details>
  </section>;
}
