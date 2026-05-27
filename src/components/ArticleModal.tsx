import { Article } from "../types";
import { X, Printer, Share2, Clock, Bookmark, Tag } from "lucide-react";
import { useState } from "react";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  isEditorMode?: boolean;
  editorSubMode?: "Layout Designer" | "Text Editor";
  onUpdateArticleText?: (articleId: string, field: "headline" | "subheading" | "byline", value: string) => void;
  onUpdateArticleParagraph?: (articleId: string, pIndex: number, value: string) => void;
}

export default function ArticleModal({ 
  article, 
  onClose, 
  isBookmarked, 
  onToggleBookmark,
  isEditorMode,
  editorSubMode,
  onUpdateArticleText,
  onUpdateArticleParagraph
}: ArticleModalProps) {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const handleShare = () => {
    setCopied(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const imageUrl = article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
  const isEditable = isEditorMode && editorSubMode === "Text Editor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" id={`article-modal-${article.id}`}>
      {/* Absolute background click to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>
      
      <div 
        className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
              {article.category}
            </span>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Article Registry ID: {article.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
              title="Share Link"
              id="share-article-btn"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
              title="Print Article"
              id="print-article-btn"
            >
              <Printer className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`rounded-lg p-2 transition duration-150 ${
                isBookmarked 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-550/35" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              title={isBookmarked ? "Saved in Bookmark Drawer" : "Bookmark Article"}
              id="bookmark-article-btn"
            >
              <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-450 hover:bg-zinc-800 hover:text-white transition"
              title="Close Panel"
              id="close-article-modal-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Floating Success Indicator for Sharing */}
        {copied && (
          <div className="absolute top-16 right-6 z-10 rounded-lg bg-emerald-500 text-zinc-950 px-4 py-2 text-xs font-bold shadow-md animate-bounce">
            Link Copied to Clipboard!
          </div>
        )}

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 sm:p-10" id="print-article-content">
          <article className="mx-auto max-w-2xl space-y-6">
            
            {/* Meta details */}
            <div className="flex flex-wrap gap-4 items-center text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-4">
              <span className="font-bold text-zinc-200">{article.byline}</span>
              <span className="text-zinc-650">/</span>
              <span>{article.date}</span>
              <span className="text-zinc-650">/</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                {article.readTime}
              </span>
            </div>

            {/* Principal Title */}
            <h1 
              contentEditable={isEditable}
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const val = e.currentTarget.textContent || "";
                if (onUpdateArticleText && val !== article.headline) {
                  onUpdateArticleText(article.id, "headline", val);
                }
              }}
              className={`font-serif text-3xl font-black text-zinc-100 sm:text-4xl leading-tight focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                isEditable ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-1 cursor-text" : ""
              }`}
            >
              {article.headline}
            </h1>

            {/* Subheading */}
            {article.subheading && (
              <h2 
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent || "";
                  if (onUpdateArticleText && val !== article.subheading) {
                    onUpdateArticleText(article.id, "subheading", val);
                  }
                }}
                className={`font-serif text-lg italic text-amber-400 bg-zinc-900/40 leading-relaxed border-l-2 border-amber-500 pl-4 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                  isEditable ? "border border-dashed border-amber-400/40 hover:border-amber-400 cursor-text" : ""
                }`}
              >
                {article.subheading}
              </h2>
            )}

            {/* Main Visual Section */}
            <div className="overflow-hidden rounded-xl border border-zinc-800 my-6">
              <img
                src={imageUrl}
                alt={article.headline}
                className="h-96 w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Render tags label in card detail */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Assigned Tags:</span>
                {article.tags.map((tg, keyIdx) => (
                  <span key={keyIdx} className="flex items-center gap-1 bg-zinc-900 text-zinc-300 font-mono text-[10px] uppercase border border-zinc-800 px-2.5 py-0.5 rounded-full">
                    <Tag className="h-2.5 w-2.5 text-amber-400" />
                    {tg}
                  </span>
                ))}
              </div>
            )}

            {/* Text Paragraphs */}
            <div className="font-serif text-[17px] text-zinc-300 space-y-5 leading-relaxed antialiased">
              {article.paragraphs.map((paragraph, index) => (
                <p 
                  key={index}
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent || "";
                    if (onUpdateArticleParagraph && val !== paragraph) {
                      onUpdateArticleParagraph(article.id, index, val);
                    }
                  }}
                  className={`${index === 0 ? "drop-cap pt-2 text-zinc-200" : ""} focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                    isEditable ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-1 cursor-text" : ""
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Editorial Footer */}
            <div className="mt-12 border-t border-zinc-800 pt-8 pb-4">
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-5">
                <h4 className="font-serif text-sm font-bold text-zinc-200 mb-1">
                  About the Press
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  The Playpen Press is written, edited, and formatted by our school's student body at the cozy hearth. Contributions are warmly welcomed via standard reader submissions. The views expressed in student opinions are fully homegrown.
                </p>
              </div>
            </div>

          </article>
        </div>
      </div>
    </div>
  );
}
