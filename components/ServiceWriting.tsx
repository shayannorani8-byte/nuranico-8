export default function ServiceWriting({text,as:Tag}:{text?:string|null;as:'h3'|'p'}){
 return <Tag>{(text || '').split(/(\s+)/).map((word,index)=>/^\s+$/.test(word) ? word : <span key={index} className="service-write-word" style={{['--word-delay' as string]:`${Math.floor(index/2)*60}ms`}}>{word}</span>)}</Tag>;
}
