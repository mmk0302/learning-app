"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Video = {
  id: string;
  title: string;
  youtubeId: string;
  description: string | null;
  duration: string | null;
  order: number;
};

type Section = {
  id: string;
  title: string;
  order: number;
  videos: Video[];
};

type Props = {
  courseId: string;
  sections: Section[];
};

export default function SectionManager({ courseId, sections: initialSections }: Props) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    initialSections[0]?.id ?? null
  );
  const [newVideo, setNewVideo] = useState<{ [sectionId: string]: { title: string; youtubeId: string; duration: string } }>({});
  const [loading, setLoading] = useState(false);

  async function addSection() {
    if (!newSectionTitle.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/courses/${courseId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle, order: sections.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setSections([...sections, { ...data, videos: [] }]);
      setNewSectionTitle("");
      setAddingSection(false);
      setExpandedSection(data.id);
    }
    setLoading(false);
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("このセクションと動画をすべて削除しますか？")) return;
    const res = await fetch(`/api/admin/sections/${sectionId}`, { method: "DELETE" });
    if (res.ok) {
      setSections(sections.filter((s) => s.id !== sectionId));
    }
  }

  async function addVideo(sectionId: string) {
    const v = newVideo[sectionId];
    if (!v?.title || !v?.youtubeId) return;
    setLoading(true);
    const section = sections.find((s) => s.id === sectionId)!;
    const res = await fetch(`/api/admin/sections/${sectionId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: v.title,
        youtubeId: v.youtubeId,
        duration: v.duration || null,
        order: section.videos.length,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, videos: [...s.videos, data] } : s
        )
      );
      setNewVideo({ ...newVideo, [sectionId]: { title: "", youtubeId: "", duration: "" } });
    }
    setLoading(false);
  }

  async function deleteVideo(sectionId: string, videoId: string) {
    if (!confirm("この動画を削除しますか？")) return;
    const res = await fetch(`/api/admin/videos/${videoId}`, { method: "DELETE" });
    if (res.ok) {
      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, videos: s.videos.filter((v) => v.id !== videoId) } : s
        )
      );
    }
  }

  return (
    <div className="space-y-3">
      {sections.map((section, sIdx) => (
        <div key={section.id} className="card overflow-hidden">
          {/* セクションヘッダー */}
          <div
            className="flex items-center justify-between px-5 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {sIdx + 1}
              </span>
              <span className="font-medium text-gray-900 text-sm">{section.title}</span>
              <span className="text-xs text-gray-400">{section.videos.length}本</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1"
              >
                削除
              </button>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* セクション展開時 */}
          {expandedSection === section.id && (
            <div className="p-4 space-y-2">
              {section.videos.map((video, vIdx) => (
                <div key={video.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-400 w-5 text-center">{vIdx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{video.title}</p>
                    <p className="text-xs text-gray-400">{video.youtubeId}{video.duration && ` · ${video.duration}`}</p>
                  </div>
                  <button
                    onClick={() => deleteVideo(section.id, video.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    削除
                  </button>
                </div>
              ))}

              {/* 動画追加フォーム */}
              <div className="border border-dashed border-gray-200 rounded-lg p-3 mt-2 space-y-2">
                <p className="text-xs font-medium text-gray-500">+ 動画を追加</p>
                <input
                  type="text"
                  placeholder="動画タイトル"
                  value={newVideo[section.id]?.title ?? ""}
                  onChange={(e) => setNewVideo({ ...newVideo, [section.id]: { ...newVideo[section.id], title: e.target.value } })}
                  className="form-input text-sm py-2"
                />
                <input
                  type="text"
                  placeholder="YouTube動画ID（例: dQw4w9WgXcQ）"
                  value={newVideo[section.id]?.youtubeId ?? ""}
                  onChange={(e) => setNewVideo({ ...newVideo, [section.id]: { ...newVideo[section.id], youtubeId: e.target.value } })}
                  className="form-input text-sm py-2"
                />
                <input
                  type="text"
                  placeholder="再生時間（例: 10:30）"
                  value={newVideo[section.id]?.duration ?? ""}
                  onChange={(e) => setNewVideo({ ...newVideo, [section.id]: { ...newVideo[section.id], duration: e.target.value } })}
                  className="form-input text-sm py-2"
                />
                <button
                  onClick={() => addVideo(section.id)}
                  disabled={loading}
                  className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                >
                  追加
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* セクション追加 */}
      {addingSection ? (
        <div className="card p-4 space-y-3">
          <input
            type="text"
            placeholder="セクション名（例：第1章 デザインの基礎）"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="form-input"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={addSection}
              disabled={loading || !newSectionTitle.trim()}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              {loading ? "追加中..." : "追加"}
            </button>
            <button
              onClick={() => { setAddingSection(false); setNewSectionTitle(""); }}
              className="btn-secondary text-sm py-2 px-4"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
        >
          + セクションを追加
        </button>
      )}
    </div>
  );
}
