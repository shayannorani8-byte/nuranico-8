'use client';
import SiteHeader from '../../../components/SiteHeader';


import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { usePageTexts } from '../../../lib/usePageTexts';
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
  const [videoSize, setVideoSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const videoRatio =
    videoSize && videoSize.width > 0 && videoSize.height > 0
      ? videoSize.width / videoSize.height
      : null;

  const orientation =
    videoRatio == null
      ? 'loading'
      : videoRatio < 0.95
        ? 'portrait'
        : videoRatio > 1.05
          ? 'landscape'
          : 'square';



  const available = useMemo(() => {
    const entries = sources ? Object.entries(sources).filter(([, url]) => !!url) : [];
    return entries.length ? entries : [['Auto', src] as [string, string]];
  }, [sources, src]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
    } catch (error) {
      console.error('Video play failed:', error);
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
    <div
      className={`player player-${orientation}`}
      style={
        {
          '--video-aspect': videoSize
            ? `${videoSize.width} / ${videoSize.height}`
            : 'auto',
          '--video-ratio': videoRatio ?? 0,
        } as React.CSSProperties
      }
    >
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        playsInline
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;

          setDuration(
            Number.isFinite(video.duration) ? video.duration : 0
          );

          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoSize({
              width: video.videoWidth,
              height: video.videoHeight,
            });
          }
        }}
        onLoadedData={(event) => {
          const video = event.currentTarget;

          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoSize({
              width: video.videoWidth,
              height: video.videoHeight,
            });
          }
        }}
        onTimeUpdate={(event) =>
          setCurrent(event.currentTarget.currentTime)
        }
        onPlay={() => setPlaying(true)}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);

          const video = videoRef.current;
          if (video) {
            try {
              video.currentTime = 0;
            } catch {
              // Safari may temporarily reject seeking while media state changes.
            }
          }
        }}
        onError={(event) => {
          const video = event.currentTarget;
          setPlaying(false);

          console.error('Video media error:', {
            code: video.error?.code,
            message: video.error?.message,
            currentSrc: video.currentSrc,
            networkState: video.networkState,
            readyState: video.readyState,
          });
        }}
        onClick={togglePlay}
      />

      {!playing && (
        <button
          type="button"
          className="player-center-play"
          onClick={togglePlay}
          aria-label="Play"
        >
          <svg
            className="player-play-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 6.8L17.2 12L9 17.2Z" />
          </svg>
        </button>
      )}

      <div className="player-controls">
        <button
          type="button"
          className="player-skip"
          onClick={() => seek(-10)}
          aria-label="Back 10 seconds"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path className="skip-arrow" d="M11.3 9.2H6.2V4.1" />
            <path className="skip-arrow" d="M6.8 9.1A11.2 11.2 0 1 1 5 19.7" />
            <text x="16" y="20.2" textAnchor="middle">10</text>
          </svg>
        </button>
        <button
          type="button"
          className="player-skip"
          onClick={() => seek(10)}
          aria-label="Forward 10 seconds"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path className="skip-arrow" d="M20.7 9.2h5.1V4.1" />
            <path className="skip-arrow" d="M25.2 9.1A11.2 11.2 0 1 0 27 19.7" />
            <text x="16" y="20.2" textAnchor="middle">10</text>
          </svg>
        </button>
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
<button
          type="button"
          className="player-fullscreen"
          onClick={async () => {
            const video = videoRef.current;
            if (!video) return;

            const player = video.closest('.player') as HTMLElement | null;
            if (!player) return;

            try {
              if (document.fullscreenElement) {
                await document.exitFullscreen();
              } else if (player.requestFullscreen) {
                await player.requestFullscreen();
              } else {
                const safariVideo = video as HTMLVideoElement & {
                  webkitEnterFullscreen?: () => void;
                };

                const safariPlayer = player as HTMLElement & {
                  webkitRequestFullscreen?: () => Promise<void> | void;
                };

                if (safariVideo.webkitEnterFullscreen) {
                  safariVideo.webkitEnterFullscreen();
                } else if (safariPlayer.webkitRequestFullscreen) {
                  await safariPlayer.webkitRequestFullscreen();
                }
              }
            } catch (error) {
              console.error('Fullscreen failed:', error);
            }
          }}
          aria-label="Toggle fullscreen"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PhotoViewer({
  images,
  alt,
  text,
}: {
  images: string[];
  alt: string;
  text: (
    key: string,
    fallbackEn?: string,
    fallbackFa?: string
  ) => string;
}) {
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
          <p>
            {text(
              'no_media',
              'No media has been added to this project yet.',
              'هنوز رسانه‌ای به این پروژه اضافه نشده است.'
            )}
          </p>
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
  const { lang, text } = usePageTexts('project');
  const [project, setProject] = useState<Project | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="project-page">
        <div className="project-loading">
          {text(
            'loading',
            'Loading project…',
            'در حال بارگذاری پروژه…'
          )}
        </div>
      </main>
    );
  }
  if (!project) {
    return (
      <main className="project-page">
        <SiteHeader />
        <div className="project-not-found">
          <p>
            {text(
              'not_found_code',
              '404 / PROJECT',
              '۴۰۴ / پروژه'
            )}
          </p>
          <h1>
            {text(
              'not_found_title',
              'Project not found.',
              'پروژه پیدا نشد.'
            )}
          </h1>
          <Link href="/work">
            {text(
              'return_to_work',
              'Return to work ↗',
              'بازگشت به پروژه‌ها ↗'
            )}
          </Link>
        </div>
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
          <p>
            {String(project.category).toUpperCase()} /{' '}
            {text('project_label', 'PROJECT', 'پروژه')}{' '}
            {String(
              project.id > 0
                ? project.id
                : Math.abs(project.id)
            ).padStart(2, '0')}
          </p>
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
          <PhotoViewer
            images={gallery}
            alt={title}
            text={text}
          />
        </section>
      )}

      <section className="project-details">
        <div>
          <span>01</span>
          <h2>
            {text(
              'the_project',
              'THE PROJECT',
              'پروژه'
            )}
          </h2>
        </div>
        <p>
          {description ||
            text(
              'project_fallback',
              'A NURANICO visual project.',
              'یک پروژه تصویری از NURANICO.'
            )}
        </p>
      </section>

      {gallery.length > 1 ? (
        <section className="project-gallery">
          {gallery.map((image, index) => (
            <figure key={image} className={index % 3 === 0 ? 'wide' : ''}>
              <img src={image} alt={`${title} ${text(
                'gallery_label',
                'gallery',
                'گالری'
              )} ${index + 1}`} loading="lazy" />
            </figure>
          ))}
        </section>
      ) : null}

      <section className="project-end">
        <span>
          {text(
            'next_project',
            'NURANICO / NEXT PROJECT',
            'NURANICO / پروژه بعدی'
          )}
        </span>

        <Link href="/#work">
          {text(
            'explore_more',
            'Explore more work',
            'مشاهده پروژه‌های بیشتر'
          )}{' '}
          <b>↗</b>
        </Link>
      </section>

      <footer className="project-footer">
        <span>NURANICO®</span>
        <span>
          {text(
            'footer_studio',
            'Creative studio / 2026',
            'استودیوی خلاق / ۲۰۲۶'
          )}
        </span>
      </footer>
    </main>
  );
}
