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
  Upload,
  Edit3
} from "lucide-react";
import MainHeader from "./components/MainHeader";
import ArticleCard from "./components/ArticleCard";
import ArticleModal from "./components/ArticleModal";
import { supabase } from "./supabaseClient";
import { Article, EditorialReview, PitchIdea, HeadlineOption } from "./types";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
  
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    return localStorage.getItem("reaquit-site-title") || "The Playpen Press";
  });
  
  useEffect(() => {
    localStorage.setItem("reaquit-site-title", siteTitle);
  }, [siteTitle]);

  const [isContentDeskOpen, setIsContentDeskOpen] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState<boolean>(true);
  
  // Bookmarks & Anonymous tips
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showAiLab, setShowAiLab] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Archive Tag Editing State
  const [tagEditingArticleId, setTagEditingArticleId] = useState<string | null>(null);
  const [editingArticleCategory, setEditingArticleCategory] = useState<string>("");
  const [editingArticleTags, setEditingArticleTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Toast System
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Core Data Sync Fetching
  const fetchNewspaperData = async () => {
    setLoading(true);
    try {
      const { data: articlesData, error: artError } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (artError) throw artError;
      if (articlesData) {
        setArticles(articlesData.map(art => ({
          id: art.id,
          headline: art.title || art.headline,
          subheading: art.subheading,
          byline: art.byline,
          date: art.date,
          category: art.category,
          paragraphs: art.paragraphs || [],
          imageUrl: art.image_data || art.imageUrl,
          readTime: art.read_time || art.readTime,
          tags: art.tags || [art.category]
        })));
      }
    } catch (err: any) {
      console.error("Supabase Synchronization Error:", err.message);
      showToast("Error connecting to database infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewspaperData();
  }, []);

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

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Composer Form States with managed Tags list
  const [editorFormHeadline, setEditorFormHeadline] = useState("");
  const [editorFormByline, setEditorFormByline] = useState("");
  const [editorFormSubheading, setEditorFormSubheading] = useState("");
  const [editorFormCategory, setEditorFormCategory] = useState("Campus Life (Opinions)");
  const [editorFormBodyText, setEditorFormBodyText] = useState("");
  const [editorFormImageUrl, setEditorFormImageUrl] = useState(""); 
  const [editorFormDate, setEditorFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editorFormTags, setEditorFormTags] = useState<string[]>(["Featured"]);
  const [composerTagInput, setComposerTagInput] = useState("");

  // Category sorting state on Archive Page
  const [archiveSortOrder, setArchiveSortOrder] = useState<"newest" | "oldest">("newest");
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

  const availableCategories = [
    "Campus Life (Opinions)",
    "Phantoms Sports",
    "Studies",
    "Events and Clubs"
  ];

  // Pretty Date Parser Formatter
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
      setEditorFormImageUrl(reader.result as string);
      showToast("Local illustrative asset uploaded and packed! 📸");
    };
    reader.readAsDataURL(file);
  };

  // Inline Click Editor Field Loss Save Interceptor
  const handleInlineTextSave = async (articleId: string, field: "headline" | "subheading" | "byline", updatedValue: string) => {
    setArticles(prev => prev.map(art => String(art.id) === String(articleId) ? { ...art, [field]: updatedValue } : art));
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

    setArticles(prev => prev.filter(art => String(art.id) !== String(articleId)));
    showToast("Article permanently deleted from entire server! 🗑️");
  };

  // Check and Toggle Front Page Tag with 3 slots max rule validation
  const validateAndToggleFrontPageTag = (currentTags: string[], targetArticleId?: string): string[] => {
    const hasFrontPage = currentTags.includes("Front Page");
    if (hasFrontPage) {
      return currentTags.filter(t => t !== "Front Page");
    } else {
      // Validate how many overall articles currently hold the front page tag
      const overallFrontPageCount = articles.filter(a => String(a.id) !== String(targetArticleId) && a.tags?.includes("Front Page")).length;
      if (overallFrontPageCount >= 3) {
        alert("Action Restricted: Only 3 articles can hold the 'Front Page' tag simultaneously. Please remove it from an existing article first.");
        return currentTags;
      }
      return [...currentTags, "Front Page"];
    }
  };

  // Save tags/category changes from the Archive Editor view
  const handleSaveArticleTagsAndCategory = async (articleId: string) => {
    setArticles(prev => prev.map(art => 
      String(art.id) === String(articleId) 
        ? { ...art, category: editingArticleCategory, tags: editingArticleTags } 
        : art
    ));

    const { error } = await supabase
      .from("articles")
      .update({
        category: editingArticleCategory,
        tags: editingArticleTags
      })
      .eq("id", articleId);

    if (error) {
      console.error("Failed to commit tags/category adjustments:", error.message);
      showToast("Database synchronization issue.");
    } else {
      showToast("Article tags and section classification updated successfully! 🏷️");
      setTagEditingArticleId(null);
    }
  };

  // Publishing Composer Form Insertion
  const handleGeneralSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorFormHeadline.trim() || !editorFormBodyText.trim() || !editorFormByline.trim()) {
      alert("Please specify Headline, Author, and Body Narrative.");
      return;
    }

    // Double check Front Page count validation for new entries
    if (editorFormTags.includes("Front Page")) {
      const overallFrontPageCount = articles.filter(a => a.tags?.includes("Front Page")).length;
      if (overallFrontPageCount >= 3) {
        alert("Action Restricted: Only 3 articles can hold the 'Front Page' tag simultaneously. 'Front Page' tag removed from this submission. Please adjust tags later.");
        setEditorFormTags(prev => prev.filter(t => t !== "Front Page"));
        return;
      }
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

    // Reset Form Fields
    setEditorFormHeadline("");
    setEditorFormSubheading("");
    setEditorFormByline("");
    setEditorFormBodyText("");
    setEditorFormImageUrl("");
    setEditorFormTags(["Featured"]);
    setShowPublishModal(false);
  };

  // AI Coprocessor trigger hooks
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
    } finaly {
      setAiLoading(false);
    }
  };

  const handleImportAiDraft = () => {
    if (!aiDraftOutput) return;
    setEditorFormHeadline(aiDraftOutput.headline);
    setEditorFormSubheading("");
    setEditorFormByline("Playpen Press correspondent");
    setEditorFormBodyText(aiDraftOutput.paragraphs.join("\n\n"));
    setEditorFormCategory(draftSection);
    setEditorFormTags([draftSection, "Featured"]);
    setShowAiLab(false);
    setShowPublishModal(true);
  };

  // Compute Filtered and Sorted Archive List
  const getSortedAndFilteredArchive = () => {
    return (articles || []).filter(article => {
        if (!article) return false;
        const headlineStr = article.headline || "";
        const bylineStr = article.byline || "";
        const categoryStr = article.category || "";
        const searchStr = archiveSearch ? archiveSearch.toLowerCase() : "";

        return headlineStr.toLowerCase().includes(searchStr) ||
               bylineStr.toLowerCase().includes(searchStr) ||
               categoryStr.toLowerCase().includes(searchStr);
    }).sort((a, b) => {
        const timeA = Date.parse(a.date || "") || 0;
        const timeB = Date.parse(b.date || "") || 0;
        return archiveSortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  };

  // Derive Front Page Slots purely from tags query containing "Front Page" (Exactly max 3 slots)
  const frontPageArticles = (articles || []).filter(art => art.tags?.includes("Front Page")).slice(0, 3);
  const frontPageIds = frontPageArticles.map(a => String(a.id));

  // Compute feed items excluding the front page pinned ones
  const displayedFeedArticles = (articles || []).filter(art => {
    if (!art) return false;
    if (frontPageIds.includes(String(art.id))) return false;

    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory || art.tags?.includes(selectedCategory);
    const searchStr = searchQuery ? searchQuery.toLowerCase() : "";
    const matchesSearch = (art.headline || "").toLowerCase().includes(searchStr) || (art.byline || "").toLowerCase().includes(searchStr);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 theme-parent ${theme === "purple-cream" ? "theme-purple-cream" : "theme-purple-grey"}`} id="bento-editorial-root">
      
      {/* Toast Engine Popups */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-zinc-900 px-5 py-3 shadow-2xl animate-bounce" id="action-toast">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></div>
          <span className="text-xs font-bold font-mono text-zinc-100">{toastMsg}</span>
        </div>
      )}

      {/* Main Corporate Navigation Header Panel */}
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
            showToast("Switched Mode to: Reader View");
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
        editorSubMode="Text Editor"
        isEditorMode={isEditorMode}
      />

      {/* TWO-COLUMN REVITALIZED GRID MASTER CANVAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* NAVIGATION SECTIONS SIDEBAR COLUMN */}
          {leftSidebarExpanded && (
            <aside className="lg:col-span-3 space-y-6">
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
                    { key: "Campus Life (Opinions)", label: "💭 Campus Life" },
                    { key: "Phantoms Sports", label: "🏈 Phantoms Sports" },
                    { key: "Studies", label: "📚 Studies" },
                    { key: "Events and Clubs", label: "🏡 Events & Clubs" }
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

              {/* Color Layout Theme Palette Swapper */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
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

              {/* Executive Credentials Keycard Gate */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" /> Executive Access
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditorMode) {
                      setIsEditorMode(false);
                      setUserRole("Viewer");
                      showToast("Editor Desk Locked.");
                    } else {
                      setShowPasswordModal(true);
                    }
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isEditorMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-sm" : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-black">
                    {isEditorMode ? <><Unlock className="h-4 w-4 text-emerald-400" /> Editor Desk Active</> : <><Lock className="h-4 w-4 text-zinc-500" /> Unlock Desk</>}
                  </span>
                  {isEditorMode && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                </button>
              </div>
            </aside>
          )}

          {/* MASTER CONTENT PREVIEW HUB */}
          <main className={`space-y-8 ${leftSidebarExpanded ? "lg:col-span-9" : "lg:col-span-12"}`}>
            
            {loading && (
              <div className="flex items-center justify-center py-6 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs gap-3">
                <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                Synchronizing with cloud press registries...
              </div>
            )}

            {/* REVITALIZED STAFF COMPOSER HQ BOX */}
            {isEditorMode && (
              <section className="bg-zinc-900 border-2 border-amber-400/80 rounded-2xl shadow-xl overflow-hidden">
                <button type="button" onClick={() => setIsContentDeskOpen(!isContentDeskOpen)} className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-zinc-900 hover:bg-zinc-850 transition text-left gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-amber-400" />
                    <div>
                      <h2 className="font-serif text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                        Staff HQ &amp; Editorial Desk
                        <span className="text-[10px] font-mono bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-sm">
                          {isContentDeskOpen ? "Minimize Panel" : "Expand Content Panel"}
                        </span>
                      </h2>
                    </div>
                  </div>
                  <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg text-xs font-mono">
                    <span className="font-extrabold text-amber-400">{pendingReviews.length} stories in submission review</span>
                  </div>
                </button>

                {isContentDeskOpen && (
                  <div className="p-6 border-t border-zinc-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* SUB SECTION A: INBOX QUEUE ACCUMULATOR */}
                      <div className="bg-zinc-950 p-4 border border-zinc-805 rounded-xl space-y-3">
                        <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1"><Inbox className="h-4 w-4" /> Submission Queue</span>
                        {pendingReviews.length > 0 ? (
                          <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            {pendingReviews.map((sub) => (
                              <div key={sub.id} className="p-3 rounded-lg border text-left bg-zinc-900 border-zinc-800">
                                <h4 className="font-serif text-sm font-bold text-zinc-200 line-clamp-1">{sub.headline}</h4>
                                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{sub.paragraphs[0]}</p>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setEditorFormHeadline(sub.headline);
                                    setEditorFormSubheading(sub.subheading || "");
                                    setEditorFormByline(sub.byline);
                                    setEditorFormBodyText(sub.paragraphs.join("\n\n"));
                                    setEditorFormCategory(sub.category);
                                    setEditorFormTags(sub.tags || ["Featured"]);
                                    setPendingReviews(prev => prev.filter(p => p.id !== sub.id));
                                    showToast("Loaded entry into live workspace composer!");
                                  }} 
                                  className="mt-3 bg-amber-400 text-zinc-900 font-mono text-[9px] font-black uppercase px-2.5 py-1.5 rounded-sm"
                                >
                                  Load To Workspace &rarr;
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-serif text-zinc-500 italic text-center py-6">All public submission records cleared.</p>
                        )}
                      </div>

                      {/* SUB SECTION B: LIVE COMPOSER UNIT */}
                      <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4">
                        <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1"><Layout className="h-4 w-4" /> Workspace Live Composer</span>
                        <form onSubmit={handleGeneralSubmitStory} className="space-y-3 text-xs text-left">
                          <input type="text" required placeholder="Story Title Headline..." value={editorFormHeadline} onChange={(e) => setEditorFormHeadline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 rounded" />
                          <input type="text" required placeholder="Author Byline..." value={editorFormByline} onChange={(e) => setEditorFormByline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 rounded" />
                          <input type="text" placeholder="Supporting Subheading Teaser text..." value={editorFormSubheading} onChange={(e) => setEditorFormSubheading(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 rounded" />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-bold">Primary Classification Section</label>
                              <select value={editorFormCategory} onChange={(e) => setEditorFormCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 rounded">
                                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-bold">Quick Cover Image File</label>
                              <label className="flex items-center justify-center h-9 border border-zinc-800 bg-zinc-900 rounded cursor-pointer text-center hover:bg-zinc-850 transition">
                                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-tight line-clamp-1 px-2">
                                  {editorFormImageUrl ? "✓ Staged" : "Choose Image File"}
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadChange} />
                              </label>
                            </div>
                          </div>

                          {/* MASTER TAGS MANAGEMENT FIELD UNIT */}
                          <div className="bg-zinc-900 p-2.5 border border-zinc-800 rounded space-y-2">
                            <label className="block text-[10px] uppercase font-mono text-amber-400 font-bold">Manage Article Indexing Tags</label>
                            
                            <div className="flex flex-wrap gap-1">
                              {editorFormTags.map(t => (
                                <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${t === 'Front Page' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-200'}`}>
                                  {t}
                                  <button type="button" onClick={() => setEditorFormTags(prev => prev.filter(tag => tag !== t))} className="hover:text-red-400 font-black text-[9px] ml-1">×</button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Add custom tag string..." 
                                value={composerTagInput} 
                                onChange={(e) => setComposerTagInput(e.target.value)} 
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (composerTagInput.trim() && !editorFormTags.includes(composerTagInput.trim())) {
                                      setEditorFormTags([...editorFormTags, composerTagInput.trim()]);
                                      setComposerTagInput("");
                                    }
                                  }
                                }}
                                className="flex-1 bg-zinc-950 border border-zinc-800 p-1 px-2 text-zinc-200 rounded text-[11px]" 
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (composerTagInput.trim() && !editorFormTags.includes(composerTagInput.trim())) {
                                    setEditorFormTags([...editorFormTags, composerTagInput.trim()]);
                                    setComposerTagInput("");
                                  }
                                }} 
                                className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded font-mono font-bold text-[10px] text-zinc-200"
                              >
                                Add
                              </button>
                            </div>

                            <div className="pt-1 flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = validateAndToggleFrontPageTag(editorFormTags);
                                  setEditorFormTags(updated);
                                }}
                                className={`text-[10px] font-mono px-2 py-1 rounded border transition ${editorFormTags.includes("Front Page") ? "bg-amber-400 text-zinc-950 border-amber-500 font-bold" : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"}`}
                              >
                                {editorFormTags.includes("Front Page") ? "★ Front Page Pinned" : "☆ Pin to Front Page"}
                              </button>
                            </div>
                          </div>

                          <textarea rows={4} required placeholder="Compose full narrative content copy blocks..." value={editorFormBodyText} onChange={(e) => setEditorFormBodyText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 font-serif rounded" />
                          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono font-black py-2.5 uppercase tracking-wider rounded">Publish Live to Circulation &rarr;</button>
                        </form>
                      </div>

                    </div>
                  </div>
                )}
              </section>
            )}

            {/* TAB PANELS A: REVITALIZED HOME PORTAL PREVIEW */}
            {currentTab === "home" && (
              <div className="space-y-10 animate-in fade-in duration-200">
                
                {/* BRAND NEW REVITALIZED FRONT PAGE 3-SLOT GRID HOOKS */}
                <section className="space-y-4 text-left">
                  <div className="border-b-2 border-double border-zinc-800 pb-1.5">
                    <h2 className="font-title text-4xl font-normal text-zinc-100 tracking-wide uppercase text-center md:text-left flex items-center gap-2 justify-center md:justify-start">
                      <Sparkles className="h-6 w-6 text-amber-400" /> Marquee Front Page Columns
                    </h2>
                    <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest text-center md:text-left mt-0.5">Top stories curated dynamically via index parameters</p>
                  </div>

                  {frontPageArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {frontPageArticles.map((article, index) => (
                        <div 
                          key={article.id} 
                          className={`bg-zinc-900 border rounded-2xl overflow-hidden p-5 flex flex-col justify-between transition group hover:border-amber-400/40 relative ${
                            index === 0 ? "md:border-r-2 border-zinc-800" : ""
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                                {article.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-0.5">
                                ★ Front Slot {index + 1}
                              </span>
                            </div>

                            {/* Text editable hooks inside front slots if editor role triggers active */}
                            <h3 
                              contentEditable={isEditorMode}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleInlineTextSave(article.id, "headline", e.currentTarget.innerText)}
                              onClick={(e) => { if (isEditorMode) e.stopPropagation(); else setSelectedArticle(article); }}
                              className={`font-serif text-xl font-black text-zinc-100 leading-tight focus:outline-none rounded transition ${isEditorMode ? "border border-dashed border-amber-400/70 bg-zinc-950/50 p-1 cursor-text" : "group-hover:text-amber-400 cursor-pointer"}`}
                            >
                              {article.headline}
                            </h3>

                            <p 
                              contentEditable={isEditorMode}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleInlineTextSave(article.id, "subheading", e.currentTarget.innerText)}
                              onClick={(e) => { if (isEditorMode) e.stopPropagation(); }}
                              className={`text-xs text-zinc-400 font-sans leading-relaxed focus:outline-none rounded ${isEditorMode ? "border border-dashed border-amber-400/50 bg-zinc-950/40 p-1 cursor-text" : ""}`}
                            >
                              {article.subheading || "No accompanying description text context specified."}
                            </p>

                            {article.imageUrl && (
                              <div className="overflow-hidden rounded-xl h-40 border border-zinc-800/80 my-2 shadow-inner">
                                <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Column asset" />
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                            <span className="truncate max-w-[140px]">By {article.byline}</span>
                            <button onClick={() => setSelectedArticle(article)} className="text-amber-400 font-bold hover:underline shrink-0">Open Column &rarr;</button>
                          </div>
                        </div>
                      ))}

                      {/* Display dummy layouts if fewer than 3 are pinned */}
                      {Array.from({ length: 3 - frontPageArticles.length }).map((_, i) => (
                        <div key={i} className="border-2 border-dashed border-zinc-800 bg-zinc-950/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center py-16">
                          <BookOpen className="h-7 w-7 text-zinc-700 mb-2 animate-pulse" />
                          <h4 className="font-mono text-[10px] uppercase font-extrabold text-zinc-500">Front Page Slot {frontPageArticles.length + i + 1} Unassigned</h4>
                          <p className="text-[10px] font-mono text-zinc-600 max-w-[180px] leading-normal mt-1">Go to the Archives tab under Editor mode to toggle the 'Front Page' tag parameter for an article.</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl text-center font-serif italic text-xs text-zinc-500">
                      No front page columns curated. Go into Editor Mode and flag up to 3 articles with the 'Front Page' index tag.
                    </div>
                  )}
                </section>

                {/* GENERAL CIRCULATION REVOLVING FEED LIST */}
                <section className="space-y-4 text-left">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-end">
                    <h3 className="font-serif text-sm font-black text-zinc-300 uppercase tracking-widest">Secondary Circulation Feed</h3>
                    <span className="text-[10px] font-mono text-zinc-500">{displayedFeedArticles.length} matching entries indexed</span>
                  </div>
                  {displayedFeedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="editorial-main-articles-grid">
                      {displayedFeedArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} onReadMore={setSelectedArticle} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 bg-zinc-900/40 border border-dashed border-zinc-800 text-center rounded-xl p-4 text-zinc-500 font-serif text-xs italic">No secondary circulation entries match current classification parameters.</div>
                  )}
                </section>
              </div>
            )}

            {/* TAB PANELS B: REVOLUTIONIZED ARCHIVE RECORD MANAGER LEDGER */}
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
                  <input type="text" placeholder="Query archive ledger documents..." value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300 min-w-[650px] border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Headline Title</th>
                        <th className="py-2.5 px-3">Section &amp; Tags Mapping parameters</th>
                        <th className="py-2.5 px-3">Reporter</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedAndFilteredArchive().map((art) => {
                        const isCurrentlyEditingThis = tagEditingArticleId === art.id;
                        return (
                          <React.Fragment key={art.id}>
                            <tr className="border-b border-zinc-850 hover:bg-zinc-950/40 transition cursor-pointer">
                              <td className="py-3 px-3 font-mono text-amber-400 whitespace-nowrap" onClick={() => setSelectedArticle(art)}>{formatDatePretty(art.date)}</td>
                              <td className="py-3 px-3 font-serif font-bold text-zinc-100 max-w-xs" onClick={() => setSelectedArticle(art)}>{art.headline}</td>
                              <td className="py-3 px-3" onClick={() => setSelectedArticle(art)}>
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="bg-amber-400/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">{art.category}</span>
                                  {(art.tags || []).map((t, idx) => (
                                    <span key={idx} className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${t === 'Front Page' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap" onClick={() => setSelectedArticle(art)}>{art.byline}</td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1.5 items-center">
                                  {isEditorMode && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isCurrentlyEditingThis) {
                                          setTagEditingArticleId(null);
                                        } else {
                                          setTagEditingArticleId(art.id);
                                          setEditingArticleCategory(art.category);
                                          setEditingArticleTags(art.tags || []);
                                        }
                                      }}
                                      className={`p-1.5 rounded border transition ${isCurrentlyEditingThis ? 'bg-amber-400 text-zinc-950 border-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}
                                      title="Modify tags configuration parameters"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  
                                  {isEditorMode && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteArticle(art.id); }}
                                      className="p-1.5 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/30 transition"
                                      title="Permanently remove entry from registry 🗑"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <span onClick={() => setSelectedArticle(art)} className="bg-zinc-850 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono tracking-tight hover:text-white transition">Open &rarr;</span>
                                </div>
                              </td>
                            </tr>

                            {/* COLLAPSIBLE ROW SUB PANEL COMPONENT FOR TAG AND CLASSIFICATION EDITING */}
                            {isEditorMode && isCurrentlyEditingThis && (
                              <tr className="bg-zinc-950/80 border-b border-zinc-800">
                                <td colSpan={5} className="p-4 space-y-4">
                                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 max-w-2xl text-left">
                                    <h4 className="font-mono text-[11px] text-amber-400 uppercase font-black tracking-wide flex items-center gap-1">
                                      <Tag className="h-3.5 w-3.5" /> Modify Classification Parameters &amp; Indices
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-bold">Primary Circulation Section</label>
                                        <select 
                                          value={editingArticleCategory} 
                                          onChange={(e) => setEditingArticleCategory(e.target.value)}
                                          className="w-full bg-zinc-950 border border-zinc-800 p-2 text-zinc-200 rounded font-mono"
                                        >
                                          {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1 font-bold">Quick Tag Controls</label>
                                        <div className="pt-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = validateAndToggleFrontPageTag(editingArticleTags, art.id);
                                              setEditingArticleTags(updated);
                                            }}
                                            className={`w-full text-left font-mono text-[10px] px-3 py-2 rounded border transition flex items-center justify-between ${editingArticleTags.includes("Front Page") ? "bg-amber-400 text-zinc-950 border-amber-500 font-bold" : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"}`}
                                          >
                                            <span>{editingArticleTags.includes("Front Page") ? "★ Front Page Curated Column" : "☆ Nominate to Front Page Grid"}</span>
                                            <span className="text-[9px] bg-zinc-900/10 px-1.5 py-0.5 rounded">Max 3</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* DETAILED MANAGE TAGS ACCUMULATOR INTERFACE */}
                                    <div className="space-y-1.5 text-xs">
                                      <label className="block text-[10px] uppercase font-mono text-zinc-400 font-bold">Active Tags Register</label>
                                      <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-2 border border-zinc-800 rounded min-h-[36px]">
                                        {editingArticleTags.length > 0 ? (
                                          editingArticleTags.map(tag => (
                                            <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${tag === 'Front Page' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-300'}`}>
                                              {tag}
                                              <button type="button" onClick={() => setEditingArticleTags(prev => prev.filter(t => t !== tag))} className="text-[10px] font-black hover:text-red-400 ml-1">×</button>
                                            </span>
                                          ))
                                        ) : (
                                          <span className="text-[10px] text-zinc-600 font-mono italic">No indexing tags assigned.</span>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="Type a tag string and hit add..." 
                                          value={newTagInput} 
                                          onChange={(e) => setNewTagInput(e.target.value)} 
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              if (newTagInput.trim() && !editingArticleTags.includes(newTagInput.trim())) {
                                                setEditingArticleTags([...editingArticleTags, newTagInput.trim()]);
                                                setNewTagInput("");
                                              }
                                            }
                                          }}
                                          className="flex-1 bg-zinc-950 border border-zinc-800 p-1.5 px-2.5 text-zinc-200 rounded font-mono text-[11px]" 
                                        />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            if (newTagInput.trim() && !editingArticleTags.includes(newTagInput.trim())) {
                                              setEditingArticleTags([...editingArticleTags, newTagInput.trim()]);
                                              setNewTagInput("");
                                            }
                                          }} 
                                          className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 px-4 rounded font-mono font-bold text-[10px]"
                                        >
                                          Add Tag
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                                      <button type="button" onClick={() => setTagEditingArticleId(null)} className="px-3 py-1.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-400 uppercase font-bold">Cancel</button>
                                      <button type="button" onClick={() => handleSaveArticleTagsAndCategory(art.id)} className="bg-amber-400 text-zinc-950 px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-wide rounded">Save Structural Changes</button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </main>

        </div>
      </div>

      {/* FOOTER WRAPPER */}
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

      {/* ARTICLE CONTENT DETAILED READER VIEW MODAL */}
      <ArticleModal 
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={(id) => setBookmarkedIds(bookmarkedIds.includes(id) ? bookmarkedIds.filter(b => b !== id) : [...bookmarkedIds, id])}
        isEditorMode={isEditorMode}
        editorSubMode="Text Editor"
        onUpdateArticleText={handleInlineTextSave}
        onUpdateArticleParagraph={(artId, pIdx, val) => {
          setArticles(prev => prev.map(a => {
            if (String(a.id) === String(artId)) {
              const paras = [...a.paragraphs];
              paras[pIdx] = val;
              return { ...a, paragraphs: paras };
            }
            return a;
          }));
          showToast("Paragraph edit committed locally! ✍️");
        }}
      />

      {/* COMPOSER MODAL EXPONENT FORM */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-black text-zinc-100 flex items-center gap-2"><PenTool className="h-5 w-5 text-amber-400" /> Story Composition Framework</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleGeneralSubmitStory} className="space-y-4 overflow-y-auto pr-1 text-xs text-left">
              <input type="text" required placeholder="Story Headline Title..." value={editorFormHeadline} onChange={(e) => setEditorFormHeadline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 rounded" />
              <input type="text" required placeholder="Author Byline..." value={editorFormByline} onChange={(e) => setEditorFormByline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 rounded" />
              <input type="text" placeholder="Subheading Teaser Context Summary..." value={editorFormSubheading} onChange={(e) => setEditorFormSubheading(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 rounded" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-bold">Section Category</label>
                  <select value={editorFormCategory} onChange={(e) => setEditorFormCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 rounded">
                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 font-bold">Cover Asset Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-10 border border-dashed border-zinc-800 bg-zinc-900 hover:bg-zinc-850 rounded cursor-pointer text-center">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wide line-clamp-1 px-2">
                      {editorFormImageUrl ? "✓ Local Image Attached" : "Upload Image"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUploadChange} />
                  </label>
                </div>
              </div>

              {/* TAG MODULE INSIDE THE POPUP MODAL COMPOSER */}
              <div className="bg-zinc-900 p-3 border border-zinc-800 rounded space-y-2">
                <label className="block text-[10px] uppercase font-mono text-amber-400 font-bold">Manage Story Index Tags</label>
                
                <div className="flex flex-wrap gap-1">
                  {editorFormTags.map(t => (
                    <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${t === 'Front Page' ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-200'}`}>
                      {t}
                      <button type="button" onClick={() => setEditorFormTags(prev => prev.filter(tag => tag !== t))} className="hover:text-red-400 font-black text-[9px] ml-1">×</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add custom tag string..." 
                    value={composerTagInput} 
                    onChange={(e) => setComposerTagInput(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (composerTagInput.trim() && !editorFormTags.includes(composerTagInput.trim())) {
                          setEditorFormTags([...editorFormTags, composerTagInput.trim()]);
                          setComposerTagInput("");
                        }
                      }
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-1.5 px-2.5 text-zinc-200 rounded text-[11px]" 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (composerTagInput.trim() && !editorFormTags.includes(composerTagInput.trim())) {
                        setEditorFormTags([...editorFormTags, composerTagInput.trim()]);
                        setComposerTagInput("");
                      }
                    }} 
                    className="bg-zinc-800 border border-zinc-700 px-4 rounded font-mono font-bold text-[10px] text-zinc-200"
                  >
                    Add
                  </button>
                </div>

                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = validateAndToggleFrontPageTag(editorFormTags);
                      setEditorFormTags(updated);
                    }}
                    className={`text-[10px] font-mono px-2.5 py-1.5 rounded border transition ${editorFormTags.includes("Front Page") ? "bg-amber-400 text-zinc-950 border-amber-500 font-bold" : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"}`}
                  >
                    {editorFormTags.includes("Front Page") ? "★ Front Page Selected" : "☆ Feature on Front Page Slots"}
                  </button>
                </div>
              </div>

              <textarea required rows={5} placeholder="Type or paste article paragraph narratives here..." value={editorFormBodyText} onChange={(e) => setEditorFormBodyText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-2.5 font-serif text-zinc-100 leading-relaxed rounded" />
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button type="button" onClick={() => setShowPublishModal(false)} className="px-4 py-2 font-mono text-zinc-500 font-bold uppercase">Cancel</button>
                <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-zinc-950 px-6 py-2 uppercase font-mono font-black tracking-wider rounded">
                  {isEditorMode ? "Publish Live &rarr;" : "Transmit Draft Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDITORIAL AI LAB PANEL */}
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

      {/* ACCESS CODE SECURITY LOCK GATEWAY */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-2xl text-left space-y-4 animate-in zoom-in-95 duration-150">
            <span className="font-serif text-md font-black text-zinc-100 uppercase border-b border-zinc-900 pb-2 flex items-center gap-2"><Lock className="h-5 w-5 text-amber-500" /> Security Credentials Key</span>
            <p className="text-xs text-zinc-400 leading-relaxed">Input administrative access credentials to engage creation and classification tools.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === "reaquit") {
                setIsEditorMode(true);
                setUserRole("Editor");
                setShowPasswordModal(false);
                setPasswordInput("");
                showToast("Editorial Privilege Decoupled! 🗝️");
              } else {
                showToast("Invalid Credentials.");
              }
            }} className="space-y-4">
              <input type="password" required placeholder="Access code sequence..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 font-mono tracking-widest text-xs" />
              <div className="flex justify-end gap-2 text-xs font-mono">
                <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordInput(""); }} className="px-4 text-zinc-500 uppercase font-bold">Abort</button>
                <button type="submit" className="bg-amber-400 text-zinc-950 font-black py-2 px-4 uppercase flex items-center gap-1"><Unlock className="h-3.5 w-3.5" /> Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
