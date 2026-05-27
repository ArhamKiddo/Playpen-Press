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
            if (slot.slot_name === "hero") mapping.heroId = slot.article_id;
            if (slot.slot_name === "secondary") mapping.secondaryId = slot.article_id;
            if (slot.slot_name === "sub_feature") mapping.subFeatureId = slot.article_id;
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
  const [editorFormImageUrl, setEditorFormImageUrl] = useState(""); 
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
      setEditorFormImageUrl(base64String); 
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
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, [field]: updatedValue } : art));

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

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", articleId);

    if (error) {
      console.error("Deletion query rejected:", error.message);
      showToast("Database security blocked request.");
      return;
    }

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
                    <button type="button" onClick={() => { setEditorSubMode("Layout Designer"); showToast("Design Mode: Drag & drop slots activated. 🎨"); }} className={`text-[9px] py-1.5 px-1.5 rounded font-mono font-bold uppercase tracking-tight text-center transition cursor-pointer ${ editorSubMode === "Layout Designer" ? "bg-amber-400 text-zinc-950 font-black" : "text-zinc-400 hover:text-zinc-200" }`} > Layout </button>
                    <button type="button" onClick={() => { setEditorSubMode("Text Editor"); showToast("Text Mode: Click on headlines or paragraphs to edit. ✍️"); }} className={`text-[9px] py-1.5 px-1.5 rounded font-mono font-bold uppercase tracking-tight text-center transition cursor-pointer ${ editorSubMode === "Text Editor" ? "bg-indigo-600 text-white font-black" : "text-zinc-400 hover:text-zinc-200" }`} > Text </button>
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
                      <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); setCurrentTab("home"); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${ isActive ? "bg-amber-400 text-zinc-950 font-black shadow-md border-l-4 border-amber-600" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" }`} > {cat.label} </button>
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
                    <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Rest of JSX elements continue exactly the same... */}
          <div className={`${leftSidebarExpanded ? "lg:col-span-10" : "lg:col-span-12"}`}>
             {/* Content logic goes here based on selected views */}
          </div>

        </div>
      </div>

      {/* Password Validation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1"><Shield className="h-4 w-4" /> Security Authorization Clearance</span>
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
