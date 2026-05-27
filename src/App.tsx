import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Sparkles, 
  PenTool, 
  BookOpen, 
  Bookmark, 
  ArrowRight, 
  Clock, 
  Newspaper, 
  X, 
  Send, 
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Shield,
  Calendar,
  Filter,
  Check,
  Tag,
  ChevronRight,
  Menu,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Sliders,
  Inbox,
  Layout,
  BookMarked,
  Layers,
  Archive,
  Trash2,
  Palette,
  Paintbrush,
  Sun,
  Moon,
  Lock,
  Unlock,
  Upload
} from "lucide-react";
import MainHeader from "./components/MainHeader";
import ArticleCard from "./components/ArticleCard";
import ArticleModal from "./components/ArticleModal";
import { supabase } from "./supabaseClient";
import { Article, EditorialReview, PitchIdea, HeadlineOption } from "./types";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pageSlots, setPageSlots] = useState<{
    heroId: string | null;
    secondaryId: string | null;
    subFeatureId: string | null;
  }>({
    heroId: null,
    secondaryId: null,
    subFeatureId: null
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Core Real-time Fetch Synchronization
  useEffect(() => {
    const fetchNewspaperData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all published articles from Supabase cloud ledger
        const { data: articlesData, error: artError } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (artError) throw artError;
        if (articlesData) {
          setArticles(articlesData.map(art => ({
            ...art,
            tags: art.tags || [art.category, "Featured"]
          })));
        }

        // 2. Fetch the active visual front page layout mapping slots
// 2. Fetch the active visual front page layout mapping slots
        const { data: slotsData, error: slotError } = await supabase
          .from("layout_slots")
          .select("*");
@@ -90,9 +90,9 @@
        if (slotsData) {
          const mapping = { heroId: null, secondaryId: null, subFeatureId: null };
          slotsData.forEach(slot => {
            if (slot.slot_name === "hero") mapping.heroId = slot.article_id;
            if (slot.slot_name === "secondary") mapping.secondaryId = slot.article_id;
            if (slot.slot_name === "sub_feature") mapping.subFeatureId = slot.article_id;
            if (slot.slot_name === "hero") mapping.heroId = slot.article_id || slot.id;
            if (slot.slot_name === "secondary") mapping.secondaryId = slot.article_id || slot.id;
            if (slot.slot_name === "sub_feature") mapping.subFeatureId = slot.article_id || slot.id;
          });
          setPageSlots(mapping);
        }
@@ -257,17 +257,17 @@

  // Drag operations configuration
  const handleDragStart = (e: React.DragEvent, articleId: string) => {
    const article = articles.find(a => String(a.id) === String(articleId));
    const article = articles.find(a => a.id === articleId);
    if (article) {
      e.dataTransfer.setData("text/plain", JSON.stringify(article));
    } else {
      e.dataTransfer.setData("text/plain", String(articleId));
      e.dataTransfer.setData("text/plain", articleId);
    }
    e.dataTransfer.effectAllowed = "move";
  };

  // Cloud Dropzone Slot State Execution Mutations
  const handleSlotDrop = async (e: React.DragEvent, slotKey: "hero" | "secondary" | "subFeature") => {
  const handleSlotDrop = async (e: React.DragEvent, slotKey: "heroId" | "secondaryId" | "subFeatureId") => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;
@@ -276,32 +276,33 @@
    try {
      const parsed = JSON.parse(rawData);
      articleId = parsed.id;
    } catch (jsonErr) {
    } catch {
      articleId = rawData;
    }

    if (articleId) {
      const databaseSlotName = slotKey === "subFeature" ? "sub_feature" : slotKey;
      // Strips "Id" out and converts camelCase cleanly to snake_case for Supabase
      let databaseSlotName = slotKey.replace('Id', '');
      if (databaseSlotName === "subFeature") {
        databaseSlotName = "sub_feature";
      }

      // Local State Commit
      setPageSlots(prev => ({
        ...prev,
        [`${slotKey}Id`]: articleId
      }));

      // Cloud Persistence Commit via Upsert to avoid silent empty rows update failure
      // Cloud Persistence Commit
      const { error } = await supabase
        .from("layout_slots")
        .upsert(
          { slot_name: databaseSlotName, article_id: articleId },
          { onConflict: "slot_name" }
        );
        .update({ article_id: articleId })
        .eq("slot_name", databaseSlotName);

      if (error) {
        print("Dropzone mapping allocation rejected:", error.message);
        console.error("Dropzone mapping allocation rejected:", error.message);
        showToast("Network failure. Position syncing decoupled.");
      } else {
        const found = articles.find(a => String(a.id) === String(articleId));
        const found = articles.find(a => a.id === articleId);
        showToast(`Linked "${found ? found.headline.slice(0, 20) : "Article"}..." to Marquee! 🎯`);
      }
    }
@@ -310,7 +311,7 @@
  // Inline Click Editor Focus Loss Save Interceptor
  const handleInlineTextSave = async (articleId: string, field: "headline" | "subheading" | "byline", updatedValue: string) => {
    // 1. Local tracking updates
    setArticles(prev => prev.map(art => String(art.id) === String(articleId) ? { ...art, [field]: updatedValue } : art));
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, [field]: updatedValue } : art));

    // 2. Cloud structural updates
    const dbFieldMapping = field === "headline" ? "title" : field;
@@ -320,7 +321,7 @@
      .eq("id", articleId);

    if (error) {
      print("Text alignment sync failure:", error.message);
      console.error("Text alignment sync failure:", error.message);
    } else {
      showToast("Edits saved automatically to cloud server! 💾");
    }
@@ -338,18 +339,18 @@
      .eq("id", articleId);

    if (error) {
      print("Deletion query rejected:", error.message);
      console.error("Deletion query rejected:", error.message);
      showToast("Database security blocked request.");
      return;
    }

    // 2. Clean local structural views
    setArticles(prev => prev.filter(art => String(art.id) !== String(articleId)));
    setArticles(prev => prev.filter(art => art.id !== articleId));
    setPageSlots(prev => {
      const updated = { ...prev };
      if (String(updated.heroId) === String(articleId)) updated.heroId = null;
      if (String(updated.secondaryId) === String(articleId)) updated.secondaryId = null;
      if (String(updated.subFeatureId) === String(articleId)) updated.subFeatureId = null;
      if (updated.heroId === articleId) updated.heroId = null;
      if (updated.secondaryId === articleId) updated.secondaryId = null;
      if (updated.subFeatureId === articleId) updated.subFeatureId = null;
      return updated;
    });

@@ -400,7 +401,7 @@
        .select();

      if (error) {
        print("Publish execution rejected:", error.message);
        console.error("Publish execution rejected:", error.message);
        showToast("Error processing transmission payload.");
        return;
      }
@@ -456,7 +457,7 @@
      .select();

    if (error) {
      print("Failed to promote review submission:", error.message);
      console.error("Failed to promote review submission:", error.message);
      showToast("Database synchronization issue.");
      return;
    }
@@ -476,7 +477,7 @@
      };

      setArticles([processed, ...articles]);
      setPendingReviews(pendingReviews.filter(sub => String(sub.id) !== String(editingReviewId)));
      setPendingReviews(pendingReviews.filter(sub => sub.id !== editingReviewId));
      setEditingReviewId(null);
      showToast(`Approved and published code row securely!`);
    }
@@ -553,78 +554,78 @@
  };

  // Array filter sorting operations
  const getSortedAndFilteredArchive = () => {
    return (articles || []).filter(article => {
        if (!article) return false;
        
        const headlineStr = article.headline || "";
        const bylineStr = article.byline || "";
        const categoryStr = article.category || "";
        const searchStr = archiveSearch ? archiveSearch.toLowerCase() : "";

        const matchesSearch = headlineStr.toLowerCase().includes(searchStr) ||
                              bylineStr.toLowerCase().includes(searchStr) ||
                              categoryStr.toLowerCase().includes(searchStr);

        if (archiveFilterTags.length === 0) return matchesSearch;
        const articleTags = article.tags || [categoryStr];
        return matchesSearch && archiveFilterTags.some(t => articleTags.includes(t));
    }).sort((a, b) => {
        if (!a || !b) return 0;
        const timeA = Date.parse(a.date || "") || 0;
        const timeB = Date.parse(b.date || "") || 0;
        return archiveSortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  };
const getSortedAndFilteredArchive = () => {
  return (articles || []).filter(article => {
      if (!article) return false;
      
      const headlineStr = article.headline || "";
      const bylineStr = article.byline || "";
      const categoryStr = article.category || "";
      const searchStr = archiveSearch ? archiveSearch.toLowerCase() : "";

      const matchesSearch = headlineStr.toLowerCase().includes(searchStr) ||
                            bylineStr.toLowerCase().includes(searchStr) ||
                            categoryStr.toLowerCase().includes(searchStr);

      if (archiveFilterTags.length === 0) return matchesSearch;
      const articleTags = article.tags || [categoryStr];
      return matchesSearch && archiveFilterTags.some(t => articleTags.includes(t));
  }).sort((a, b) => {
      if (!a || !b) return 0;
      const timeA = Date.parse(a.date || "") || 0;
      const timeB = Date.parse(b.date || "") || 0;
      return archiveSortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });
};
  // Object State Assignment Handlers

  // Object State Assignment Handlers with Type-Safe Coercion
  const safeArticles = articles || [];

  const fallbackObj = { 
    headline: "", 
    byline: "", 
    category: "", 
    paragraphs: [], 
    tags: [], 
    date: "" 
  };

  const slottedHero = pageSlots?.heroId 
    ? (safeArticles.find(a => String(a?.id) === String(pageSlots.heroId)) || fallbackObj) 
    : fallbackObj;

  const slottedSecondary = pageSlots?.secondaryId 
    ? (safeArticles.find(a => String(a?.id) === String(pageSlots.secondaryId)) || fallbackObj) 
    : fallbackObj;

  const slottedSubFeature = pageSlots?.subFeatureId 
    ? (safeArticles.find(a => String(a?.id) === String(pageSlots.subFeatureId)) || fallbackObj) 
    : fallbackObj;

  const currentSlottedIds = [pageSlots.heroId, pageSlots.secondaryId, pageSlots.subFeatureId]
    .filter(Boolean)
    .map(String);
  const fallbackObj = { headline: "", title: "", byline: "", category: "", paragraphs: [], tags: [], date: "", imageUrl: "", image_data: "" };

  // Use String() conversion to guarantee type matching across database states!
  const rawHero = safeArticles.find(a => a ? String(a.id) === String(pageSlots?.heroId) : false);
  const slottedHero = rawHero ? {
    ...rawHero,
    headline: rawHero.headline || rawHero.title || "",
    imageUrl: rawHero.imageUrl || rawHero.image_data || ""
  } : fallbackObj;

  const rawSecondary = safeArticles.find(a => a ? String(a.id) === String(pageSlots?.secondaryId) : false);
  const slottedSecondary = rawSecondary ? {
    ...rawSecondary,
    headline: rawSecondary.headline || rawSecondary.title || "",
    imageUrl: rawSecondary.imageUrl || rawSecondary.image_data || ""
  } : fallbackObj;

  const rawSubFeature = safeArticles.find(a => a ? String(a.id) === String(pageSlots?.subFeatureId) : false);
  const slottedSubFeature = rawSubFeature ? {
    ...rawSubFeature,
    headline: rawSubFeature.headline || rawSubFeature.title || "",
    imageUrl: rawSubFeature.imageUrl || rawSubFeature.image_data || ""
  } : fallbackObj;

  const currentSlottedIds = [pageSlots.heroId, pageSlots.secondaryId, pageSlots.subFeatureId].filter(Boolean);

  const displayedFeedArticles = (articles || []).filter(art => {
    if (!art) return false;
const displayedFeedArticles = (articles || []).filter(art => {
  if (!art) return false;

    const isSlotted = currentSlottedIds.includes(String(art.id));
    
    const categoryStr = art.category || "";
    const artTags = art.tags || [];
    const matchesCategory = selectedCategory === "All" || 
                            categoryStr === selectedCategory || 
                            artTags.includes(selectedCategory);
  const isSlotted = currentSlottedIds ? currentSlottedIds.includes(art.id) : false;
  
  const categoryStr = art.category || "";
  const artTags = art.tags || [];
  const matchesCategory = selectedCategory === "All" || 
                          categoryStr === selectedCategory || 
                          artTags.includes(selectedCategory);

    const headlineStr = art.headline || "";
    const bylineStr = art.byline || "";
    const searchStr = searchQuery ? searchQuery.toLowerCase() : "";
  const headlineStr = art.headline || "";
  const bylineStr = art.byline || "";
  const searchStr = searchQuery ? searchQuery.toLowerCase() : "";

    const matchesSearch = headlineStr.toLowerCase().includes(searchStr) || 
                          bylineStr.toLowerCase().includes(searchStr);
  const matchesSearch = headlineStr.toLowerCase().includes(searchStr) || 
                        bylineStr.toLowerCase().includes(searchStr);

    return !isSlotted && matchesCategory && matchesSearch;
  });
  return !isSlotted && matchesCategory && matchesSearch;
});

  const availableTags = ["Campus", "Sports", "Opinion", "Science", "Tech", "Arts"];

@@ -796,8 +797,8 @@
            </aside>
          )}

          {/* COLUMN 2: Center Layout Preview Slate with Parenthesized Nested Ternaries */}
          <main className={`space-y-8 ${isEditorMode && currentTab === "home" ? (leftSidebarExpanded ? "lg:col-span-7" : "lg:col-span-9") : (leftSidebarExpanded ? "lg:col-span-10" : "lg:col-span-12")}`}>
          {/* COLUMN 2: Center Layout Preview Slate */}
          <main className={`space-y-8 ${isEditorMode && currentTab === "home" ? leftSidebarExpanded ? "lg:col-span-7" : "lg:col-span-9" : leftSidebarExpanded ? "lg:col-span-10" : "lg:col-span-12"}`}>

            {loading && (
              <div className="flex items-center justify-center py-6 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs gap-3">
@@ -908,9 +909,9 @@
                      onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsHeroDraggingOver(true); }}
                      onDragLeave={() => { if (isEditorMode) setIsHeroDraggingOver(false); }}
                      onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "hero"); setIsHeroDraggingOver(false); } }}
                      className={`md:col-span-7 rounded-2xl p-1 transition overflow-hidden border ${isEditorMode && editorSubMode === "Layout Designer" ? (isHeroDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60") : "bg-zinc-900 border-zinc-800"}`}
                      className={`md:col-span-7 rounded-2xl p-1 transition overflow-hidden border ${isEditorMode && editorSubMode === "Layout Designer" ? isHeroDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                    >
                      {slottedHero && slottedHero.headline ? (
                      {slottedHero ? (
                        <div className="relative group p-5 h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="inline-block rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-400">{slottedHero.category}</span>
@@ -966,11 +967,11 @@
                      {/* POSITION 2: SECONDARY SLOT GRID TARGET */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsSecondaryDraggingOver(true); }}
                        onDragLeave={() => { if (isEditorMode) setIsSecondaryDraggingOver(false); }}
                       onDragLeave={() => { if (isEditorMode) setIsSecondaryDraggingOver(false); }}
                        onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "secondary"); setIsSecondaryDraggingOver(false); } }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? (isSecondaryDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60") : "bg-zinc-900 border-zinc-800"}`}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? isSecondaryDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                      >
                        {slottedSecondary && slottedSecondary.headline ? (
                        {slottedSecondary ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">{slottedSecondary.category}</span>
@@ -1005,9 +1006,9 @@
                        onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsSubFeatureDraggingOver(true); }}
                        onDragLeave={() => { if (isEditorMode) setIsSubFeatureDraggingOver(false); }}
                        onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "subFeature"); setIsSubFeatureDraggingOver(false); } }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? (isSubFeatureDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60") : "bg-zinc-900 border-zinc-800"}`}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? isSubFeatureDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                      >
                        {slottedSubFeature && slottedSubFeature.headline ? (
                        {slottedSubFeature ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono bg-sky-400/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 inline-block">{slottedSubFeature.category}</span>
@@ -1133,9 +1134,9 @@

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {articles.map((article) => {
                    const isHero = String(pageSlots.heroId) === String(article.id);
                    const isSec = String(pageSlots.secondaryId) === String(article.id);
                    const isSub = String(pageSlots.subFeatureId) === String(article.id);
                    const isHero = pageSlots.heroId === article.id;
                    const isSec = pageSlots.secondaryId === article.id;
                    const isSub = pageSlots.subFeatureId === article.id;
                    const isSlotted = isHero || isSec || isSub;
                    const canDrag = editorSubMode === "Layout Designer";

@@ -1202,7 +1203,7 @@
        onUpdateArticleText={handleInlineTextSave}
        onUpdateArticleParagraph={(artId, pIdx, val) => {
          setArticles(prev => prev.map(a => {
            if (String(a.id) === String(artId)) {
            if (a.id === artId) {
              const paras = [...a.paragraphs];
              paras[pIdx] = val;
              // Sync change back locally
