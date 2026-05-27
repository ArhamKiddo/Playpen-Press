import React, { DragEvent } from "react";
import { Article } from "../types";
import { Clock, BookOpen, ChevronRight, Tag } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore, draggable, onDragStart }) => {
  const imageUrl = article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 cursor-pointer shadow-lg hover:shadow-amber-500/5 transition hover:border-zinc-700 duration-200 select-none ${
        draggable ? "active:scale-95 cursor-grab active:cursor-grabbing" : ""
      }`}
      onClick={() => onReadMore(article)}
      id={`article-card-${article.id}`}
    >
      <div className="space-y-4">
        {/* Card Thumbnail */}
        <div className="overflow-hidden rounded-lg aspect-video relative">
          <img
            src={imageUrl}
            alt={article.headline}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <span className="rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              {article.category}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-zinc-100 leading-snug group-hover:text-amber-400 transition duration-150 line-clamp-2">
            {article.headline}
          </h3>
          {article.subheading && (
            <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
              {article.subheading}
            </p>
          )}

          {/* Inline tags if any */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {article.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-0.5 text-[8px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded-sm">
                  <Tag className="h-2 w-2 text-zinc-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span className="font-medium text-zinc-300 line-clamp-1 max-w-[120px]">{article.byline}</span>
          <span>{article.date}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <Clock className="h-3 w-3 text-zinc-500" />
            {article.readTime}
          </span>
          <span className="flex items-center gap-0.5 text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition">
            Read Story <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
