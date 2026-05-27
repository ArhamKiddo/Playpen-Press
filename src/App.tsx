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
        const { data: slotsData, error: slotError } = await supabase
          .from("layout_slots")
          .select("*");
        
        if (slotError) throw slotError;
        if (slotsData) {
          const mapping = { heroId: null, secondaryId: null, subFeatureId: null };
          slotsData.forEach(slot => {
            if (slot.slot_name === "hero") mapping.heroId = slot.article_id || slot.id;
            if (slot.slot_name === "secondary") mapping.secondaryId = slot.article_id || slot.id;
            if (slot.slot_name === "sub_feature") mapping.subFeatureId = slot.article_id || slot.id;
          });
          setPageSlots(mapping);
        }
      } catch (err: any) {
        console.error("Supabase Initialization Error:", err.message);
        showToast("Error connecting to database infrastructure.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewspaperData();
  }, []);

  const [currentTab, setCurrentTab] = useState<"home" | "archive">("home");
  const [theme, setTheme] = useState<"purple-cream" | "purple-grey">(() => {
    const saved = localStorage.getItem("editorial-theme");
    return (saved === "purple-grey" || saved === "purple-cream") ? saved : "purple-cream";
  });

  const changeTheme = (newTheme: "purple-cream" | "purple-grey") => {
    setTheme(newTheme);
    localStorage.setItem("editorial-theme", newTheme);
    showToast(`Theme changed to ${newTheme === "purple-cream" ? "Purple & Cream 🍦" : "Dark Purple & Grey 🌌"}`);
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Permissions & Access Controls
  const [userRole, setUserRole] = useState<"Viewer" | "Editor">("Viewer");
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false);
  const [editorSubMode, setEditorSubMode] = useState<"Layout Designer" | "Text Editor">("Layout Designer");
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    return localStorage.getItem("reaquit-site-title") || "The Playpen Press";
  });
  
  useEffect(() => {
    localStorage.setItem("reaquit-site-title", siteTitle);
  }, [siteTitle]);

  const [isContentDeskOpen, setIsContentDeskOpen] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isHeroDraggingOver, setIsHeroDraggingOver] = useState<boolean>(false);
  const [isSecondaryDraggingOver, setIsSecondaryDraggingOver] = useState<boolean>(false);
  const [isSubFeatureDraggingOver, setIsSubFeatureDraggingOver] = useState<boolean>(false);
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState<boolean>(true);
  
  // Bookmarks & Anonymous tips
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [tipTopic, setTipTopic] = useState<string>("");
  const [tipMessage, setTipMessage] = useState<string>("");
  const [submittedTips, setSubmittedTips] = useState<Array<{id: number, topic: string, message: string, timestamp: string}>>([]);
  const [draftTextForCounter, setDraftTextForCounter] = useState<string>("");

  // Modals & Slideouts
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showAiLab, setShowAiLab] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Toast System
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Pending Review Submission Array System
  const [pendingReviews, setPendingReviews] = useState<Article[]>([
    {
      id: "pending-1",
      headline: "The Campus Café Needs Premium Coffee Blends",
      subheading: "Students petition the school administration to replace burnt espresso arrays with fresh local organic roasts.",
      byline: "Leo Chen, sophomore writer",
      date: "2026-05-24",
      category: "Campus Life (Opinions)",
      paragraphs: [
        "Whether preparing for complex exam days or warming up for morning Phantoms football sessions, students depend on caffeine daily.",
        "The current options served at our central canteen are bitter and overpriced. A petition representing 300 student signatures suggests sourcing organic fair-trade coffee beans from Pine Valley Roasters to boost canteen energy and promote sustainable business on campus."
      ],
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
      readTime: "3 min read",
      tags: ["Opinion", "Campus"]
    }
  ]);

  // Review panel parameters
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewHeadline, setEditReviewHeadline] = useState("");
  const [editReviewByline, setEditReviewByline] = useState("");
  const [editReviewCategory, setEditReviewCategory] = useState("Campus Life (Opinions)");
  const [editReviewBodyText, setEditReviewBodyText] = useState("");
  const [editReviewImageUrl, setEditReviewImageUrl] = useState("");
  const [editReviewDate, setEditReviewDate] = useState("");
  const [editReviewTags, setEditReviewTags] = useState<string[]>([]);

  // Composer Controlled Form State Values
  const [editorFormHeadline, setEditorFormHeadline] = useState("");
  const [editorFormByline, setEditorFormByline] = useState("");
  const [editorFormSubheading, setEditorFormSubheading] = useState("");
  const [editorFormCategory, setEditorFormCategory] = useState("Campus Life (Opinions)");
  const [editorFormBodyText, setEditorFormBodyText] = useState("");
  const [editorFormImageUrl, setEditorFormImageUrl] = useState(""); // Captures the base64 string asset
  const [editorFormDate, setEditorFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editorFormTags, setEditorFormTags] = useState<string[]>(["Campus Life (Opinions)"]);

  // Category sorting state on Archive Page
  const [archiveSortOrder, setArchiveSortOrder] = useState<"newest" | "oldest">("newest");
  const [archiveFilterTags, setArchiveFilterTags] = useState<string[]>([]);
  const [archiveSearch, setArchiveSearch] = useState<string>("");

  // AI Assistant specific states
  const [aiAction, setAiAction] = useState<"draft" | "proofread" | "headlines" | "pitches">("draft");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [draftTopic, setDraftTopic] = useState("");
  const [draftKeyFacts, setDraftKeyFacts] = useState("");
  const [draftStyle, setDraftStyle] = useState("Standard Journalism");
  const [draftSection, setDraftSection] = useState("Campus");
  const [textToProof, setTextToProof] = useState("");
  const [draftHeadlineInput, setDraftHeadlineInput] = useState("");
  const [summaryFactsInput, setSummaryFactsInput] = useState("");
  const [pitchTheme, setPitchTheme] = useState("");
  const [pitchCategory, setPitchCategory] = useState("Campus");

  const [aiDraftOutput, setAiDraftOutput] = useState<{ headline: string; subheading: string; byline: string; paragraphs: string[]; } | null>(null);
  const [aiProofOutput, setAiProofOutput] = useState<EditorialReview | null>(null);
  const [aiHeadlinesOutput, setAiHeadlinesOutput] = useState<{ headlines: HeadlineOption[] } | null>(null);
  const [aiPitchesOutput, setAiPitchesOutput] = useState<{ ideas: PitchIdea[] } | null>(null);

  // Date Parser Formatter
  const formatDatePretty = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (monthIndex >= 0 && monthIndex < 12) return `${months[monthIndex]} ${day}, ${year}`;
      }
    }
    return dateStr;
  };

  // Base64 Binary File Reader Conversion Processor
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditorFormImageUrl(base64String); // Commits compressed local graphic straight into local component form state
      showToast("Local illustrative asset uploaded and packed! 📸");
    };
    reader.readAsDataURL(file);
  };

  // Drag operations configuration
  const handleDragStart = (e: React.DragEvent, articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      e.dataTransfer.setData("text/plain", JSON.stringify(article));
    } else {
      e.dataTransfer.setData("text/plain", articleId);
    }
    e.dataTransfer.effectAllowed = "move";
  };

  // Cloud Dropzone Slot State Execution Mutations
  const handleSlotDrop = async (e: React.DragEvent, slotKey: "hero" | "secondary" | "subFeature") => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;

    let articleId = "";
    try {
      const parsed = JSON.parse(rawData);
      articleId = parsed.id;
    } catch (jsonErr) {
      articleId = rawData;
    }

    if (articleId) {
      const databaseSlotName = slotKey === "subFeature" ? "sub_feature" : slotKey;
      
      // Local State Commit
      setPageSlots(prev => ({
        ...prev,
        [`${slotKey}Id`]: articleId
      }));

      // Cloud Persistence Commit
      const { error } = await supabase
        .from("layout_slots")
        .update({ article_id: articleId })
        .eq("slot_name", databaseSlotName);

      if (error) {
        console.error("Dropzone mapping allocation rejected:", error.message);
        showToast("Network failure. Position syncing decoupled.");
      } else {
        const found = articles.find(a => a.id === articleId);
        showToast(`Linked "${found ? found.headline.slice(0, 20) : "Article"}..." to Marquee! 🎯`);
      }
    }
  };

  // Inline Click Editor Focus Loss Save Interceptor
  const handleInlineTextSave = async (articleId: string, field: "headline" | "subheading" | "byline", updatedValue: string) => {
    // 1. Local tracking updates
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, [field]: updatedValue } : art));

    // 2. Cloud structural updates
    const dbFieldMapping = field === "headline" ? "title" : field;
    const { error } = await supabase
      .from("articles")
      .update({ [dbFieldMapping]: updatedValue })
      .eq("id", articleId);

    if (error) {
      console.error("Text alignment sync failure:", error.message);
    } else {
      showToast("Edits saved automatically to cloud server! 💾");
    }
  };

  // Hard Deletion Execution Sequence
  const handleDeleteArticle = async (articleId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this article from the database archive?");
    if (!isConfirmed) return;

    // 1. Purge raw database records
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);

    if (error) {
      console.error("Deletion query rejected:", error.message);
      showToast("Database security blocked request.");
      return;
    }

    // 2. Clean local structural views
    setArticles(prev => prev.filter(art => art.id !== articleId));
    setPageSlots(prev => {
      const updated = { ...prev };
      if (updated.heroId === articleId) updated.heroId = null;
      if (updated.secondaryId === articleId) updated.secondaryId = null;
      if (updated.subFeatureId === articleId) updated.subFeatureId = null;
      return updated;
    });

    showToast("Article permanently deleted from entire server! 🗑️");
  };

  // Publishing Composer Form Insertion
  const handleGeneralSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorFormHeadline.trim() || !editorFormBodyText.trim() || !editorFormByline.trim()) {
      alert("Please specify Headline, Author, and Body Narrative.");
      return;
    }

    const payloadArticle = {
      title: editorFormHeadline,
      subheading: editorFormSubheading || null,
      byline: editorFormByline,
      date: editorFormDate || new Date().toISOString().split('T')[0],
      category: editorFormCategory,
      paragraphs: editorFormBodyText.split("\n\n").filter(p => p.trim() !== ""),
      image_data: editorFormImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
      read_time: `${Math.max(1, Math.round(editorFormBodyText.split(/\s+/).length / 200))} min read`,
      tags: editorFormTags.length > 0 ? editorFormTags : [editorFormCategory]
    };

    if (!isEditorMode) {
      // Reader submission interceptor
      const fallbackObject: Article = {
        id: "submission-" + Date.now(),
        headline: payloadArticle.title,
        subheading: payloadArticle.subheading || undefined,
        byline: payloadArticle.byline,
        date: payloadArticle.date,
        category: payloadArticle.category,
        paragraphs: payloadArticle.paragraphs,
        imageUrl: payloadArticle.image_data,
        readTime: payloadArticle.read_time,
        tags: payloadArticle.tags
      };
      setPendingReviews([fallbackObject, ...pendingReviews]);
      showToast("Story submitted to Editor's Review Panel! 📬");
    } else {
      // Live Cloud Deployment injection
      const { data, error } = await supabase
        .from("articles")
        .insert([payloadArticle])
        .select();

      if (error) {
        console.error("Publish execution rejected:", error.message);
        showToast("Error processing transmission payload.");
        return;
      }

      if (data && data[0]) {
        const transformed: Article = {
          id: data[0].id,
          headline: data[0].title,
          subheading: data[0].subheading || undefined,
          byline: data[0].byline,
          date: data[0].date,
          category: data[0].category,
          paragraphs: data[0].paragraphs,
          imageUrl: data[0].image_data,
          readTime: data[0].read_time,
          tags: data[0].tags
        };
        setArticles([transformed, ...articles]);
        showToast(`"${transformed.headline.slice(0, 20)}..." released live to school! 📰`);
      }
    }

    // Reset local insertion variables
    setEditorFormHeadline("");
    setEditorFormSubheading("");
    setEditorFormByline("");
    setEditorFormBodyText("");
    setEditorFormImageUrl("");
    setEditorFormTags(["Campus"]);
    setShowPublishModal(false);
  };

  // Review Pipeline publication promotion
  const handlePublishReviewedSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;

    const databasePayload = {
      title: editReviewHeadline,
      subheading: "Reviewed student submission.",
      byline: editReviewByline,
      date: editReviewDate || new Date().toISOString().split('T')[0],
      category: editReviewCategory,
      paragraphs: editReviewBodyText.split("\n\n").filter(p => p.trim() !== ""),
      image_data: editReviewImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
      read_time: `${Math.max(1, Math.round(editReviewBodyText.split(/\s+/).length / 250))} min read`,
      tags: editReviewTags.length > 0 ? editReviewTags : [editReviewCategory]
    };

    const { data, error } = await supabase
      .from("articles")
      .insert([databasePayload])
      .select();

    if (error) {
      console.error("Failed to promote review submission:", error.message);
      showToast("Database synchronization issue.");
      return;
    }

    if (data && data[0]) {
      const processed: Article = {
        id: data[0].id,
        headline: data[0].title,
        subheading: data[0].subheading,
        byline: data[0].byline,
        date: data[0].date,
        category: data[0].category,
        paragraphs: data[0].paragraphs,
        imageUrl: data[0].image_data,
        readTime: data[0].read_time,
        tags: data[0].tags
      };

      setArticles([processed, ...articles]);
      setPendingReviews(pendingReviews.filter(sub => sub.id !== editingReviewId));
      setEditingReviewId(null);
      showToast(`Approved and published code row securely!`);
    }
  };

  // AI Assistant trigger processing hooks
  const runAiAssistant = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      let payload = {};
      let actionName = "";

      if (aiAction === "draft") {
        if (!draftTopic.trim()) throw new Error("Please specify a topic for the story draft.");
        actionName = "draft-article";
        payload = { topic: draftTopic, keyFacts: draftKeyFacts, articleStyle: draftStyle, targetSection: draftSection };
      } else if (aiAction === "proofread") {
        if (!textToProof.trim()) throw new Error("Provide draft copy to proofread.");
        actionName = "proofread";
        payload = { articleText: textToProof };
      } else if (aiAction === "headlines") {
        if (!draftHeadlineInput.trim()) throw new Error("Provide a baseline headline or subject.");
        actionName = "headlines";
        payload = { draftHeadline: draftHeadlineInput, summaryFacts: summaryFactsInput };
      } else if (aiAction === "pitches") {
        if (!pitchTheme.trim()) throw new Error("Please insert an overarching pitch theme.");
        actionName = "story-ideas";
        payload = { theme: pitchTheme, category: pitchCategory };
      }

      const response = await fetch("/api/editorial-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName, payload })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (aiAction === "draft") setAiDraftOutput(data);
      else if (aiAction === "proofread") setAiProofOutput(data);
      else if (aiAction === "headlines") setAiHeadlinesOutput(data);
      else if (aiAction === "pitches") setAiPitchesOutput(data);

    } catch (err: any) {
      setAiError(err.message || "Failed to communicate with AI endpoint.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportAiDraft = () => {
    if (!aiDraftOutput) return;
    setEditorFormHeadline(aiDraftOutput.headline);
    setEditorFormSubheading(aiDraftOutput.subheading);
    setEditorFormByline(aiDraftOutput.byline || "Playpen Press correspondent");
    setEditorFormBodyText(aiDraftOutput.paragraphs.join("\n\n"));
    setEditorFormCategory(draftSection);
    setEditorFormTags([draftSection]);
    setShowAiLab(false);
    setShowPublishModal(true);
  };

  const handleStartReviewEdit = (sub: Article) => {
    setEditingReviewId(sub.id);
    setEditReviewHeadline(sub.headline);
    setEditReviewByline(sub.byline);
    setEditReviewCategory(sub.category);
    setEditReviewDate(sub.date);
    setEditReviewImageUrl(sub.imageUrl || "");
    setEditReviewBodyText(sub.paragraphs.join("\n\n"));
    setEditReviewTags(sub.tags || [sub.category]);
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
  // Object State Assignment Handlers
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
  ? (safeArticles.find(a => a?.id === pageSlots.heroId) || fallbackObj) 
  : fallbackObj;

const slottedSecondary = pageSlots?.secondaryId 
  ? (safeArticles.find(a => a?.id === pageSlots.secondaryId) || fallbackObj) 
  : fallbackObj;

const slottedSubFeature = pageSlots?.subFeatureId 
  ? (safeArticles.find(a => a?.id === pageSlots.subFeatureId) || fallbackObj) 
  : fallbackObj;

  const currentSlottedIds = [pageSlots.heroId, pageSlots.secondaryId, pageSlots.subFeatureId].filter(Boolean);
  
const displayedFeedArticles = (articles || []).filter(art => {
  if (!art) return false;

  const isSlotted = currentSlottedIds ? currentSlottedIds.includes(art.id) : false;
  
  const categoryStr = art.category || "";
  const artTags = art.tags || [];
  const matchesCategory = selectedCategory === "All" || 
                          categoryStr === selectedCategory || 
                          artTags.includes(selectedCategory);

  const headlineStr = art.headline || "";
  const bylineStr = art.byline || "";
  const searchStr = searchQuery ? searchQuery.toLowerCase() : "";

  const matchesSearch = headlineStr.toLowerCase().includes(searchStr) || 
                        bylineStr.toLowerCase().includes(searchStr);

  return !isSlotted && matchesCategory && matchesSearch;
});

  const availableTags = ["Campus", "Sports", "Opinion", "Science", "Tech", "Arts"];

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 theme-parent ${theme === "purple-cream" ? "theme-purple-cream" : "theme-purple-grey"}`} id="bento-editorial-root">
      
      {/* Toast Engine Component Container */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-zinc-900 px-5 py-3 shadow-2xl animate-bounce" id="action-toast">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></div>
          <span className="text-xs font-bold font-mono text-zinc-100">{toastMsg}</span>
        </div>
      )}

      {/* Main Structural Header Navbar Component */}
      <MainHeader 
        currentCategory={selectedCategory}
        setCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentTab("home");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openLab={() => setShowAiLab(true)}
        openPublish={() => setShowPublishModal(true)}
        userRole={isEditorMode ? "Editor" : "Viewer"}
        onChangeRole={(role) => {
          if (role === 'Editor') {
            setShowPasswordModal(true);
          } else {
            setIsEditorMode(false);
            setUserRole("Viewer");
            showToast("Switched Preview Mode to: Reader View (Live Site)");
          }
        }}
        openSidebar={() => setSidebarOpen(true)}
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        sidebarExpanded={leftSidebarExpanded}
        setSidebarExpanded={setLeftSidebarExpanded}
        siteTitle={siteTitle}
        setSiteTitle={setSiteTitle}
        editorSubMode={editorSubMode}
        isEditorMode={isEditorMode}
      />

      {/* THREE-COLUMN MASTER CORE CONTENT WRAPPER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Left Navigation Segment Panel */}
          {leftSidebarExpanded && (
            <aside className="lg:col-span-2 space-y-6" id="left-collapsible-categories">
              {isEditorMode && (
                <div className="bg-zinc-900 border-2 border-amber-400 p-3.5 shadow-lg rounded-xl space-y-2.5 flex flex-col" id="sidebar-submode-segmented">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                    <Sliders className="h-3 w-3 text-amber-400" /> Designer Deck Sub-Mode
                  </span>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEditorSubMode("Layout Designer");
                        showToast("Design Mode: Drag & drop slots activated. 🎨");
                      }}
                      className={`text-[9px] py-1.5 px-1.5 rounded font-mono font-bold uppercase tracking-tight text-center transition cursor-pointer ${
                        editorSubMode === "Layout Designer" ? "bg-amber-400 text-zinc-950 font-black" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Layout
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorSubMode("Text Editor");
                        showToast("Text Mode: Click on headlines or paragraphs to edit. ✍️");
                      }}
                      className={`text-[9px] py-1.5 px-1.5 rounded font-mono font-bold uppercase tracking-tight text-center transition cursor-pointer ${
                        editorSubMode === "Text Editor" ? "bg-indigo-600 text-white font-black" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Text
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5" /> Newsroom Sections
                  </span>
                  <button onClick={() => setLeftSidebarExpanded(false)} className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono hover:underline uppercase">Hide</button>
                </div>
                <nav className="flex flex-col space-y-1">
                  {[
                    { key: "All", label: "📰 All Stories" },
                    { key: "Campus Life (Opinions)", label: "💭 Campus Life (Opinions)" },
                    { key: "Phantoms Sports", label: "🏈 Phantoms Sports" },
                    { key: "Studies", label: "📚 Studies" },
                    { key: "Events and Clubs", label: "🏡 Events and Clubs" }
                  ].map((cat) => {
                    const isActive = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(cat.key);
                          setCurrentTab("home");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                          isActive ? "bg-amber-400 text-zinc-950 font-black shadow-md border-l-4 border-amber-600" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Theme Settings Module */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3" id="theme-selector-sidebar-card">
                <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Palette className="h-3.5 w-3.5" /> Editorial Theme
                </span>
                <div className="flex flex-col gap-2">
                  <button onClick={() => changeTheme("purple-cream")} className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${theme === "purple-cream" ? "bg-purple-100 text-purple-900 border-purple-400 shadow-sm" : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"}`}>
                    <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-amber-500" /> Default Cream</span>
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  </button>
                  <button onClick={() => changeTheme("purple-grey")} className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${theme === "purple-grey" ? "bg-purple-950 text-purple-200 border-purple-500 shadow-sm" : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"}`}>
                    <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-purple-400" /> Twilight Grey</span>
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                  </button>
                </div>
              </div>

              {/* Security Privileges Authentication Module */}
              <div className="bg-zinc-900 border border-zinc-805 p-4 rounded-xl space-y-3" id="sidebar-editor-lock-card">
                <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" /> Executive Access
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditorMode) {
                      setIsEditorMode(false);
                      setUserRole("Viewer");
                      showToast("Editor Mode Deactivated. Returned to Reader View.");
                    } else {
                      setShowPasswordModal(true);
                    }
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isEditorMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-sm" : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200"
                  }`}
                  id="enable-editor-sidebar-btn"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-black">
                    {isEditorMode ? <><Unlock className="h-4 w-4 text-emerald-400" /> Editor Active</> : <><Lock className="h-4 w-4 text-zinc-500" /> Enable Editor</>}
                  </span>
                  {isEditorMode && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                </button>
              </div>
            </aside>
          )}

          {/* COLUMN 2: Center Layout Preview Slate */}
          <main className={`space-y-8 ${isEditorMode && currentTab === "home" ? leftSidebarExpanded ? "lg:col-span-7" : "lg:col-span-9" : leftSidebarExpanded ? "lg:col-span-10" : "lg:col-span-12"}`}>
            
            {loading && (
              <div className="flex items-center justify-center py-6 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs gap-3">
                <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                Synchronizing with cloud press registry arrays...
              </div>
            )}

            {isEditorMode && !leftSidebarExpanded && (
              <div className="bg-zinc-900 border-2 border-amber-400 p-2 text-xs flex items-center justify-between rounded-xl shadow-lg font-mono" id="main-column-editor-bar">
                <span className="text-zinc-300 flex items-center gap-1.5 uppercase font-black text-[10px] tracking-wider pl-2">
                  <Sliders className="h-4 w-4 text-amber-400" /> Active Sub-Mode:
                </span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => { setEditorSubMode("Layout Designer"); showToast("Design Mode: Layout active."); }} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition ${editorSubMode === "Layout Designer" ? "bg-amber-400 text-zinc-950" : "text-zinc-400 bg-zinc-950"}`}>Layout Designer 📐</button>
                  <button type="button" onClick={() => { setEditorSubMode("Text Editor"); showToast("Text Mode: Inline active."); }} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition ${editorSubMode === "Text Editor" ? "bg-indigo-600 text-white" : "text-zinc-400 bg-zinc-950"}`}>Text Editor ✍️</button>
                </div>
              </div>
            )}

            {/* INTEGRATED OFFICE DRAWER CMS CORE BOX */}
            {isEditorMode && (
              <section className="bg-zinc-900 border-2 border-amber-400/80 rounded-2xl shadow-xl overflow-hidden" id="editor-cms-control-panel">
                <button type="button" onClick={() => setIsContentDeskOpen(!isContentDeskOpen)} className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-zinc-900 hover:bg-zinc-850 transition text-left gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-amber-400" />
                    <div>
                      <h2 className="font-serif text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                        Staff HQ &amp; Editorial Desk
                        <span className="text-[10px] font-mono bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-sm">
                          {isContentDeskOpen ? "Open" : "Minimized (Open Content Desk)"}
                        </span>
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg">
                      <span className="font-extrabold text-amber-400">{pendingReviews.length} pending reviews</span>
                    </div>
                  </div>
                </button>

                {isContentDeskOpen && (
                  <div className="p-6 border-t border-zinc-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* SUB SECTION A: REVIEW COMPILING ACCUMULATOR */}
                      <div className="bg-zinc-950 p-4 border border-zinc-805 rounded-xl space-y-3">
                        <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1"><Inbox className="h-4 w-4" /> Queue Deck</span>
                        {pendingReviews.length > 0 ? (
                          <div className="space-y-2 max-h-[290px] overflow-y-auto">
                            {pendingReviews.map((sub) => (
                              <div key={sub.id} className={`p-3 rounded-lg border text-left ${editingReviewId === sub.id ? "bg-amber-400/10 border-amber-400" : "bg-zinc-900 border-zinc-800"}`}>
                                <h4 className="font-serif text-sm font-bold text-zinc-200 line-clamp-1">{sub.headline}</h4>
                                <button type="button" onClick={() => handleStartReviewEdit(sub)} className="mt-2 bg-amber-400 text-zinc-900 font-mono text-[9px] font-black uppercase px-2.5 py-1.5 rounded-sm">Edit &amp; Publish &rarr;</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-serif text-zinc-500 italic text-center py-6">All review operations cleared.</p>
                        )}
                      </div>

                      {/* SUB SECTION B: CORE CREATIVE ARTICLE DISPATCH COMPOSER */}
                      <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4">
                        <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1"><Layout className="h-4 w-4" /> Live Composer</span>
                        <form onSubmit={handleGeneralSubmitStory} className="space-y-3 text-xs text-left">
                          <input type="text" required placeholder="Story Headline Title..." value={editorFormHeadline} onChange={(e) => setEditorFormHeadline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-850 p-2 text-zinc-200" />
                          <input type="text" required placeholder="Author Credit Byline..." value={editorFormByline} onChange={(e) => setEditorFormByline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-850 p-2 text-zinc-200" />
                          
                          {/* UPGRADED LOCAL IMAGE FILE UPLOADER */}
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold">Illustration Thumbnail Asset Selection</label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer bg-zinc-900 hover:bg-zinc-850 transition">
                                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  <Upload className="h-5 w-5 text-zinc-500 mb-1" />
                                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">
                                    {editorFormImageUrl ? "✓ Local Graphic Staged" : "Choose local image file"}
                                  </p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadChange} />
                              </label>
                            </div>
                          </div>

                          <textarea rows={4} required placeholder="Compose master body text..." value={editorFormBodyText} onChange={(e) => setEditorFormBodyText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-850 p-2 text-zinc-200 font-serif" />
                          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono font-black py-2 uppercase tracking-wider">Publish Entry &rarr;</button>
                        </form>
                      </div>

                    </div>
                  </div>
                )}
              </section>
            )}

            {/* TAB CONTENT HOOKS A: HOMEPAGE WITH FRONT PREVIEW BOARD CANVAS */}
            {currentTab === "home" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <section className="space-y-4 text-left">
                  
                  {/* SLOTS LAYOUT CONTAINER GRID SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="drag-drop-slots-grid">
                    
                    {/* POSITION 1: MARQUEE HERO BOX */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsHeroDraggingOver(true); }}
                      onDragLeave={() => { if (isEditorMode) setIsHeroDraggingOver(false); }}
                      onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "hero"); setIsHeroDraggingOver(false); } }}
                      className={`md:col-span-7 rounded-2xl p-1 transition overflow-hidden border ${isEditorMode && editorSubMode === "Layout Designer" ? isHeroDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                    >
                      {slottedHero ? (
                        <div className="relative group p-5 h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="inline-block rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-400">{slottedHero.category}</span>
                            
                            {/* UNLOCKED INLINE TEXT HEADER ELEMENT */}
                            <h2 
                              contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleInlineTextSave(slottedHero.id, "headline", e.currentTarget.innerText)}
                              onClick={(e) => { if (isEditorMode && editorSubMode === "Text Editor") e.stopPropagation(); else setSelectedArticle(slottedHero); }}
                              className={`font-serif text-2xl sm:text-3xl font-black text-zinc-100 leading-tight transition focus:outline-none rounded ${isEditorMode && editorSubMode === "Text Editor" ? "border border-dashed border-amber-400 bg-zinc-950/40 p-1 cursor-text" : "group-hover:text-amber-400"}`}
                            >
                              {slottedHero.headline}
                            </h2>

                            {/* UNLOCKED INLINE SUBHEADING BLOCK */}
                            <p 
                              contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleInlineTextSave(slottedHero.id, "subheading", e.currentTarget.innerText)}
                              onClick={(e) => { if (isEditorMode && editorSubMode === "Text Editor") e.stopPropagation(); }}
                              className={`text-xs text-zinc-400 font-sans leading-relaxed focus:outline-none rounded ${isEditorMode && editorSubMode === "Text Editor" ? "border border-dashed border-amber-400/60 bg-zinc-950/40 p-1 cursor-text" : ""}`}
                            >
                              {slottedHero.subheading || "No supporting deck context assigned."}
                            </p>

                            {slottedHero.imageUrl && (
                              <div className="overflow-hidden rounded-lg max-h-[190px] border border-zinc-800 my-2">
                                <img src={slottedHero.imageUrl} className="w-full h-full object-cover" alt="Hero asset" />
                              </div>
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400 font-mono">
                            <span>By: {slottedHero.byline}</span>
                            <button onClick={() => setSelectedArticle(slottedHero)} className="text-amber-400 font-bold flex items-center gap-1">Read Beat &rarr;</button>
                          </div>
                        </div>
                      ) : (
                        /* HERO FALLBACK STATE SLATE */
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px] border-2 border-dashed border-zinc-800 bg-zinc-950/35 rounded-xl">
                          <Layout className="h-8 w-8 text-zinc-700 mb-2 animate-pulse" />
                          <h4 className="font-mono text-xs uppercase font-bold text-amber-500 tracking-wider">Slot 1 (Hero)</h4>
                          <p className="text-[11px] font-mono text-zinc-500 max-w-xs leading-normal">
                            EMPTY HERO SLOT - Drag a featured story card here from the cabinet sidebar to activate the front page.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN INTERCEPT SIDE: SECONDARY & SUB-FEATURE DECKS */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                      
                      {/* POSITION 2: SECONDARY SLOT GRID TARGET */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsSecondaryDraggingOver(true); }}
                       onDragLeave={() => { if (isEditorMode) setIsSecondaryDraggingOver(false); }}
                        onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "secondary"); setIsSecondaryDraggingOver(false); } }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? isSecondaryDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                      >
                        {slottedSecondary ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">{slottedSecondary.category}</span>
                              
                              <h3 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleInlineTextSave(slottedSecondary.id, "headline", e.currentTarget.innerText)}
                                onClick={(e) => { if (isEditorMode && editorSubMode === "Text Editor") e.stopPropagation(); else setSelectedArticle(slottedSecondary); }}
                                className={`font-serif text-lg font-bold text-zinc-100 focus:outline-none rounded ${isEditorMode && editorSubMode === "Text Editor" ? "border border-dashed border-amber-400 bg-zinc-950/40 p-0.5 cursor-text" : "group-hover:text-amber-400"}`}
                              >
                                {slottedSecondary.headline}
                              </h3>
                              <p className="text-[11px] text-zinc-500 font-mono italic">By {slottedSecondary.byline}</p>
                            </div>
                            <button onClick={() => setSelectedArticle(slottedSecondary)} className="text-[11px] text-zinc-300 font-bold flex items-center gap-1">Open Story &rarr;</button>
                          </div>
                        ) : (
                          /* SECONDARY FALLBACK LAYER */
                          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[140px] border-2 border-dashed border-zinc-800 bg-zinc-950/35 rounded-xl">
                            <Newspaper className="h-6 w-6 text-zinc-700 mb-1" />
                            <h4 className="font-mono text-[10px] uppercase font-bold text-amber-500 tracking-wider">Slot 2 (Secondary)</h4>
                            <p className="text-[10px] font-mono text-zinc-500 max-w-xs leading-snug">
                              EMPTY SECONDARY FEATURE - Drag a supporting story card here.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* POSITION 3: SUB-FEATURE TRACK COMPONENT */}
                      <div 
                        onDragOver={(e) => { e.preventDefault(); if (isEditorMode) setIsSubFeatureDraggingOver(true); }}
                        onDragLeave={() => { if (isEditorMode) setIsSubFeatureDraggingOver(false); }}
                        onDrop={(e) => { if (isEditorMode) { handleSlotDrop(e, "subFeature"); setIsSubFeatureDraggingOver(false); } }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between border ${isEditorMode && editorSubMode === "Layout Designer" ? isSubFeatureDraggingOver ? "border-4 border-dashed border-amber-400 bg-amber-400/5" : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60" : "bg-zinc-900 border-zinc-800"}`}
                      >
                        {slottedSubFeature ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono bg-sky-400/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 inline-block">{slottedSubFeature.category}</span>
                              
                              <h3 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleInlineTextSave(slottedSubFeature.id, "headline", e.currentTarget.innerText)}
                                onClick={(e) => { if (isEditorMode && editorSubMode === "Text Editor") e.stopPropagation(); else setSelectedArticle(slottedSubFeature); }}
                                className={`font-serif text-md font-extrabold text-zinc-200 line-clamp-2 focus:outline-none rounded ${isEditorMode && editorSubMode === "Text Editor" ? "border border-dashed border-amber-400 bg-zinc-950/40 p-0.5 cursor-text" : "group-hover:text-amber-400"}`}
                              >
                                {slottedSubFeature.headline}
                              </h3>
                            </div>
                            <button onClick={() => setSelectedArticle(slottedSubFeature)} className="text-[10px] text-zinc-400 flex items-center gap-1">Explore Report &rarr;</button>
                          </div>
                        ) : (
                          /* SUB-FEATURE FALLBACK CARD */
                          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[140px] border-2 border-dashed border-zinc-800 bg-zinc-950/35 rounded-xl">
                            <BookOpen className="h-6 w-6 text-zinc-700 mb-1" />
                            <h4 className="font-mono text-[10px] uppercase font-bold text-amber-500 tracking-wider">Slot 3 (Sub-Feature)</h4>
                            <p className="text-[10px] font-mono text-zinc-500 max-w-xs leading-snug">
                              EMPTY SUB-FEATURE GRID - Drop an article card here to format.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </section>

                {/* VISUAL NEWSSTAND MAIN GENERAL ARCHIVE RENDER */}
                <section className="space-y-4 text-left">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-end">
                    <h3 className="font-serif text-md font-bold text-zinc-200 uppercase tracking-widest">Index Circulation Feed</h3>
                    <span className="text-[10px] font-mono text-zinc-500">{displayedFeedArticles.length} tracks cataloged</span>
                  </div>
                  {displayedFeedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="editorial-main-articles-grid">
                      {displayedFeedArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} onReadMore={setSelectedArticle} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 bg-zinc-900/40 border border-dashed border-zinc-800 text-center rounded-xl p-4 text-zinc-500 font-serif text-xs italic">No secondary entries match filter sections.</div>
                  )}
                </section>
              </div>
            )}

            {/* TAB CONTENT HOOKS B: HISTORICAL MASTER DATA LEDGER GRID */}
            {currentTab === "archive" && (
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 text-left animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2"><Archive className="h-5 w-5 text-amber-400" /> Historical Press Archive Ledger</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setArchiveSortOrder("newest")} className={`px-3 py-1 font-mono text-[10px] uppercase rounded font-bold ${archiveSortOrder === "newest" ? "bg-amber-400 text-zinc-950" : "bg-zinc-950 text-zinc-400"}`}>Newest</button>
                    <button onClick={() => setArchiveSortOrder("oldest")} className={`px-3 py-1 font-mono text-[10px] uppercase rounded font-bold ${archiveSortOrder === "oldest" ? "bg-amber-400 text-zinc-950" : "bg-zinc-950 text-zinc-400"}`}>Historical</button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Query archive database files..." value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300 min-w-[600px] border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Headline Title</th>
                        <th className="py-2.5 px-3">Section</th>
                        <th className="py-2.5 px-3">Reporter</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedAndFilteredArchive().map((art) => (
                        <tr key={art.id} onClick={() => setSelectedArticle(art)} className="border-b border-zinc-850 hover:bg-zinc-950/40 transition cursor-pointer">
                          <td className="py-3 px-3 font-mono text-amber-400">{formatDatePretty(art.date)}</td>
                          <td className="py-3 px-3 font-serif font-bold text-zinc-100">{art.headline}</td>
                          <td className="py-3 px-3"><span className="bg-zinc-800 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300 uppercase">{art.category}</span></td>
                          <td className="py-3 px-3 font-mono text-zinc-400">{art.byline}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end gap-2 items-center">
                              <span className="bg-zinc-850 px-2 py-1 rounded text-[9px] font-mono">Open &rarr;</span>
                              
                              {/* ACTIVE DATA ROW REMOVAL HOOK */}
                              {isEditorMode && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteArticle(art.id); }}
                                  className="p-1.5 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 transition"
                                  title="Permanently remove entry from database 🗑"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </main>

          {/* COLUMN 3: Right Drag Pool Cabinet Workspace Sidebar Panel */}
          {isEditorMode && currentTab === "home" ? (
            <aside className="lg:col-span-3 space-y-6 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850 text-left" id="homepage-editor-storypool">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5"><Layers className="h-4 w-4" /> Story Cabinet Pool</span>
                </div>
                <p className="text-[9px] font-mono text-zinc-400 uppercase leading-snug">Drag stories below into layout wireframes leftward:</p>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {articles.map((article) => {
                    const isHero = pageSlots.heroId === article.id;
                    const isSec = pageSlots.secondaryId === article.id;
                    const isSub = pageSlots.subFeatureId === article.id;
                    const isSlotted = isHero || isSec || isSub;
                    const canDrag = editorSubMode === "Layout Designer";

                    return (
                      <div
                        key={article.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, article.id)}
                        className={`group p-3 border rounded-xl transition text-left ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${isSlotted ? "bg-zinc-900/40 border-amber-400/30 border-dashed" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}
                      >
                        <div className="flex justify-between items-center text-[8px] font-mono uppercase mb-1">
                          <span className="text-zinc-500">{article.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{isHero ? "★ Hero" : isSec ? "★ Secondary" : isSub ? "★ Sub-Feature" : "Available"}</span>
                            
                            {/* CABINET REMOVAL ASSIGNMENT TRIGGER */}
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }} 
                              className="text-zinc-600 hover:text-red-400 p-0.5 transition"
                              title="Delete from archive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-serif text-xs font-bold text-zinc-100 line-clamp-2 leading-tight group-hover:underline">{article.headline}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          ) : null}

        </div>
      </div>

      {/* FOOTER WRAPPER BLOCK PANEL */}
      <footer className="mt-16 bg-zinc-950 text-zinc-200 py-12 border-t border-zinc-900" id="press-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-zinc-900 pb-8">
            <div className="md:col-span-4 space-y-4">
              <span className="font-black uppercase text-white flex items-center gap-2"><Newspaper className="h-6 w-6 text-amber-400" /> THE PLAYPEN PRESS</span>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">A digital news desk and cloud-connected narrative registry managing student coverage, columns, and editorial beats from anywhere.</p>
            </div>
            <div className="md:col-span-4"></div>
            <div className="md:col-span-4 bg-zinc-900 p-5 border border-zinc-800 rounded-2xl text-xs space-y-2">
              <span className="font-mono uppercase text-amber-400 font-bold flex items-center gap-1"><Sparkles className="h-4 w-4" /> AI Advisory Coprocessor Info</span>
              <p className="text-zinc-400 leading-relaxed">System relies on Gemini architectures to formulate draft copy strings and diagnostic read scores. Launch assistant workspace inside locked editor panels.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* DETAILED ARTICLE MODAL VIEWER SYSTEM */}
      <ArticleModal 
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={(id) => setBookmarkedIds(bookmarkedIds.includes(id) ? bookmarkedIds.filter(b => b !== id) : [...bookmarkedIds, id])}
        isEditorMode={isEditorMode}
        editorSubMode={editorSubMode}
        onUpdateArticleText={handleInlineTextSave}
        onUpdateArticleParagraph={(artId, pIdx, val) => {
          setArticles(prev => prev.map(a => {
            if (a.id === artId) {
              const paras = [...a.paragraphs];
              paras[pIdx] = val;
              // Sync change back locally
              return { ...a, paragraphs: paras };
            }
            return a;
          }));
          showToast("Paragraph edit committed locally! ✍️");
        }}
      />

      {/* COMPOSER INSERTION MODAL EXPONENT CARD */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-black text-zinc-100 flex items-center gap-2"><PenTool className="h-5 w-5 text-amber-400" /> Story Composition Framework</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleGeneralSubmitStory} className="space-y-4 overflow-y-auto pr-1 text-xs text-left">
              <input type="text" required placeholder="Story Headline Title..." value={editorFormHeadline} onChange={(e) => setEditorFormHeadline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100" />
              <input type="text" required placeholder="Author Byline..." value={editorFormByline} onChange={(e) => setEditorFormByline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100" />
              <input type="text" placeholder="Subheading Teaser Context Summary..." value={editorFormSubheading} onChange={(e) => setEditorFormSubheading(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100" />
              
              {/* UPLOADER CONTAINER COMPONENT IN MODAL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-zinc-450 font-black">Cover Image Graphics</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-800 bg-zinc-900 hover:bg-zinc-850 rounded-xl cursor-pointer text-center">
                  <Upload className="h-5 w-5 text-zinc-500 mb-1" />
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wide">
                    {editorFormImageUrl ? "✓ Local graphic media attached" : "Upload image file from computer"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadChange} />
                </label>
              </div>

              <textarea required rows={6} placeholder="Type or paste article paragraph strings here..." value={editorFormBodyText} onChange={(e) => setEditorFormBodyText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 font-serif text-zinc-100 leading-relaxed" />
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowPublishModal(false)} className="px-4 py-2 font-mono text-zinc-500 font-bold uppercase">Cancel</button>
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-zinc-950 px-6 py-2 uppercase font-mono font-black tracking-wider">
                  {isEditorMode ? "Publish Live &rarr;" : "Transmit Draft Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITORIAL AI COPROCESSOR DESK LAB */}
      {showAiLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-serif text-md font-black text-white flex items-center gap-1.5"><Sparkles className="h-5 w-5 text-amber-400" /> EDITORIAL AI COPROCESSOR WORKSPACE</span>
              <button onClick={() => setShowAiLab(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto pr-1">
              <div className="md:col-span-5 bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-4 text-xs text-left font-mono">
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-md">
                  {["draft", "proofread", "headlines", "pitches"].map(a => (
                    <button key={a} onClick={() => setAiAction(a as any)} className={`flex-1 py-1 text-[9px] uppercase font-black rounded ${aiAction === a ? "bg-amber-400 text-zinc-950" : "text-zinc-400"}`}>{a}</button>
                  ))}
                </div>
                {aiAction === "draft" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="Draft topic string..." value={draftTopic} onChange={(e) => setDraftTopic(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-100" />
                    <textarea rows={3} placeholder="Key background facts..." value={draftKeyFacts} onChange={(e) => setDraftKeyFacts(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-100" />
                  </div>
                )}
                {aiAction === "proofread" && <textarea rows={5} placeholder="Paste raw story text copy..." value={textToProof} onChange={(e) => setTextToProof(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded font-serif text-zinc-100" />}
                <button onClick={runAiAssistant} disabled={aiLoading} className="w-full bg-amber-400 text-zinc-950 font-black py-2.5 uppercase tracking-wide rounded-lg">{aiLoading ? "Querying Cloud Models..." : "Consult AI Assistant"}</button>
              </div>

              <div className="md:col-span-7 bg-zinc-950 border border-zinc-800 p-4 rounded-xl max-h-[400px] overflow-y-auto text-left text-xs">
                {aiAction === "draft" && aiDraftOutput && (
                  <div className="space-y-2">
                    <button onClick={handleImportAiDraft} className="bg-emerald-500 text-zinc-950 text-[10px] uppercase font-black px-3 py-1 rounded mb-2">Load into Main Composer</button>
                    <h4 className="font-serif font-black text-md text-zinc-100">{aiDraftOutput.headline}</h4>
                    <p className="font-serif text-zinc-300 leading-relaxed text-sm">{aiDraftOutput.paragraphs?.join("\n\n")}</p>
                  </div>
                )}
                {aiAction === "proofread" && aiProofOutput && (
                  <div className="space-y-2">
                    <span className="text-emerald-400 font-mono font-bold uppercase">Readiness Metric Score: {aiProofOutput.overallScore}</span>
                    <p className="font-serif italic text-zinc-300">{aiProofOutput.critique}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE AUTHORIZATION SYSTEM LOCK MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-2xl text-left space-y-4 animate-in zoom-in-95 duration-150">
            <span className="font-serif text-md font-black text-zinc-100 uppercase border-b border-zinc-900 pb-2 flex items-center gap-2"><Lock className="h-5 w-5 text-amber-500 animate-pulse" /> Security Authorization Clearance</span>
            <p className="text-xs text-zinc-400 leading-relaxed">Input administrative access credentials to decouple viewer parameters and engage inline editing tools.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === "reaquit") {
                setIsEditorMode(true);
                setUserRole("Editor");
                setShowPasswordModal(false);
                setPasswordInput("");
                showToast("Editorial Privileges Granted! 🗝️");
              } else {
                showToast("Invalid Editorial Credentials.");
              }
            }} className="space-y-4">
              <input type="password" required placeholder="Access code sequence..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 font-mono tracking-widest text-xs" />
              <div className="flex justify-end gap-2 text-xs font-mono">
                <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordInput(""); }} className="px-4 text-zinc-500 uppercase font-bold">Abort</button>
                <button type="submit" className="bg-amber-400 text-zinc-950 font-black py-2 px-4 uppercase flex items-center gap-1"><Unlock className="h-3.5 w-3.5" /> Confirm Key</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
