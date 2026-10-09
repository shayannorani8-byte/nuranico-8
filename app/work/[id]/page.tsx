'use client';
import ProjectGallery from '../../../components/ProjectGallery';
import {projectSections,sectionName} from '../../../components/PortfolioCard';
import PortfolioFooter from '../../../components/PortfolioFooter';
import ArrowUpRight from '../../../components/ArrowUpRight';
import SiteHeader from '../../../components/SiteHeader';


import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import ContentStatus from '../../../components/ContentStatus';
import { localizedValue, isVideoAsset } from '../../../lib/media';
import { usePageTexts } from '../../../lib/usePageTexts';
import { useSiteLanguage } from '../../../components/SiteLanguage';
type AttachedMedia = {
  id: number;
  file_url: string;
  file_type?: string | null;
  mime_type?: string | null;
  name?: string | null;
};

type Project = {
  destinations?:string[];
  brand_name?: string | null;
  bts_media_ids?: number[] | null;
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
  return isVideoAsset(project);
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
  const { lang } = useSiteLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
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

  useEffect(() => {
    setActiveSrc(src);
    setVideoError(false);
    setVideoSize(null);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setQuality('Auto');
  }, [src]);

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
            : '16 / 9',
          '--video-ratio': videoRatio ?? 16 / 9,
        } as React.CSSProperties
      }
    >
      <div className="player-stage">
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        playsInline
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(event) => event.preventDefault()}
        preload="auto"
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
        onResize={(event) => {
          const video = event.currentTarget;
          if (video.videoWidth && video.videoHeight) {
            setVideoSize({ width: video.videoWidth, height: video.videoHeight });
          }
        }}
        onTimeUpdate={(event) =>
          setCurrent(event.currentTarget.currentTime)
        }
        onPlay={() => setPlaying(true)}
        onPlaying={() => {
          setPlaying(true);
          const video = videoRef.current;
          if (video?.videoWidth && video.videoHeight) {
            setVideoSize({ width: video.videoWidth, height: video.videoHeight });
          }
        }}
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
          setVideoError(true);

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

      {videoError ? <div className="player-error" role="alert"><p>{lang === 'fa' ? 'ویدیو بارگذاری نشد.' : 'This video could not be loaded.'}</p><button type="button" onClick={() => { setVideoError(false); videoRef.current?.load(); }}>{lang === 'fa' ? 'تلاش دوباره' : 'Try again'}</button></div> : !playing && (
        <button
          type="button"
          className="player-center-play"
          onClick={togglePlay}
          aria-label={lang === 'fa' ? 'پخش ویدیو' : 'Play video'}
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

      </div>

      <div className="player-controls" dir="ltr">
        <button type="button" className="player-toggle" onClick={togglePlay} aria-label={playing ? (lang === 'fa' ? 'توقف پخش' : 'Pause') : (lang === 'fa' ? 'پخش' : 'Play')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M8 6v12M16 6v12" /> : <path d="M8 5l11 7-11 7Z" />}</svg>
        </button>
        <button
          type="button"
          className="player-skip"
          onClick={() => seek(-10)}
          aria-label={lang === 'fa' ? '۱۰ ثانیه عقب' : 'Back 10 seconds'}
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
          aria-label={lang === 'fa' ? '۱۰ ثانیه جلو' : 'Forward 10 seconds'}
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
          aria-label={lang === 'fa' ? 'زمان ویدیو' : 'Video timeline'}
        />
        <button type="button" onClick={() => {
          const next = !muted;
          setMuted(next);
          if (videoRef.current) videoRef.current.muted = next;
        }} aria-label={muted ? (lang === 'fa' ? 'وصل صدا' : 'Unmute') : (lang === 'fa' ? 'قطع صدا' : 'Mute')} aria-pressed={muted}>{muted ? '×' : 'VOL'}</button>
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
          aria-label={lang === 'fa' ? 'تغییر حالت تمام‌صفحه' : 'Toggle fullscreen'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { lang, text } = usePageTexts('project');
  const [project, setProject] = useState<Project | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);
  const [behindScenes,setBehindScenes] = useState<AttachedMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setProject(null);
    setAttachedMedia([]);setBehindScenes([]);

    async function load() {
      try {
        const projectId = Number(id);
        if (!Number.isSafeInteger(projectId) || projectId <= 0) return;
        const [projectResult, linksResult, destinationsResult] = await Promise.all([
          supabase.from('portfolio').select('*').eq('id', projectId).eq('published', true).abortSignal(AbortSignal.timeout(12000)).maybeSingle(),
          supabase.from('project_media').select('media_asset_id,sort_order').eq('project_id', projectId).order('sort_order', { ascending: true }).abortSignal(AbortSignal.timeout(12000)),
          supabase.from('project_destinations').select('destination').eq('project_id',projectId).abortSignal(AbortSignal.timeout(12000)),
        ]);
        if (projectResult.error) throw projectResult.error;
        if (linksResult.error) throw linksResult.error;
        if (cancelled) return;
        setProject(projectResult.data ? {...projectResult.data,destinations:(destinationsResult.data || []).map(row=>row.destination)} : null);
        if (!projectResult.data) return;
        const mediaIds = (linksResult.data || []).map(row => row.media_asset_id).filter((value): value is number => value != null);
        const btsIds:number[] = projectResult.data.bts_media_ids || [];
        const allIds = Array.from(new Set([...mediaIds,...btsIds]));
        if (allIds.length) {
          const mediaResult = await supabase.from('media_assets').select('id,file_url,file_type,mime_type,name').in('id', allIds).abortSignal(AbortSignal.timeout(12000));
          if (mediaResult.error) throw mediaResult.error;
          const byId = new Map((mediaResult.data || []).map(item => [item.id, item]));
          if (!cancelled) setBehindScenes(btsIds.flatMap(mediaId => {const item=byId.get(mediaId);return item ? [item] : [];}));
          if (!cancelled) setAttachedMedia(mediaIds.flatMap(mediaId => {
            const item = byId.get(mediaId);
            return item ? [item] : [];
          }));
        }
      } catch (error) {
        console.error('Could not load project:', error);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [id, retry]);

  if (loading) {
    return (
      <main className="project-page">
        <SiteHeader />
        <div className="project-loading" role="status">
          {text(
            'loading',
            'Loading project…',
            'در حال بارگذاری پروژه…'
          )}
        </div>
      </main>
    );
  }
  if (error) {
    return <main className="project-page"><SiteHeader /><div className="project-not-found">
      <ContentStatus error onRetry={() => setRetry(value => value + 1)} retryLabel={text('retry', 'Try again', 'تلاش دوباره')}>
        {text('load_error', 'This project could not be loaded.', 'این پروژه بارگذاری نشد.')}
      </ContentStatus><Link href="/work">{text('return_to_work', 'Return to work ↗', 'بازگشت به پروژه‌ها ↗')}</Link>
    </div></main>;
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

  const title = localizedValue(lang, project.title_en, project.title_fa, text('untitled', 'Untitled', 'بدون عنوان'));
  const description = localizedValue(lang, project.description_en, project.description_fa);
  const attachedImages = attachedMedia.filter(item => !isVideoAsset(item)).map(item => item.file_url);
  const attachedVideos = attachedMedia.filter(isVideoAsset);
  const mainImage = project.media_url && !isVideo(project) ? project.media_url : '';
  const gallery = Array.from(new Set([
    ...(mainImage ? [mainImage] : []),
    ...attachedImages,
    ...(project.gallery_urls || []).filter(url => !isVideoAsset({ file_url: url })),
    ...(!isVideo(project) && !attachedVideos.length && !mainImage && !attachedImages.length && !project.gallery_urls?.length && project.cover_url ? [project.cover_url] : []),
  ]));
  const effectiveVideoUrl = isVideo(project) ? project.media_url : !project.media_url ? attachedVideos[0]?.file_url : undefined;


  return (
    <main className="project-page">
      <SiteHeader />

      <section className="project-hero">
        <div>
          <p>{projectSections(project).map(key=>sectionName(key,lang)).join(' · ')}</p>
          <h1>{title}</h1>{project.brand_name && <p dir="auto">{project.brand_name}</p>}
          {description ? <div className="project-description">{description}</div> : null}
        </div>
      </section>

      <ProjectGallery presentation="sequence" title={text('gallery_label','Gallery','گالری')} lang={lang} renderVideo={url=><VideoPlayer src={url} sources={url===effectiveVideoUrl ? project.media_sources : undefined} poster={url===effectiveVideoUrl ? project.cover_url : undefined}/>} items={Array.from(new Set([...(project.media_url ? [project.media_url] : []),...attachedMedia.map(item=>item.file_url),...(project.gallery_urls || []),...(!project.media_url && !attachedMedia.length ? gallery : [])])).map((url,index)=>({url,video:isVideoAsset({file_url:url}),label:`${title} ${index+1}`}))}/>

      {behindScenes.length > 0 && <><h2 id="project-bts" className="project-bts-title">{lang === 'fa' ? 'پشت صحنه' : 'Behind the scenes'}</h2><ProjectGallery title={lang === 'fa' ? 'پشت صحنه پروژه' : 'Project behind the scenes'} lang={lang} renderVideo={url => <VideoPlayer src={url} />} items={behindScenes.map((item,index) => ({url:item.file_url,video:isVideoAsset(item),label:`${title} — ${lang === 'fa' ? 'پشت صحنه' : 'Behind the scenes'} ${index+1}`}))} /></>}

      <section className="project-end">
        <Link href="/work">
          <span className="project-more-label">{text(
            'explore_more',
            'Explore more work',
            'مشاهده پروژه‌های بیشتر'
          )}</span>
          <span className="project-more-icon" aria-hidden="true"><ArrowUpRight /></span>
        </Link>
      </section>

      <PortfolioFooter/>
    </main>
  );
}
