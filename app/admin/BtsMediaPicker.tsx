'use client';
import { useState, type ReactNode } from 'react';
import MediaPicker, {type MediaAsset} from './MediaPicker';
import {useAdminLocale} from './AdminLocale';
import {isVideoAsset} from '../../lib/media';

export default function BtsMediaPicker({media,ids,onChange,upload,busy=false}:{busy?:boolean;media:MediaAsset[];ids:number[];onChange:(ids:number[])=>void;upload:(kind:'image'|'video')=>ReactNode}){
  const {t}=useAdminLocale();
  const [kind,setKind]=useState<'image'|'video'>('image');
  const selected=(type:'image'|'video')=>ids.filter(id=>{const asset=media.find(item=>item.id===id);return asset && (isVideoAsset(asset) ? 'video' : 'image')===type;});
  return <div className="bts-media-workspace">
    <div className="bts-type-switch" role="group" aria-label={t('Behind the scenes')}>
      {(['image','video'] as const).map(type=><button type="button" key={type} disabled={busy} aria-pressed={kind===type} onClick={()=>setKind(type)}>{t(type==='image' ? 'Photos' : 'Videos')} <span>{selected(type).length}</span></button>)}
    </div>
    <MediaPicker key={kind} title={t(kind==='image' ? 'BTS photos' : 'BTS videos')} kind={kind} media={media} ids={selected(kind)} multiple upload={upload(kind)} onChange={next=>onChange([...ids.filter(id=>!selected(kind).includes(id)),...next])}/>
  </div>;
}
