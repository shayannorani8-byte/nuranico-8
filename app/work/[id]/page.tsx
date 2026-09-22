'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import SiteHeader from '../../components/SiteHeader';

type AttachedMedia = {
  id: number;
  file_url: string;
  file_type?: string | null;
  mime_type?: string | null;
  name?: string | null;
};

type Project = {
  id: number;
  title_fa: string;
  title_en?: string;
  description_fa?: string;
  description_en?: string;
  category: string;
  cover_url?: string;
  media_url?: string;
  media_type?: string;
  featured?: boolean;
  media_sources?: Record<string, string> | null;
  gallery_urls?: string[] | null;
  brand_id?: number | null;
  bts_media_url?: string | null;
  bts_media_type?: string | null;
  bts_gallery_urls?: string[] | null;
};



function isVideo(project: Project) {
  const type = (project.media_type || '').toLowerCase();
  const url = `${project.media_url || ''} ${project.cover_url || ''}`.toLowerCase();
  return type.includes('video') || /\.(mp4|webm|mov|m4v)(\?|$)/.test(url);
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return '00:00';
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function VideoPlayer({
  src,
  sources,
  poster,
}: {
  src: string;
  sources?: Record<string, string> | null;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [quality, setQuality] = useState('Auto');
  const [activeSrc, setActiveSrc] = useState(src);
  const [speed, setSpeed] = useState(1);
  const [menu, setMenu] = useState(false);

  const available = useMemo(() => {
    const entries = sources ? Object.entries(sources).filter(([, url]) => !!url) : [];
    return entries.length ? entries : [['Auto', src] as [string, string]];
  }, [sources, src]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => undefined);
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function seek(delta: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0);
  }

  function selectQuality(label: string, url: string) {
    const video = videoRef.current;
    if (!video) return;
    const wasPlaying = !video.paused;
    const time = video.currentTime;
    setQuality(label);
    setActiveSrc(url);
    video.src = url;
    video.load();
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(time, video.duration || time);
      if (wasPlaying) void video.play().catch(() => undefined);
    }, { once: true });
    setMenu(false);
  }

  function changeSpeed(next: number) {
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  return (
    <div className="player">
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="player-controls">
        <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Ⅱ' : '▶'}</button>
        <button type="button" onClick={() => seek(-10)} aria-label="Back 10 seconds">↶10</button>
        <button type="button" onClick={() => seek(10)} aria-label="Forward 10 seconds">10↷</button>
        <span className="player-time">{formatTime(current)} / {formatTime(duration)}</span>
        <input
          className="seek"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(current, duration || 0)}
          onChange={(event) => {
            if (videoRef.current) videoRef.current.currentTime = Number(event.target.value);
          }}
          aria-label="Video timeline"
        />
        <button type="button" onClick={() => {
          const next = !muted;
          setMuted(next);
          if (videoRef.current) videoRef.current.muted = next;
        }} aria-label="Mute">{muted ? '×' : 'VOL'}</button>
        <div className="player-menu-wrap">
          <button type="button" onClick={() => setMenu((open) => !open)} aria-expanded={menu}>SET</button>
          {menu && (
            <div className="player-menu">
              <strong>QUALITY</strong>
              {available.map(([label, url]) => (
                <button type="button" key={label} onClick={() => selectQuality(label, url)}>{label}{quality === label ? ' ✓' : ''}</button>
              ))}
              <strong>SPEED</strong>
              {[.75, 1, 1.25, 1.5].map((value) => (
                <button type="button" key={value} onClick={() => changeSpeed(value)}>{value}×{speed === value ? ' ✓' : ''}</button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => videoRef.current?.requestFullscreen?.()} aria-label="Fullscreen">FULL</button>
      </div>
    </div>
  );
}

function PhotoViewer({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!images.length) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') setIndex((value) => (value + 1) % images.length);
      if (event.key === 'ArrowLeft') setIndex((value) => (value - 1 + images.length) % images.length);
      if (event.key === 'Escape') setZoom(false);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  useEffect(() => {
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  if (!images.length) {
    return (
      <div className="photo-viewer photo-viewer-empty">
        <div className="photo-stage">
          <p>No media has been added to this project yet.</p>
        </div>
      </div>
    );
  }

  const image = images[index];

  return (
    <div className={`photo-viewer ${zoom ? 'zoomed' : ''}`}>
      <div className="photo-stage">
        <img src={image} alt={`${alt} ${index + 1}`} onClick={() => setZoom((value) => !value)} />

        {images.length > 1 && (
          <>
            <button type="button" className="photo-prev" onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}>←</button>
            <button type="button" className="photo-next" onClick={() => setIndex((value) => (value + 1) % images.length)}>→</button>
            <span className="photo-counter">
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="photo-thumbs">
          {images.map((item, itemIndex) => (
            <button
              type="button"
              key={`${item}-${itemIndex}`}
              className={itemIndex === index ? 'active' : ''}
              onClick={() => setIndex(itemIndex)}
            >
              <img src={item} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [project, setProject] = useState<Project | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('nuranico-lang');
    if (saved === 'fa' || saved === 'en') setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    async function load() {


      const projectId = Number(id);

      const [projectResult, linksResult] = await Promise.all([
        supabase
          .from('portfolio')
          .select('*')
          .eq('id', projectId)
          .eq('published', true)
          .maybeSingle(),

        supabase
          .from('project_media')
          .select('media_asset_id,sort_order')
          .eq('project_id', projectId)
          .order('sort_order', { ascending: true }),
      ]);

      if (projectResult.data) {
        setProject(projectResult.data);
      }

      const mediaIds = (linksResult.data || [])
        .map((row) => row.media_asset_id)
        .filter((value): value is number => value != null);

      if (mediaIds.length) {
        const mediaResult = await supabase
          .from('media_assets')
          .select('id,file_url,file_type,mime_type,name')
          .in('id', mediaIds);

        if (mediaResult.data) {
          const byId = new Map(
            mediaResult.data.map((item) => [item.id, item])
          );

          const orderedMedia: AttachedMedia[] = [];

          for (const mediaId of mediaIds) {
            const item = byId.get(mediaId);

            if (item) {
              orderedMedia.push({
                id: item.id,
                file_url: item.file_url,
                file_type: item.file_type ?? null,
                mime_type: item.mime_type ?? null,
                name: item.name ?? null,
              });
            }
          }

          setAttachedMedia(orderedMedia);
        }
      } else {
        setAttachedMedia([]);
      }

      setLoading(false);
    }
    void load();
  }, [id]);

  if (loading) return <main className="project-page"><div className="project-loading">Loading project…</div></main>;
  if (!project) {
    return (
      <main className="project-page">
        <SiteHeader />
        <div className="project-not-found"><p>404 / PROJECT</p><h1>Project not found.</h1><Link href="/work">Return to work ↗</Link></div>
      </main>
    );
  }

  const title = lang === 'fa' ? project.title_fa : project.title_en || project.title_fa;
  const description = lang === 'fa' ? project.description_fa : project.description_en || project.description_fa;
  const attachedImages = attachedMedia
    .filter((item) => !(item.mime_type || '').toLowerCase().startsWith('video'))
    .map((item) => item.file_url);

  const attachedVideo = attachedMedia.find(
    (item) =>
      (item.mime_type || '').toLowerCase().startsWith('video') ||
      (item.file_type || '').toLowerCase() === 'video'
  );

  const gallery = attachedImages.length
    ? attachedImages
    : project.gallery_urls?.length
      ? project.gallery_urls
      : project.cover_url
        ? [project.cover_url]
        : [];

  const effectiveVideoUrl =
    attachedVideo?.file_url ||
    (isVideo(project) ? project.media_url : undefined);

  const video = !!effectiveVideoUrl;

  return (
    <main className="project-page">
      <SiteHeader />

      <section className="project-hero">
        <div>
          <p>{String(project.category).toUpperCase()} / PROJECT {String(project.id > 0 ? project.id : Math.abs(project.id)).padStart(2, '0')}</p>
          <h1>{title}</h1>
          {description ? <div className="project-description">{description}</div> : null}
        </div>
      </section>

      {video && effectiveVideoUrl ? (
        <section className="project-media-block">
          <VideoPlayer
            src={effectiveVideoUrl}
            sources={project.media_sources}
            poster={project.cover_url}
          />
        </section>
      ) : (
        <section className="project-media-block">
          <PhotoViewer images={gallery} alt={title} />
        </section>
      )}

      <section className="project-details">
        <div><span>01</span><h2>THE PROJECT</h2></div>
        <p>{description || 'A NURANICO visual project.'}</p>
      </section>

      {gallery.length > 1 ? (
        <section className="project-gallery">
          {gallery.map((image, index) => (
            <figure key={image} className={index % 3 === 0 ? 'wide' : ''}>
              <img src={image} alt={`${title} gallery ${index + 1}`} loading="lazy" />
            </figure>
          ))}
        </section>
      ) : null}

      {(project.bts_media_url || project.bts_gallery_urls?.length) ? (
        <section className="project-bts">
          <div className="project-bts-head">
            <div>
              <span>05 / BEHIND THE SCENES</span>
              <h2>Behind the scenes.</h2>
            </div>
            <Link href="/work/behind-the-scenes">View all BTS ↗</Link>
          </div>
          {project.bts_media_url && (project.bts_media_type || '').toLowerCase().includes('video') ? (
            <VideoPlayer src={project.bts_media_url} poster={project.cover_url} />
          ) : project.bts_media_url ? (
            <div className="bts-image"><img src={project.bts_media_url} alt={`${title} behind the scenes`} /></div>
          ) : null}
          {project.bts_gallery_urls?.length ? (
            <div className="bts-grid">
              {project.bts_gallery_urls.map((image) => <img key={image} src={image} alt={`${title} behind the scenes`} loading="lazy" />)}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="project-end">
        <span>NURANICO / NEXT PROJECT</span>
        <Link href="/#work">Explore more work <b>↗</b></Link>
      </section>

      <footer className="project-footer"><span>NURANICO®</span><span>Creative studio / 2026</span></footer>
    </main>
  );
}
