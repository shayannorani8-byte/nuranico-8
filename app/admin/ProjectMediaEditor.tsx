"use client";
import { useState } from "react";
import { useAdminLocale } from "./AdminLocale";
import MediaPicker, { MediaThumbnail, type MediaAsset } from "./MediaPicker";
import { isVideoAsset } from "../../lib/media";
export default function ProjectMediaEditor({
  media,
  ids,
  mainUrl,
  coverUrl,
  onChange,
  onMain,
  onCover,
  onBehindScenes,
}: {
  media: MediaAsset[];
  ids: number[];
  mainUrl: string | null;
  coverUrl: string | null;
  onChange: (ids: number[]) => void;
  onMain: (item: MediaAsset) => void;
  onCover: (item: MediaAsset) => void;
  onBehindScenes: (id: number) => void;
}) {
  const { t } = useAdminLocale();
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(0);
  const selected = ids.flatMap((id) => {
    const item = media.find((item) => item.id === id);
    return item ? [item] : [];
  });
  const filtered = selected
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      [item.name, item.brand_name, item.project_name]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    currentPage = Math.min(page, pages - 1);
  function move(index: number, delta: number) {
    const next = [...ids];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  return (
    <section className="project-file-workspace">
      <p className="hint">
        {t(
          "Choose the main media and cover directly on each file. Arrange files with the arrows.",
        )}
      </p>
      <div className="project-file-toolbar">
        <input
          type="search"
          aria-label={t("Search project files")}
          placeholder={t("Search project files")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        <span>
          {filtered.length} / {selected.length} {t("files")}
        </span>
      </div>
      <div className="project-file-grid">
        {filtered
          .slice(currentPage * 12, (currentPage + 1) * 12)
          .map(({ item, index }) => (
            <article className="project-file" key={item.id}>
              <MediaThumbnail item={item} />
              <div className="project-file-info">
                <b dir="auto">{item.name}</b>
                <div className="project-file-roles">
                  <button
                    type="button"
                    aria-pressed={mainUrl === item.file_url}
                    onClick={() => onMain(item)}
                  >
                    {t("Main media")}
                  </button>
                  {!isVideoAsset(item) && (
                    <button
                      type="button"
                      aria-pressed={coverUrl === item.file_url}
                      onClick={() => onCover(item)}
                    >
                      {t("Cover")}
                    </button>
                  )}
                  <button type="button" onClick={() => onBehindScenes(item.id)}>
                    {t("Move to behind the scenes")}
                  </button>
                </div>
                <div className="project-file-order">
                  <span>
                    {index + 1} / {selected.length}
                  </span>
                  <button
                    type="button"
                    disabled={!index}
                    aria-label={`${t("Move earlier")}: ${item.name}`}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === ids.length - 1}
                    aria-label={`${t("Move later")}: ${item.name}`}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(ids.filter((id) => id !== item.id))}
                  >
                    {t("Remove")}
                  </button>
                </div>
              </div>
            </article>
          ))}
      </div>
      {pages > 1 && (
        <div className="asset-pagination">
          <button
            type="button"
            disabled={!currentPage}
            onClick={() => setPage(currentPage - 1)}
          >
            {t("Previous")}
          </button>
          <span>
            {currentPage + 1} / {pages}
          </span>
          <button
            type="button"
            disabled={currentPage + 1 >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            {t("Next")}
          </button>
        </div>
      )}
      <MediaPicker
        title={t("Add from library")}
        media={media}
        ids={ids}
        onChange={onChange}
        multiple
        hideSelection
      />
      {!selected.length && (
        <p className="hint">
          {t("Upload files or choose from your library to start.")}
        </p>
      )}
    </section>
  );
}
