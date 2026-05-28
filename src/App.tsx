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
  Database,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import MainHeader from "./components/MainHeader";
import ArticleCard from "./components/ArticleCard";
import ArticleModal from "./components/ArticleModal";
import { INITIAL_ARTICLES } from "./mockData";
import { Article, EditorialReview, PitchIdea, HeadlineOption, GalleryItem } from "./types";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDbInstructions, setShowDbInstructions] = useState<boolean>(false);

  // Initial Fetch inside useEffect hook
  const fetchArticles = async () => {
    if (!isSupabaseConfigured) {
      // Supabase is not configured yet. Let's use initial articles from mockData or localStorage
      const saved = localStorage.getItem("reaquit-articles");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setArticles(parsed);
          // Set page slots from locally tracked front_page_tag
          const hero = parsed.find((a: any) => a.front_page_tag === 'hero');
          const sec = parsed.find((a: any) => a.front_page_tag === 'secondary');
          const sub = parsed.find((a: any) => a.front_page_tag === 'sub_feature');
          setPageSlots({
            heroId: hero ? hero.id : null,
            secondaryId: sec ? sec.id : null,
            subFeatureId: sub ? sub.id : null
          });
          setLoading(false);
          return;
        } catch (e) {}
      }
      // If nothing saved, load from INITIAL_ARTICLES with pre-assigned slots
      const initial = INITIAL_ARTICLES.map((art, index) => {
        let fp_tag: string | null = null;
        if (index === 0) fp_tag = 'hero';
        else if (index === 1) fp_tag = 'secondary';
        else if (index === 2) fp_tag = 'sub_feature';
        return {
          ...art,
          front_page_tag: fp_tag,
          tags: art.tags || [art.category, "Featured"]
        };
      });
      setArticles(initial);
      setPageSlots({
        heroId: initial[0]?.id || null,
        secondaryId: initial[1]?.id || null,
        subFeatureId: initial[2]?.id || null
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase!
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Map data from Supabase DB schema to Article format used by React
        const mappedArticles: Article[] = data.map((item: any) => ({
          id: item.id,
          headline: item.headline,
          subheading: item.subheading || "",
          byline: item.byline || "Anonymous",
          date: item.date || new Date(item.created_at).toLocaleDateString(),
          category: item.main_tag || "Campus",
          isFeatured: item.front_page_tag !== null,
          front_page_tag: item.front_page_tag,
          paragraphs: item.content ? item.content.split('\n\n').filter((p: string) => p.trim() !== "") : [],
          imageUrl: item.image_url || "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=1200",
          readTime: item.read_time || "3 min read",
          tags: [item.main_tag || "Campus"],
          additionalImages: item.additional_images ? item.additional_images.split('||||').filter(Boolean) : []
        }));

        setArticles(mappedArticles);

        // Compute pageSlots state based on database front_page_tag column
        const hero = mappedArticles.find(a => a.front_page_tag === "hero")?.id || null;
        const secondary = mappedArticles.find(a => a.front_page_tag === "secondary")?.id || null;
        const sub_feature = mappedArticles.find(a => a.front_page_tag === "sub_feature")?.id || null;
        
        setPageSlots({
          heroId: hero,
          secondaryId: secondary,
          subFeatureId: sub_feature
        });
      } else {
        // Table is empty! Seed initial articles to Supabase to make it awesome for the user
        await seedSupabaseWithInitialArticles();
      }
    } catch (err: any) {
      console.error("Error loading articles from Supabase: ", err);
      showToast(`Database disconnected: ${err.message || err}. Preloading locally.`);
    } finally {
      setLoading(false);
    }
  };

  const seedSupabaseWithInitialArticles = async () => {
    if (!supabase) return;
    try {
      const seedData = INITIAL_ARTICLES.map((art, idx) => {
        let fp_tag: string | null = null;
        if (idx === 0) fp_tag = 'hero';
        else if (idx === 1) fp_tag = 'secondary';
        else if (idx === 2) fp_tag = 'sub_feature';
        
        return {
          headline: art.headline,
          content: art.paragraphs.join('\n\n'),
          main_tag: art.category || "Campus Life (Opinions)",
          front_page_tag: fp_tag,
          subheading: art.subheading || "",
          byline: art.byline || "Anonymous",
          image_url: art.imageUrl || "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=1200",
          read_time: art.readTime || "4 min read",
          date: art.date || "May 25, 2026"
        };
      });

      const { error } = await supabase.from('articles').insert(seedData);
      if (error) {
        throw error;
      }
      
      showToast("Seeded Supabase table with articles successfully! 🌱");
      // Fetch again to sync
      const { data: synced } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (synced) {
        const mapped = synced.map((item: any) => ({
          id: item.id,
          headline: item.headline,
          subheading: item.subheading || "",
          byline: item.byline || "Anonymous",
          date: item.date || new Date(item.created_at).toLocaleDateString(),
          category: item.main_tag || "Campus",
          isFeatured: item.front_page_tag !== null,
          front_page_tag: item.front_page_tag,
          paragraphs: item.content ? item.content.split('\n\n').filter((p: string) => p.trim() !== "") : [],
          imageUrl: item.image_url || "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=1200",
          readTime: item.read_time || "3 min read",
          tags: [item.main_tag || "Campus"],
          additionalImages: item.additional_images ? item.additional_images.split('||||').filter(Boolean) : []
        }));
        setArticles(mapped);
        setPageSlots({
          heroId: mapped.find(a => a.front_page_tag === 'hero')?.id || null,
          secondaryId: mapped.find(a => a.front_page_tag === 'secondary')?.id || null,
          subFeatureId: mapped.find(a => a.front_page_tag === 'sub_feature')?.id || null
        });
      }
    } catch (seedErr: any) {
      console.error("Failed to seed initial articles to Supabase", seedErr);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const [currentTab, setCurrentTab] = useState<"home" | "gallery" | "archive">("home");
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

  // Permissions & Dynamic Switching Controls
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

  // Modals & Slidouts
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showAiLab, setShowAiLab] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Core stats sidebar

  // Toast System
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. Reader Submission States (Editor's Review Panel)
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
    },
    {
      id: "pending-2",
      headline: "Alumni Association Commits $80,000 for Phantoms Stadium Rubber Track",
      subheading: "The Division Title victory prompts generous investment to renew degraded stadium gravel fields.",
      byline: "Marcus Vance, Junior Reporter",
      date: "2026-05-25",
      category: "Phantoms Sports",
      paragraphs: [
        "Following our varsity Phantoms' stunning triple-overtime triumph on Friday, the campus Alumni Association met and approved a sweeping stadium renewal grant.",
        "Over $80,000 will be deployed this summer to install professional state-of-the-art synthetic turf and highly durable rubber running lanes, replacing the loose stone setups that have caused athletic strain over the last four academic years."
      ],
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
      readTime: "4 min read",
      tags: ["Sports", "Campus"]
    }
  ]);

  // Inline editor states inside Review Panel
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewHeadline, setEditReviewHeadline] = useState("");
  const [editReviewByline, setEditReviewByline] = useState("");
  const [editReviewCategory, setEditReviewCategory] = useState("Campus Life (Opinions)");
  const [editReviewBodyText, setEditReviewBodyText] = useState("");
  const [editReviewImageUrl, setEditReviewImageUrl] = useState("");
  const [editReviewDate, setEditReviewDate] = useState("");
  const [editReviewTags, setEditReviewTags] = useState<string[]>([]);

  // 2. Editor Exclusive Form States
  const [editorFormHeadline, setEditorFormHeadline] = useState("");
  const [editorFormByline, setEditorFormByline] = useState("");
  const [editorFormSubheading, setEditorFormSubheading] = useState("");
  const [editorFormCategory, setEditorFormCategory] = useState("Campus Life (Opinions)");
  const [editorFormBodyText, setEditorFormBodyText] = useState("");
  const [editorFormImageUrl, setEditorFormImageUrl] = useState("");
  const [editorFormDate, setEditorFormDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Preload today's formatted date
  });
  const [editorFormTags, setEditorFormTags] = useState<string[]>(["Campus Life (Opinions)"]);
  const [editorFormFpTag, setEditorFormFpTag] = useState<"none" | "hero" | "secondary" | "sub_feature">("none");
  const [editorFormAdditionalImages, setEditorFormAdditionalImages] = useState<string[]>([]);

  // Homepage static Front-Page layout slots (Hero, Secondary, Sub-feature)
  const [pageSlots, setPageSlots] = useState<{
    heroId: string | null;
    secondaryId: string | null;
    subFeatureId: string | null;
  }>(() => {
    const saved = localStorage.getItem("reaquit-pageslots");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      heroId: "featured-1",
      secondaryId: "sports-1",
      subFeatureId: "opinion-1"
    };
  });

  useEffect(() => {
    localStorage.setItem("reaquit-pageslots", JSON.stringify(pageSlots));
  }, [pageSlots]);

  // Category sorting state on Archive Page
  const [archiveSortOrder, setArchiveSortOrder] = useState<"newest" | "oldest">("newest");
  const [archiveFilterTags, setArchiveFilterTags] = useState<string[]>([]);
  const [archiveSearch, setArchiveSearch] = useState<string>("");

  // Gallery Exclusive States
  const [customGalleryItems, setCustomGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("reaquit-custom-gallery");
    return saved ? JSON.parse(saved) : [
      {
        id: "gal-1",
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
        caption: "A quiet corner in the campus reading room.",
        takenAt: "2026-05-25, 2:30 PM"
      },
      {
        id: "gal-2",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
        caption: "Wittenberg administration hall silhouette during senior sunset events.",
        takenAt: "2026-05-26, 7:45 PM"
      }
    ];
  });
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<GalleryItem | null>(null);
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryTakenAt, setNewGalleryTakenAt] = useState(() => {
    // Current date and time nicely formatted (e.g., "YYYY-MM-DD, HH:MM AM/PM")
    const d = new Date();
    return d.toLocaleString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  });

  // Effect to sync custom gallery items to localStorage
  useEffect(() => {
    localStorage.setItem("reaquit-custom-gallery", JSON.stringify(customGalleryItems));
  }, [customGalleryItems]);

  const [galleryFilterTab, setGalleryFilterTab] = useState<"all" | "editorial" | "custom">("all");

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

  const [aiDraftOutput, setAiDraftOutput] = useState<{
    headline: string;
    subheading: string;
    byline: string;
    paragraphs: string[];
  } | null>(null);
  const [aiProofOutput, setAiProofOutput] = useState<EditorialReview | null>(null);
  const [aiHeadlinesOutput, setAiHeadlinesOutput] = useState<{ headlines: HeadlineOption[] } | null>(null);
  const [aiPitchesOutput, setAiPitchesOutput] = useState<{ ideas: PitchIdea[] } | null>(null);

  // Pre-seed AI forms on mount
  useEffect(() => {
    if (articles.length > 0) {
      setTextToProof(articles[0].paragraphs.join("\n\n"));
      setDraftHeadlineInput(articles[0].headline);
      setSummaryFactsInput("An ecological article outlining student commitments to lower school district emissions.");
    }
  }, []);

  // Format Helper for Dates
  const formatDatePretty = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    // Check if format is YYYY-MM-DD
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${months[monthIndex]} ${day}, ${year}`;
        }
      }
    }
    return dateStr;
  };

  // Drag and Drop Dragstart helper
  const handleDragStart = (e: React.DragEvent, articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      const storyData = {
        id: article.id,
        headline: article.headline,
        subheading: article.subheading,
        byline: article.byline,
        date: article.date,
        category: article.category,
        paragraphs: article.paragraphs,
        imageUrl: article.imageUrl,
        readTime: article.readTime
      };
      e.dataTransfer.setData("text/plain", JSON.stringify(storyData));
    } else {
      e.dataTransfer.setData("text/plain", articleId);
    }
    e.dataTransfer.effectAllowed = "move";
  };

  // Drag and drop drop handler for layout slots
  const handleSlotDrop = (e: React.DragEvent, slotKey: "hero" | "secondary" | "subFeature") => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData("text/plain");
    if (rawData) {
      let articleId = "";
      let headline = "";
      
      try {
        const parsed = JSON.parse(rawData);
        articleId = parsed.id;
        headline = parsed.headline;
        
        // Ensure this article exists in the main articles state
        const exists = articles.some(a => a.id === articleId);
        if (!exists && articleId) {
          setArticles(prev => [parsed, ...prev]);
        }
      } catch (jsonErr) {
        articleId = rawData;
      }

      if (articleId) {
        setPageSlots(prev => ({
          ...prev,
          [`${slotKey}Id`]: articleId
        }));
        const found = articles.find(a => a.id === articleId) || { headline: headline || articleId };
        showToast(`Linked "${found.headline.slice(0, 30)}..." to Front Page ${slotKey.toUpperCase()} Slot! 🎯`);
      }
    }
  };

  const assignFrontPageTag = async (articleId: string, tag: "hero" | "secondary" | "sub_feature" | null) => {
    if (!isSupabaseConfigured) {
      // Offline mode simulation with local storage
      setArticles(prev => {
        const updated = prev.map(art => {
          if (tag && art.front_page_tag === tag) {
            return { ...art, front_page_tag: null };
          }
          if (art.id === articleId) {
            return { ...art, front_page_tag: tag };
          }
          return art;
        });
        localStorage.setItem("reaquit-articles", JSON.stringify(updated));
        return updated;
      });

      setPageSlots(prev => {
        const updated = { ...prev };
        if (tag === 'hero') {
          updated.heroId = articleId;
          if (updated.secondaryId === articleId) updated.secondaryId = null;
          if (updated.subFeatureId === articleId) updated.subFeatureId = null;
        } else if (tag === 'secondary') {
          updated.secondaryId = articleId;
          if (updated.heroId === articleId) updated.heroId = null;
          if (updated.subFeatureId === articleId) updated.subFeatureId = null;
        } else if (tag === 'sub_feature') {
          updated.subFeatureId = articleId;
          if (updated.heroId === articleId) updated.heroId = null;
          if (updated.secondaryId === articleId) updated.secondaryId = null;
        } else if (tag === null) {
          if (updated.heroId === articleId) updated.heroId = null;
          if (updated.secondaryId === articleId) updated.secondaryId = null;
          if (updated.subFeatureId === articleId) updated.subFeatureId = null;
        }
        return updated;
      });
      showToast(`Local Mode: Assigned "${tag || 'None'}" tag to story!`);
      return;
    }

    setLoading(true);
    try {
      // 1. Locate any existing article with that front page tag, clear its tag to null in Supabase
      if (tag) {
        const { error: clearError } = await supabase!
          .from('articles')
          .update({ front_page_tag: null })
          .eq('front_page_tag', tag);

        if (clearError) throw clearError;
      }

      // 2. Direct assignment of front_page_tag on current article (or null if clearing)
      const { error: updateError } = await supabase!
        .from('articles')
        .update({ front_page_tag: tag })
        .eq('id', articleId);

      if (updateError) throw updateError;

      // 3. Re-fetch all articles to keep layout and details live and synchronized for all readers
      await fetchArticles();
      showToast(`Database synced: "${tag || 'None'}" tag assigned successfully! 🎯`);
    } catch (err: any) {
      console.error("Database alignment transaction error", err);
      showToast(`Sync Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete this article from the entire archive?");
    if (!isConfirmed) return;

    // Remove from articles state
    setArticles(prev => {
      const parsed = prev.filter(art => art.id !== articleId);
      if (!isSupabaseConfigured) {
        localStorage.setItem("reaquit-articles", JSON.stringify(parsed));
      }
      return parsed;
    });

    // Remove from pageSlots if linked
    setPageSlots(prev => {
      const updated = { ...prev };
      if (updated.heroId === articleId) updated.heroId = null;
      if (updated.secondaryId === articleId) updated.secondaryId = null;
      if (updated.subFeatureId === articleId) updated.subFeatureId = null;
      return updated;
    });

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase!
          .from('articles')
          .delete()
          .eq('id', articleId);

        if (error) throw error;
        showToast("Article permanently deleted from Supabase! 🗑=");
        await fetchArticles();
      } catch (err: any) {
        console.error("Supabase delete failure:", err);
        showToast(`Cloud Delete error: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      showToast("Article permanently deleted from entire local archive! 🗑️");
    }
  };

  const handleUpdateArticleText = async (
    articleId: string, 
    field: "headline" | "subheading" | "byline" | "category" | "date" | "imageUrl" | "additionalImages", 
    value: any
  ) => {
    let latestArticles: Article[] = [];
    setArticles(prev => {
      const updated = prev.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            [field]: value
          };
        }
        return art;
      });
      latestArticles = updated;
      localStorage.setItem("reaquit-articles", JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured) {
      try {
        // Map camelCase react parameters to appropriate snake_case Supabase database columns
        let dbField = field as string;
        let dbValue = value;

        if (field === "category") {
          dbField = "main_tag";
        } else if (field === "imageUrl") {
          dbField = "image_url";
        } else if (field === "additionalImages") {
          dbField = "additional_images";
          dbValue = Array.isArray(value) ? value.filter(Boolean).join("||||") : value;
        }

        const { error } = await supabase!
          .from('articles')
          .update({ [dbField]: dbValue })
          .eq('id', articleId);

        if (error) {
          // If the error looks like a missing column for additional_images, warn gracefully
          if (error.message && error.message.includes("column") && error.message.includes("additional_images")) {
            console.warn("The 'additional_images' column was not found. Local offline state was saved. Add it by running SQL alter table script in the Guide!");
            showToast("Saved locally. Add 'additional_images' column in Supabase for full cloud sync!");
          } else {
            throw error;
          }
        } else {
          showToast("Saved to cloud! 💾");
        }
      } catch (err: any) {
        console.error("Supabase update failure:", err);
        showToast(`Unsaved in cloud: ${err.message || err}`);
      }
    } else {
      showToast("Edits saved locally! 💾");
    }
  };

  const handleUpdateArticleParagraph = async (articleId: string, pIndex: number, value: string) => {
    let targetCopy = "";
    setArticles(prev => {
      const updated = prev.map(art => {
        if (art.id === articleId) {
          const updatedParagraphs = [...art.paragraphs];
          updatedParagraphs[pIndex] = value;
          targetCopy = updatedParagraphs.join("\n\n");
          return {
            ...art,
            paragraphs: updatedParagraphs
          };
        }
        return art;
      });
      if (!isSupabaseConfigured) {
        localStorage.setItem("reaquit-articles", JSON.stringify(updated));
      }
      return updated;
    });

    if (isSupabaseConfigured && targetCopy) {
      try {
        const { error } = await supabase!
          .from('articles')
          .update({ content: targetCopy })
          .eq('id', articleId);

        if (error) throw error;
        showToast("Paragraph edits saved to cloud! 💾");
      } catch (err: any) {
        console.error("Supabase paragraph update failing:", err);
        showToast(`Unsaved in cloud: ${err.message || err}`);
      }
    }
  };

  // Reader-or-Editor general submission handler
  const handleGeneralSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorFormHeadline.trim() || !editorFormBodyText.trim() || !editorFormByline.trim()) {
      alert("Please specify Headline, Author, and Body Narrative.");
      return;
    }

    const finalFpTag = editorFormFpTag !== "none" ? editorFormFpTag : null;
    const finalDate = editorFormDate || new Date().toISOString().split('T')[0];
    const finalCategory = editorFormCategory;
    const finalImageUrl = editorFormImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
    const readTimeVal = `${Math.max(1, Math.round(editorFormBodyText.split(/\s+/).length / 200))} min read`;

    if (!isEditorMode) {
      const createdStory: Article = {
        id: "submission-" + Date.now(),
        headline: editorFormHeadline,
        subheading: editorFormSubheading || undefined,
        byline: editorFormByline,
        date: finalDate,
        category: finalCategory,
        paragraphs: editorFormBodyText.split("\n\n").filter(p => p.trim() !== ""),
        imageUrl: finalImageUrl,
        readTime: readTimeVal,
        front_page_tag: null,
        tags: [finalCategory]
      };
      // Reader View submissions must NOT lock out. Add to local Pending array!
      setPendingReviews([createdStory, ...pendingReviews]);
      showToast("Story submitted to Editor's Review Panel! 📬");
    } else {
      if (isSupabaseConfigured) {
        setLoading(true);
        try {
          // If a front page tag is selected, clear any other article possessing that tag first
          if (finalFpTag) {
            const { error: clearErr } = await supabase!
              .from('articles')
              .update({ front_page_tag: null })
              .eq('front_page_tag', finalFpTag);
            if (clearErr) throw clearErr;
          }

          const { error: insertErr } = await supabase!
            .from('articles')
            .insert({
              headline: editorFormHeadline,
              content: editorFormBodyText,
              main_tag: finalCategory,
              front_page_tag: finalFpTag,
              subheading: editorFormSubheading || "",
              byline: editorFormByline,
              image_url: finalImageUrl,
              date: finalDate,
              read_time: readTimeVal,
              additional_images: editorFormAdditionalImages.join("||||")
            });

          if (insertErr) throw insertErr;
          showToast(`"${editorFormHeadline.slice(0, 30)}..." published live onto Supabase Cloud! 📰`);
          await fetchArticles();
        } catch (err: any) {
          console.error("Supabase publish failure:", err);
          showToast(`Cloud Publish failed: ${err.message || err}`);
        } finally {
          setLoading(false);
        }
      } else {
        // Local mode fallback
        const createdStory: Article = {
          id: "submission-" + Date.now(),
          headline: editorFormHeadline,
          subheading: editorFormSubheading || undefined,
          byline: editorFormByline,
          date: finalDate,
          category: finalCategory,
          paragraphs: editorFormBodyText.split("\n\n").filter(p => p.trim() !== ""),
          imageUrl: finalImageUrl,
          readTime: readTimeVal,
          front_page_tag: finalFpTag,
          tags: [finalCategory],
          additionalImages: editorFormAdditionalImages
        };

        setArticles(prev => {
          const cleared = prev.map(art => {
            if (finalFpTag && art.front_page_tag === finalFpTag) {
              return { ...art, front_page_tag: null };
            }
            return art;
          });
          const result = [createdStory, ...cleared];
          localStorage.setItem("reaquit-articles", JSON.stringify(result));
          return result;
        });

        if (finalFpTag) {
          setPageSlots(prev => ({
            ...prev,
            [`${finalFpTag}Id`]: createdStory.id
          }));
        }
        showToast(`"${createdStory.headline.slice(0, 30)}..." published with local cache! 📰`);
      }
    }

    // Reset Submission Form State
    setEditorFormHeadline("");
    setEditorFormSubheading("");
    setEditorFormByline("");
    setEditorFormBodyText("");
    setEditorFormImageUrl("");
    setEditorFormFpTag("none");
    setEditorFormAdditionalImages([]);
    setShowPublishModal(false);
  };

  // Gallery Exclusive Handlers
  const handleAddGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryImageUrl) {
      showToast("Please provide an image link or select a file first 🖼️");
      return;
    }

    const newItem: GalleryItem = {
      id: "gal-" + Date.now(),
      imageUrl: newGalleryImageUrl,
      caption: newGalleryCaption.trim() || undefined,
      takenAt: newGalleryTakenAt,
    };

    setCustomGalleryItems(prev => [newItem, ...prev]);
    setNewGalleryImageUrl("");
    setNewGalleryCaption("");
    // Re-initialize metadata timestamp
    const d = new Date();
    setNewGalleryTakenAt(d.toLocaleString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    }));
    showToast("Photo pinned to the press gallery! 📌");
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewGalleryImageUrl(reader.result);
          showToast("Image file encoded successfully! 📸");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGalleryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to retire this photo from the gallery archive?")) {
      setCustomGalleryItems(prev => prev.filter(item => item.id !== id));
      if (selectedGalleryPhoto?.id === id) {
        setSelectedGalleryPhoto(null);
      }
      showToast("Photo retired from archive.");
    }
  };

  // Add Dynamic Bulletin Alerts
  const [bulletins, setBulletins] = useState([
    { id: 1, title: "Spring Science Carnival", date: "May 29", desc: "Interactive experiments on the central lawn." },
    { id: 2, title: "Winter Formal Polls", date: "June 03", desc: "Vote on theme options in student portal." },
    { id: 3, title: "Drama Club Auditions", date: "June 08", desc: "Casting 'The Crucible' in room 12B." }
  ]);
  const [newBulletinTitle, setNewBulletinTitle] = useState("");
  const [newBulletinDate, setNewBulletinDate] = useState("");

  const handleAddBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulletinTitle.trim() || !newBulletinDate.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newBulletinTitle,
      date: newBulletinDate,
      desc: "Student-submitted campus bulletin circular."
    };
    setBulletins([...bulletins, newItem]);
    setNewBulletinTitle("");
    setNewBulletinDate("");
    showToast("Bulletin alert broadcasted!");
  };

  // Run AI Assistant via API
  const runAiAssistant = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      let payload = {};
      let actionName = "";

      if (aiAction === "draft") {
        if (!draftTopic.trim()) throw new Error("Please specify a topic for the story draft.");
        actionName = "draft-article";
        payload = {
          topic: draftTopic,
          keyFacts: draftKeyFacts,
          articleStyle: draftStyle,
          targetSection: draftSection
        };
      } else if (aiAction === "proofread") {
        if (!textToProof.trim()) throw new Error("Provide draft copy to proofread.");
        actionName = "proofread";
        payload = { articleText: textToProof };
      } else if (aiAction === "headlines") {
        if (!draftHeadlineInput.trim()) throw new Error("Provide a baseline headline or subject.");
        actionName = "headlines";
        payload = {
          draftHeadline: draftHeadlineInput,
          summaryFacts: summaryFactsInput
        };
      } else if (aiAction === "pitches") {
        if (!pitchTheme.trim()) throw new Error("Please insert an overarching pitch theme.");
        actionName = "story-ideas";
        payload = {
          theme: pitchTheme,
          category: pitchCategory
        };
      }

      const response = await fetch("/api/editorial-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName, payload })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (aiAction === "draft") {
        setAiDraftOutput(data);
        showToast("Gemini AI successfully crafted article draft!");
      } else if (aiAction === "proofread") {
        setAiProofOutput(data);
        showToast("Grammar critique and readability diagnostics complete!");
      } else if (aiAction === "headlines") {
        setAiHeadlinesOutput(data);
        showToast("Headline options drafted!");
      } else if (aiAction === "pitches") {
        setAiPitchesOutput(data);
        showToast("Reporting pitches generated!");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to communicate with AI model.");
    } finally {
      setAiLoading(false);
    }
  };

  // Import AI draft straight into publisher
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
    showToast("AI Story copy loaded into Composer! ✍️");
  };

  // Open inline editor inside review queue
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

  // Save edits of pending submission & promote to live articles! (Approve & Publish)
  const handlePublishReviewedSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase!
          .from('articles')
          .insert({
            headline: editReviewHeadline,
            content: editReviewBodyText,
            main_tag: editReviewCategory,
            front_page_tag: null,
            subheading: "Reviewed student submission.",
            byline: editReviewByline,
            image_url: editReviewImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
            date: editReviewDate || new Date().toISOString().split('T')[0],
            read_time: `${Math.max(1, Math.round(editReviewBodyText.split(/\s+/).length / 250))} min read`
          });

        if (error) throw error;
        
        showToast(`"${editReviewHeadline.slice(0, 25)}..." approved & published to cloud! 🎉`);
        await fetchArticles();
        
        // Remove from pending review list
        setPendingReviews(pendingReviews.filter(sub => sub.id !== editingReviewId));
        setEditingReviewId(null);
      } catch (err: any) {
        console.error("Failed to approve & publish submission to Supabase:", err);
        showToast(`Database error: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback
      const updatedPublishedArticle: Article = {
        id: "published-" + Date.now(),
        headline: editReviewHeadline,
        subheading: articles.find(a => a.id === editingReviewId)?.subheading || "Reviewed student submission.",
        byline: editReviewByline,
        date: editReviewDate || new Date().toISOString().split('T')[0],
        category: editReviewCategory,
        paragraphs: editReviewBodyText.split("\n\n").filter(p => p.trim() !== ""),
        imageUrl: editReviewImageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
        readTime: `${Math.max(1, Math.round(editReviewBodyText.split(/\s+/).length / 250))} min read`,
        front_page_tag: null,
        tags: editReviewTags.length > 0 ? editReviewTags : [editReviewCategory]
      };

      setArticles([updatedPublishedArticle, ...articles]);
      setPendingReviews(pendingReviews.filter(sub => sub.id !== editingReviewId));
      setEditingReviewId(null);
      showToast(`"${updatedPublishedArticle.headline.slice(0, 25)}..." approved & published locally!`);
    }
  };

  // Archive Sorting and Filtering Logics
  const getSortedAndFilteredArchive = () => {
    return articles.filter(article => {
      // Filter by search Query
      const matchesSearch = article.headline.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                            article.byline.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                            article.category.toLowerCase().includes(archiveSearch.toLowerCase());
      
      // Filter by tags on archive
      if (archiveFilterTags.length === 0) return matchesSearch;
      
      const articleTags = article.tags || [article.category];
      return matchesSearch && archiveFilterTags.some(t => articleTags.includes(t));
    }).sort((a, b) => {
      const timeA = Date.parse(a.date) || 0;
      const timeB = Date.parse(b.date) || 0;
      return archiveSortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  };

  // Frontpage Slotted Content Setup
  const slottedHero = pageSlots.heroId ? (articles.find(a => a.id === pageSlots.heroId) || null) : null;
  const slottedSecondary = pageSlots.secondaryId ? (articles.find(a => a.id === pageSlots.secondaryId) || null) : null;
  const slottedSubFeature = pageSlots.subFeatureId ? (articles.find(a => a.id === pageSlots.subFeatureId) || null) : null;

  // Rest of articles page feed (filter duplicates mapped in layout slots)
  const currentSlottedIds = [pageSlots.heroId, pageSlots.secondaryId, pageSlots.subFeatureId].filter(Boolean);
  
  const displayedFeedArticles = articles.filter(art => {
    // Exclude featured slotted items to prevent visual duplicates
    const isSlotted = currentSlottedIds.includes(art.id);
    
    // Check Category filter
    const matchesCategory = selectedCategory === "All" || 
                            art.category === selectedCategory || 
                            (art.tags && art.tags.includes(selectedCategory));
                            
    // Check search Query
    const matchesSearch = art.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.paragraphs.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          art.byline.toLowerCase().includes(searchQuery.toLowerCase());

    return !isSlotted && matchesCategory && matchesSearch;
  });

  const availableTags = ["Campus", "Sports", "Opinion", "Science", "Tech", "Arts"];

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-amber-400 selection:text-zinc-950 theme-parent ${theme === "purple-cream" ? "theme-purple-cream" : "theme-purple-grey"}`} id="bento-editorial-root">
      
      {/* Toast Feedback block */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-zinc-900 px-5 py-3 shadow-2xl animate-bounce" id="action-toast">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></div>
          <span className="text-xs font-bold font-mono text-zinc-100">{toastMsg}</span>
        </div>
      )}

      {/* Main Header bar */}
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
          // Auto scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        sidebarExpanded={leftSidebarExpanded}
        setSidebarExpanded={setLeftSidebarExpanded}
        siteTitle={siteTitle}
        setSiteTitle={setSiteTitle}
        editorSubMode={editorSubMode}
        isEditorMode={isEditorMode}
      />

      {/* THREE-COLUMN MASTER EDITORIAL LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Collapsible Left Category Navigation Sidebar */}
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
                        editorSubMode === "Layout Designer"
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "text-zinc-400 hover:text-zinc-200"
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
                        editorSubMode === "Text Editor"
                          ? "bg-indigo-600 text-white font-black"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Text
                    </button>
                  </div>
                  <div className="text-[8.5px] font-mono text-zinc-500 leading-tight">
                    {editorSubMode === "Layout Designer" 
                      ? "Drop cards from Side Desk story pool." 
                      : "Click directly on text blocks to type edit."}
                  </div>
                </div>
              )}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5" /> Newsroom Sections
                  </span>
                  <button 
                    onClick={() => setLeftSidebarExpanded(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono hover:underline uppercase"
                  >
                    Hide
                  </button>
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
                          isActive 
                            ? "bg-amber-400 text-zinc-950 font-black shadow-md border-l-4 border-amber-600" 
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Theme Selector in Sidebar */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3" id="theme-selector-sidebar-card">
                <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Palette className="h-3.5 w-3.5" /> Editorial Theme
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => changeTheme("purple-cream")}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      theme === "purple-cream"
                        ? "bg-purple-100 text-purple-900 border-purple-400 shadow-sm"
                        : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-amber-500" /> Default Cream
                    </span>
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  </button>
                  <button
                    onClick={() => changeTheme("purple-grey")}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      theme === "purple-grey"
                        ? "bg-purple-950 text-purple-200 border-purple-500 shadow-sm"
                        : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5 text-purple-400" /> Twilight Grey
                    </span>
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                  </button>
                </div>
              </div>

              {/* Supabase Database Connection widget */}
              <div className="bg-zinc-900 border border-zinc-805 p-4 rounded-xl space-y-3" id="supabase-status-widget">
                <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center justify-between border-b border-zinc-850 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-amber-400" /> Cloud Sync
                  </span>
                  {isSupabaseConfigured ? (
                    <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 font-mono tracking-tight font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ● Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8px] bg-amber-400/10 text-amber-300 font-mono tracking-tight font-black uppercase px-1.5 py-0.5 rounded border border-amber-400/20">
                      ○ Offline
                    </span>
                  )}
                </span>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`} />
                    <span className="text-[11px] font-mono text-zinc-300 font-bold uppercase tracking-tight">
                      {isSupabaseConfigured ? "Supabase Live Mode" : "Local Mock Storage"}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-450 leading-relaxed">
                    {isSupabaseConfigured 
                      ? "Persistent cloud sync active. Live articles & front page layout placements synchronize across all concurrent public views instantly!"
                      : "Using local fallback storage. Setup environment keys to enable real-time shared front-page layout tagging!"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDbInstructions(!showDbInstructions)}
                  className="w-full text-center text-[10px] font-mono uppercase bg-zinc-950 hover:bg-zinc-850 text-zinc-300 py-1.5 border border-zinc-800 rounded font-bold transition flex items-center justify-center gap-1"
                >
                  {showDbInstructions ? "Hide Cloud Guide ▲" : "Show Setup Guide ▼"}
                </button>

                {showDbInstructions && (
                  <div className="text-[10px] text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-2.5 max-h-[350px] overflow-y-auto leading-relaxed scrollbar-thin">
                    <p className="font-bold text-amber-300 font-mono text-[9px] uppercase border-b border-zinc-850 pb-0.5">
                      ⚡ Step-By-Step Supabase Setup
                    </p>
                    <ol className="list-decimal pl-4.5 space-y-2 text-zinc-300">
                      <li>
                        Create a free account on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300">supabase.com</a>.
                      </li>
                      <li>
                        Create a project named <strong className="text-zinc-100">Playpen Press</strong>.
                      </li>
                      <li>
                        In the left sidebar menu, click <strong className="text-zinc-100">SQL Editor</strong>, then press <strong className="text-zinc-100">"New Query"</strong>.
                      </li>
                      <li>
                        Paste and run this schema code to build the database matches:
                        <pre className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono whitespace-pre-wrap text-emerald-400 select-all mt-1 scrollbar-none overflow-x-hidden">
{`create table articles (
  id uuid default gen_random_uuid() primary key,
  headline text not null,
  content text not null,
  main_tag text not null default 'Campus',
  front_page_tag text,
  subheading text,
  byline text,
  image_url text,
  read_time text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active access RLS policy
alter table articles enable row level security;
create policy "Allow all public reads & writes" on articles for all using (true) with check (true);`}
                        </pre>
                      </li>
                      <li>
                        Go to <strong className="text-zinc-100">Project Settings &rarr; API</strong>.
                      </li>
                      <li>
                        Copy your <code className="text-amber-300">Project URL</code> and <code className="text-amber-300">anon public key</code>.
                      </li>
                      <li>
                        Apply these keys inside your workspace's <code className="text-amber-300">.env</code> file:
                        <pre className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-350 select-all mt-1">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                        </pre>
                      </li>
                    </ol>
                    <p className="text-[9px] text-zinc-500 italic mt-1 font-serif">
                      * Once the server restarts, your app will automatically shift dynamically from local storage mode into real-time cloud data mode!
                    </p>
                  </div>
                )}
              </div>

              {/* Mini Info Card in column */}
              <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl text-center space-y-2">
                <span className="text-[10px] font-mono text-zinc-550 block font-bold uppercase tracking-widest">PINEY DISPATCH</span>
                <p className="text-[11px] text-zinc-400 font-serif italic">
                  "Sourcing original investigate beats, providing unfiltered campus accounts since 1982."
                </p>
              </div>

              {/* Enable Editor in Sidebar - at the absolute bottom */}
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
                    isEditorMode
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-sm"
                      : "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200"
                  }`}
                  id="enable-editor-sidebar-btn"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-black">
                    {isEditorMode ? (
                      <>
                        <Unlock className="h-4 w-4 text-emerald-400" /> Editor Active
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-zinc-500" /> Enable Editor
                      </>
                    )}
                  </span>
                  {isEditorMode && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </button>
              </div>
            </aside>
          )}

          {/* MAIN COLUMN (COLUMN 2 of 3) - Sized dynamically based on right sidebar and left sidebar expansion */}
          <main className={`
            space-y-8
            ${isEditorMode && currentTab === "home" 
              ? leftSidebarExpanded ? "lg:col-span-7" : "lg:col-span-9" 
              : leftSidebarExpanded ? "lg:col-span-10" : "lg:col-span-12"}
          `}>

            {isEditorMode && !leftSidebarExpanded && (
              <div className="bg-zinc-900 border-2 border-amber-400 p-2 text-xs flex items-center justify-between rounded-xl shadow-lg font-mono" id="main-column-editor-bar">
                <span className="text-zinc-300 flex items-center gap-1.5 uppercase font-black text-[10px] tracking-wider pl-2">
                  <Sliders className="h-4 w-4 text-amber-400 animate-pulse" /> Active Sub-Mode:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditorSubMode("Layout Designer");
                      showToast("Design Mode: Drag & drop elements enabled. 📐");
                    }}
                    className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition cursor-pointer ${
                      editorSubMode === "Layout Designer"
                        ? "bg-amber-400 text-zinc-950 font-black"
                        : "text-zinc-400 bg-zinc-950 hover:bg-zinc-800"
                    }`}
                  >
                    Layout Designer 📐
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditorSubMode("Text Editor");
                      showToast("Text Mode: Click on headlines or paragraphs to edit. ✍️");
                    }}
                    className={`px-3 py-1.5 rounded text-[10px] font-black uppercase transition cursor-pointer ${
                      editorSubMode === "Text Editor"
                        ? "bg-indigo-600 text-white font-black"
                        : "text-zinc-400 bg-zinc-950 hover:bg-zinc-805"
                    }`}
                  >
                    Text Editor ✍️
                  </button>
                </div>
              </div>
            )}

            {/* INTEGRATED CMS DESK PORTAL - Visible only in Editor View with Collapsible Drawer */}
            {isEditorMode && (
              <section className="bg-zinc-900 border-2 border-amber-400/80 rounded-2xl shadow-xl overflow-hidden" id="editor-cms-control-panel">
                {/* Collapsible Header */}
                <button
                  type="button"
                  onClick={() => setIsContentDeskOpen(!isContentDeskOpen)}
                  className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-zinc-900 hover:bg-zinc-850 transition text-left gap-4 focus:outline-none"
                  id="toggle-content-desk-btn"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-amber-400 fill-amber-300/10" />
                    <div>
                      <h2 className="font-serif text-lg font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                        Staff HQ &amp; Editorial Desk
                        <span className="text-[10px] font-mono bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-sm uppercase font-black">
                          {isContentDeskOpen ? "Open" : "Minimized (Open Content Desk)"}
                        </span>
                      </h2>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">Click to toggling Drawer controls</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg">
                      <span className="text-zinc-550 uppercase text-[9px] block">Reviews Pending</span>
                      <span className="font-extrabold text-amber-400">{pendingReviews.length} stories</span>
                    </div>
                    <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-lg">
                      <span className="text-zinc-550 uppercase text-[9px] block">Live Broadcasts</span>
                      <span className="font-extrabold text-emerald-400">{articles.length} posts</span>
                    </div>
                    <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-450">
                      {isContentDeskOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {isContentDeskOpen && (
                  <div className="p-6 border-t border-zinc-800 space-y-6">
                    {/* Submitting CMS Panel tabs - Editor Custom post Form & review panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* CMS PART A: EDITOR'S REVIEW PANEL (Pending Reader Submissions) */}
                      <div className="bg-zinc-950 p-4 border border-zinc-805 rounded-xl space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                          <Inbox className="h-4 w-4 text-amber-400" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
                            Editor's Review Panel ({pendingReviews.length})
                          </h3>
                        </div>

                        {pendingReviews.length > 0 ? (
                          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                            {pendingReviews.map((sub) => (
                              <div 
                                key={sub.id} 
                                className={`p-3 rounded-lg border text-left transition ${
                                  editingReviewId === sub.id 
                                    ? "bg-amber-400/10 border-amber-400" 
                                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-705"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-1">
                                  <span className="bg-zinc-800 text-zinc-350 px-1.5 py-0.2 rounded-sm font-bold">
                                    {sub.category}
                                  </span>
                                  <span className="text-zinc-500">
                                    Submitted {formatDatePretty(sub.date)}
                                  </span>
                                </div>
                                <h4 className="font-serif text-sm font-bold text-zinc-200 line-clamp-1 mb-1">
                                  {sub.headline}
                                </h4>
                                <p className="text-[10px] text-zinc-400 mb-2 font-mono italic">
                                  By {sub.byline}
                                </p>
                                
                                {editingReviewId !== sub.id ? (
                                  <button
                                    onClick={() => handleStartReviewEdit(sub)}
                                    className="bg-amber-400 text-zinc-900 font-mono text-[9px] font-black uppercase px-2.5 py-1.5 rounded-sm hover:bg-amber-300 transition"
                                  >
                                    Edit Copy &amp; Publish  &rarr;
                                  </button>
                                ) : (
                                  <span className="text-[9px] font-mono text-amber-400 font-black uppercase flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 animate-spin" /> Editing below...
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-center bg-zinc-900/50 border border-dashed border-zinc-850">
                            <Inbox className="h-6 w-6 text-zinc-650 mb-1" />
                            <p className="text-[11px] font-serif italic text-zinc-500">
                              All reader submissions cleared. Share submission tools to source drafts.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CMS PART B: EDITOR-EXCLUSIVE POST FORM */}
                      <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                          <Layout className="h-4 w-4 text-emerald-400" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
                            Post Live/Archived Entry
                          </h3>
                        </div>

                        <form onSubmit={handleGeneralSubmitStory} className="space-y-3.5 text-xs">
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1">STORY TITLE *</label>
                              <input 
                                type="text"
                                required
                                placeholder="Type unique head title..."
                                value={editorFormHeadline}
                                onChange={(e) => setEditorFormHeadline(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 px-2.5 py-2 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1">MANUAL Timeline date picker *</label>
                              <input 
                                type="date"
                                required
                                value={editorFormDate}
                                onChange={(e) => setEditorFormDate(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1">BYLINE / WRITER *</label>
                              <input 
                                type="text"
                                required
                                placeholder="e.g. Maya Lin, Senior Writer"
                                value={editorFormByline}
                                onChange={(e) => setEditorFormByline(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 px-2.5 py-2 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1">Illustration Thumbnail URL</label>
                              <input 
                                type="url"
                                placeholder="e.g. Unsplash URL..."
                                value={editorFormImageUrl}
                                onChange={(e) => setEditorFormImageUrl(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 px-2.5 py-2 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-xs"
                              />
                            </div>
                          </div>

                          {/* MULTI-SELECT CATEGORY TAG CHROME */}
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1.5 flex items-center gap-1">
                              <Tag className="h-3 w-3 text-amber-400" /> SELECT CATEGORY &amp; TAGS (MULTI-SELECT)
                            </label>
                            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900 border border-zinc-855">
                              {availableTags.map((tag) => {
                                const isSelected = editorFormTags.includes(tag);
                                return (
                                  <button
                                    type="button"
                                    key={tag}
                                    onClick={() => {
                                      if (isSelected) {
                                        setEditorFormTags(editorFormTags.filter(t => t !== tag));
                                      } else {
                                        setEditorFormTags([...editorFormTags, tag]);
                                      }
                                    }}
                                    className={`px-2 py-1 text-[9px] font-mono uppercase font-black tracking-wide border transition rounded-md flex items-center gap-1 ${
                                      isSelected 
                                        ? "bg-amber-400 text-zinc-900 border-amber-500 shadow" 
                                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                                    }`}
                                  >
                                    {isSelected ? "✓" : "+"} {tag}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] text-zinc-500 font-mono">
                              <span>Primary category maps to:</span>
                              <span className="text-amber-400 font-black">{editorFormTags[0] || "None selected"}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-zinc-450 font-bold mb-1">ARTICLE BODY TEXT</label>
                            <textarea 
                              rows={3}
                              required
                              placeholder="Insert writeup paragraphs... Use double line-breaks for printed separations."
                              value={editorFormBodyText}
                              onChange={(e) => setEditorFormBodyText(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-850 text-zinc-200 p-2 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-xs font-serif leading-relaxed"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono uppercase font-black text-xs py-2 tracking-widest shadow-md transition cursor-pointer"
                          >
                            Publish &amp; Circulate To Portal &rarr;
                          </button>

                        </form>
                      </div>

                    </div>

                    {/* INLINE REVIEW WORKSPACE (if actively editing a reader's pending submission) */}
                    {editingReviewId && (
                      <div className="bg-zinc-950 border border-amber-400 p-4 rounded-xl space-y-4 animate-in slide-in-from-top duration-200" id="pending-editor-workflow">
                        <div className="flex items-center justify-between border-b border-zinc-805 pb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-spin" />
                            <h4 className="text-xs font-mono font-bold uppercase text-zinc-200">
                              Active Copydraft Editor Panel (Submission Id: {editingReviewId})
                            </h4>
                          </div>
                          <button 
                            onClick={() => setEditingReviewId(null)}
                            className="text-zinc-400 hover:text-white"
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <form onSubmit={handlePublishReviewedSubmission} className="space-y-3.5 text-xs text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-550 uppercase">HEADLINE</label>
                              <input 
                                type="text"
                                required
                                value={editReviewHeadline}
                                onChange={(e) => setEditReviewHeadline(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-550 uppercase">AUTHOR BYLINE</label>
                              <input 
                                type="text"
                                required
                                value={editReviewByline}
                                onChange={(e) => setEditReviewByline(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-550 uppercase">SECTION</label>
                              <select 
                                value={editReviewCategory}
                                onChange={(e) => setEditReviewCategory(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-805 px-2 py-1.8 text-zinc-100"
                              >
                                <option>Campus Life (Opinions)</option>
                                <option>Phantoms Sports</option>
                                <option>Studies</option>
                                <option>Events and Clubs</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-550 uppercase">illustration URL</label>
                              <input 
                                type="text"
                                value={editReviewImageUrl}
                                onChange={(e) => setEditReviewImageUrl(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-550 uppercase">Timeline Date</label>
                              <input 
                                type="date"
                                value={editReviewDate}
                                onChange={(e) => setEditReviewDate(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-805 px-3 py-1.5 text-zinc-100 placeholder-zinc-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-mono text-zinc-550 uppercase mb-1">COPA MULTI-TAGS</label>
                            <div className="flex flex-wrap gap-1 p-1 bg-zinc-900 border border-zinc-850">
                              {availableTags.map((tg) => {
                                const isSel = editReviewTags.includes(tg);
                                return (
                                  <button
                                    type="button"
                                    key={tg}
                                    onClick={() => {
                                      if (isSel) {
                                        setEditReviewTags(editReviewTags.filter(t => t !== tg));
                                      } else {
                                        setEditReviewTags([...editReviewTags, tg]);
                                      }
                                    }}
                                    className={`px-2 py-0.5 text-[8px] font-mono border transition ${
                                      isSel ? "bg-[#e67e22] text-white border-transparent" : "text-zinc-400 border-zinc-800"
                                    }`}
                                  >
                                    {tg}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-mono text-zinc-550 uppercase">BODY DRAFT COPY</label>
                            <textarea 
                              rows={6}
                              required
                              value={editReviewBodyText}
                              onChange={(e) => setEditReviewBodyText(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-850 p-2.5 font-serif leading-relaxed text-zinc-250 text-xs"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-mono text-xs uppercase font-black py-2.5 tracking-wider transition cursor-pointer"
                            >
                              Approve, Clear and Release Story Live!
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingReviews(pendingReviews.filter(s => s.id !== editingReviewId));
                                setEditingReviewId(null);
                                showToast("Submission deleted/withdrawn from queue.");
                              }}
                              className="bg-zinc-800 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-450 px-4 py-2 text-xs font-mono uppercase transition cursor-pointer"
                            >
                              Decline Request
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* TAB CONTENT A: HOMEPAGE WITH STATS AND 3 DYNAMIC SLOTS */}
            {currentTab === "home" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* 3 STATIC FRONT PAGE LAYOUT SLOTS SECTION */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Layout className="h-4 w-4 text-amber-400 animate-pulse" />
                    <h3 className="font-serif text-md font-bold text-zinc-200 uppercase tracking-widest">
                      Marquee Layout Slots
                    </h3>
                    {isEditorMode && (
                      <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-sm font-mono uppercase">
                        Drag and Drop Active
                      </span>
                    )}
                  </div>

                  {/* Visual 3 Slots Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="drag-drop-slots-grid">
                    
                    {/* SLOT 1: HERO SLOT (Spans col-span-7) */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (isEditorMode) setIsHeroDraggingOver(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        if (isEditorMode) setIsHeroDraggingOver(true);
                      }}
                      onDragLeave={() => {
                        if (isEditorMode) setIsHeroDraggingOver(false);
                      }}
                      onDrop={(e) => {
                        if (isEditorMode) {
                          handleSlotDrop(e, "hero");
                          setIsHeroDraggingOver(false);
                        }
                      }}
                      className={`md:col-span-7 rounded-2xl p-1 transition overflow-hidden ${
                        isEditorMode && editorSubMode === "Layout Designer"
                          ? isHeroDraggingOver
                            ? "border-4 border-dashed border-amber-400 bg-amber-400/5 ring-4 ring-amber-400/20"
                            : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-amber-400" 
                          : "bg-zinc-900 border border-zinc-800"
                      }`}
                    >
                      {slottedHero ? (
                        <div className="relative group p-5 h-full flex flex-col justify-between">
                          {isEditorMode && (
                            <div className="absolute top-2 right-2 z-10 bg-amber-400 text-zinc-950 font-mono text-[9px] font-black uppercase px-2 py-0.5 shadow">
                              Hero Slot
                            </div>
                          )}
                          <div className="space-y-3">
                            <span 
                              contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleUpdateArticleText(slottedHero.id, "category", e.currentTarget.textContent || "")}
                              className={`inline-block rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                (isEditorMode && editorSubMode === "Text Editor") ? "cursor-text border-amber-400" : ""
                              }`}
                            >
                              {slottedHero.category}
                            </span>
                            <h2 
                              contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => {
                                const val = e.currentTarget.textContent || "";
                                handleUpdateArticleText(slottedHero.id, "headline", val);
                              }}
                              onClick={(e) => {
                                if (isEditorMode && editorSubMode === "Text Editor") {
                                  e.stopPropagation();
                                } else {
                                  setSelectedArticle(slottedHero);
                                }
                              }}
                              className={`font-serif text-2xl sm:text-3xl font-black text-zinc-100 leading-tight transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                                (isEditorMode && editorSubMode === "Text Editor")
                                  ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-0.5 cursor-text"
                                  : "group-hover:text-amber-400"
                              }`}
                            >
                              {slottedHero.headline}
                            </h2>
                            {slottedHero.subheading !== undefined && (
                              <p 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent || "";
                                  handleUpdateArticleText(slottedHero.id, "subheading", val);
                                }}
                                onClick={(e) => {
                                  if (isEditorMode && editorSubMode === "Text Editor") {
                                    e.stopPropagation();
                                  }
                                }}
                                className={`text-xs text-zinc-400 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                                  (isEditorMode && editorSubMode === "Text Editor")
                                    ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-0.5 cursor-text"
                                    : ""
                                  }`}
                              >
                                {slottedHero.subheading || "(Enter subheading here)"}
                              </p>
                            )}
                            {slottedHero.imageUrl && (
                              <div className="overflow-hidden rounded-lg aspect-auto max-h-[190px] border border-zinc-850 my-2">
                                <img src={slottedHero.imageUrl} className="w-full h-full object-cover rounded-lg" alt="Marquee img" />
                              </div>
                            )}
                            {isEditorMode && editorSubMode === "Text Editor" && (
                              <div className="flex gap-2 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800 text-[10px]">
                                <span className="text-amber-400 font-mono font-bold">Image Link:</span>
                                <input 
                                  type="text" 
                                  className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-1.5 text-zinc-100 py-0.5 focus:outline-none" 
                                  value={slottedHero.imageUrl || ""} 
                                  onChange={(e) => handleUpdateArticleText(slottedHero.id, "imageUrl", e.target.value)} 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400 font-mono">
                            <div className="flex flex-wrap gap-1 items-center">
                              <span>By:</span>
                              <span
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdateArticleText(slottedHero.id, "byline", e.currentTarget.textContent || "")}
                                className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-1 rounded ${
                                  (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                }`}
                              >
                                {slottedHero.byline}
                              </span>
                              <span>•</span>
                              <span
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdateArticleText(slottedHero.id, "date", e.currentTarget.textContent || "")}
                                className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-1 rounded ${
                                  (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                }`}
                              >
                                {slottedHero.date}
                              </span>
                            </div>
                            <button 
                              onClick={() => setSelectedArticle(slottedHero)}
                              className="text-amber-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer text-xs"
                            >
                              Read Full Beat <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px] border-2 border-dashed border-zinc-700/60 rounded-xl bg-zinc-950/25">
                          <Layout className="h-8 w-8 text-zinc-550 mb-3 animate-pulse" />
                          <h4 className="font-mono text-xs uppercase font-black text-amber-500/80 tracking-wider mb-2">Slot 1 (Hero)</h4>
                          <p className="text-[11px] font-mono text-zinc-400 max-w-sm leading-relaxed" id="slot1-placeholder-body">
                            EMPTY HERO SLOT - Drag a featured story card here from the cabinet sidebar to activate the front page.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN SLOT BLOCKS: SECONDARY SLOT & SUB-FEATURE SLOT (Spans md:col-span-5) */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                      
                      {/* SLOT 2: SECONDARY SLOT */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (isEditorMode) setIsSecondaryDraggingOver(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          if (isEditorMode) setIsSecondaryDraggingOver(true);
                        }}
                        onDragLeave={() => {
                          if (isEditorMode) setIsSecondaryDraggingOver(false);
                        }}
                        onDrop={(e) => {
                          if (isEditorMode) {
                            handleSlotDrop(e, "secondary");
                            setIsSecondaryDraggingOver(false);
                          }
                        }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between ${
                          isEditorMode && editorSubMode === "Layout Designer"
                            ? isSecondaryDraggingOver
                              ? "border-4 border-dashed border-amber-400 bg-amber-400/5 ring-4 ring-amber-400/20"
                              : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60 hover:bg-zinc-900/95 hover:border-amber-400" 
                            : "bg-zinc-900 border border-zinc-800"
                        }`}
                      >
                        {slottedSecondary ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            {isEditorMode && (
                              <div className="absolute top-0 right-0 z-10 bg-emerald-500 text-zinc-950 font-mono text-[9px] font-black uppercase px-2 py-0.5 shadow">
                                Secondary Slot
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <span 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdateArticleText(slottedSecondary.id, "category", e.currentTarget.textContent || "")}
                                className={`text-[9px] font-mono uppercase bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-emerald-400 rounded-sm inline-block focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  (isEditorMode && editorSubMode === "Text Editor") ? "cursor-text border border-dashed border-amber-400/60" : ""
                                }`}
                              >
                                {slottedSecondary.category}
                              </span>
                              <h3 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent || "";
                                  handleUpdateArticleText(slottedSecondary.id, "headline", val);
                                }}
                                onClick={(e) => {
                                  if (isEditorMode && editorSubMode === "Text Editor") {
                                    e.stopPropagation();
                                  } else {
                                    setSelectedArticle(slottedSecondary);
                                  }
                                }}
                                className={`font-serif text-lg font-bold text-zinc-100 transition leading-snug cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                                  (isEditorMode && editorSubMode === "Text Editor")
                                    ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-0.5 cursor-text"
                                    : "group-hover:text-amber-400"
                                }`}
                              >
                                {slottedSecondary.headline}
                              </h3>
                              {slottedSecondary.imageUrl && (
                                <div className="overflow-hidden rounded-lg aspect-video max-h-[140px] border border-zinc-850 my-2">
                                  <img src={slottedSecondary.imageUrl} className="w-full h-full object-cover rounded-lg" alt="Secondary cover img" />
                                </div>
                              )}
                              {isEditorMode && editorSubMode === "Text Editor" && (
                                <div className="flex gap-2 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800 text-[9px] my-1">
                                  <span className="text-emerald-400 font-mono font-bold">Image:</span>
                                  <input 
                                    type="text" 
                                    className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-1.5 text-zinc-100 py-0.5 text-[9px] focus:outline-none" 
                                    value={slottedSecondary.imageUrl || ""} 
                                    onChange={(e) => handleUpdateArticleText(slottedSecondary.id, "imageUrl", e.target.value)} 
                                  />
                                </div>
                              )}
                              <p className="text-[11px] text-zinc-400 font-mono italic flex flex-wrap gap-1 items-center">
                                <span>By</span>
                                <span
                                  contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleUpdateArticleText(slottedSecondary.id, "byline", e.currentTarget.textContent || "")}
                                  className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-0.5 rounded ${
                                    (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                  }`}
                                >
                                  {slottedSecondary.byline}
                                </span>
                                <span>/</span>
                                <span
                                  contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleUpdateArticleText(slottedSecondary.id, "date", e.currentTarget.textContent || "")}
                                  className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-0.5 rounded ${
                                    (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                  }`}
                                >
                                  {slottedSecondary.date}
                                </span>
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => setSelectedArticle(slottedSecondary)}
                              className="text-[11px] text-zinc-200 group-hover:text-amber-400 flex items-center gap-1 font-bold mt-2 cursor-pointer pt-2 border-t border-zinc-800/50"
                            >
                              Open Secondary Story <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[140px] border-2 border-dashed border-zinc-700/60 bg-zinc-950/25 rounded-xl">
                            <Newspaper className="h-6 w-6 text-zinc-500 mb-2 animate-pulse" />
                            <h4 className="font-mono text-[10px] uppercase font-bold text-amber-500/80 tracking-wider mb-1">Slot 2 (Secondary)</h4>
                            <p className="text-[10px] font-mono text-zinc-400 max-w-xs leading-snug" id="slot2-placeholder-body">
                              EMPTY SECONDARY FEATURE - Drag a supporting story card here.
                            </p>
                          </div>
                        )}
                      </div>
 
                      {/* SLOT 3: SUB-FEATURE SLOT */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (isEditorMode) setIsSubFeatureDraggingOver(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          if (isEditorMode) setIsSubFeatureDraggingOver(true);
                        }}
                        onDragLeave={() => {
                          if (isEditorMode) setIsSubFeatureDraggingOver(false);
                        }}
                        onDrop={(e) => {
                          if (isEditorMode) {
                            handleSlotDrop(e, "subFeature");
                            setIsSubFeatureDraggingOver(false);
                          }
                        }}
                        className={`rounded-2xl p-5 transition flex-1 flex flex-col justify-between ${
                          isEditorMode && editorSubMode === "Layout Designer"
                            ? isSubFeatureDraggingOver
                              ? "border-4 border-dashed border-amber-400 bg-amber-400/5 ring-4 ring-amber-400/20"
                              : "border-2 border-dashed border-amber-400/40 bg-zinc-900/60 hover:bg-zinc-900/95 hover:border-amber-400" 
                            : "bg-zinc-900 border border-zinc-800"
                        }`}
                      >
                        {slottedSubFeature ? (
                          <div className="relative group space-y-3 h-full flex flex-col justify-between">
                            {isEditorMode && (
                              <div className="absolute top-0 right-0 z-10 bg-sky-500 text-zinc-950 font-mono text-[9px] font-black uppercase px-2 py-0.5 shadow">
                                Sub-Feature Slot
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <span 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleUpdateArticleText(slottedSubFeature.id, "category", e.currentTarget.textContent || "")}
                                className={`text-[9px] font-mono uppercase bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 text-sky-400 rounded-sm inline-block focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                  (isEditorMode && editorSubMode === "Text Editor") ? "cursor-text border border-dashed border-amber-400/60" : ""
                                }`}
                              >
                                {slottedSubFeature.category}
                              </span>
                              <h3 
                                contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent || "";
                                  handleUpdateArticleText(slottedSubFeature.id, "headline", val);
                                }}
                                onClick={(e) => {
                                  if (isEditorMode && editorSubMode === "Text Editor") {
                                    e.stopPropagation();
                                  } else {
                                    setSelectedArticle(slottedSubFeature);
                                  }
                                }}
                                className={`font-serif text-md font-extrabold text-zinc-200 transition leading-snug cursor-pointer line-clamp-2 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                                  (isEditorMode && editorSubMode === "Text Editor")
                                    ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-0.5 cursor-text"
                                    : "group-hover:text-amber-400"
                                }`}
                              >
                                {slottedSubFeature.headline}
                              </h3>
                              {slottedSubFeature.imageUrl && (
                                <div className="overflow-hidden rounded-lg aspect-video max-h-[120px] border border-zinc-850 my-2">
                                  <img src={slottedSubFeature.imageUrl} className="w-full h-full object-cover rounded-lg" alt="Sub-feature cover img" />
                                </div>
                              )}
                              {isEditorMode && editorSubMode === "Text Editor" && (
                                <div className="flex gap-2 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800 text-[9px] my-1">
                                  <span className="text-sky-400 font-mono font-bold">Image:</span>
                                  <input 
                                    type="text" 
                                    className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-1.5 text-zinc-100 py-0.5 text-[9px] focus:outline-none" 
                                    value={slottedSubFeature.imageUrl || ""} 
                                    onChange={(e) => handleUpdateArticleText(slottedSubFeature.id, "imageUrl", e.target.value)} 
                                  />
                                </div>
                              )}
                              <p className="text-[10px] text-zinc-400 font-mono flex flex-wrap gap-1 items-center">
                                <span>By</span>
                                <span
                                  contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleUpdateArticleText(slottedSubFeature.id, "byline", e.currentTarget.textContent || "")}
                                  className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-0.5 rounded ${
                                    (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                  }`}
                                >
                                  {slottedSubFeature.byline}
                                </span>
                                <span>/</span>
                                <span
                                  contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleUpdateArticleText(slottedSubFeature.id, "date", e.currentTarget.textContent || "")}
                                  className={`focus:outline-none focus:ring-1 focus:ring-amber-400 px-0.5 rounded ${
                                    (isEditorMode && editorSubMode === "Text Editor") ? "border border-dashed border-amber-400/40 cursor-text text-amber-300 font-bold" : ""
                                  }`}
                                >
                                  {slottedSubFeature.date}
                                </span>
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => setSelectedArticle(slottedSubFeature)}
                              className="text-[10px] text-zinc-350 flex items-center gap-0.5 cursor-pointer pt-2 border-t border-zinc-800/50"
                            >
                              Explore Section Report &rarr;
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[140px] border-2 border-dashed border-zinc-700/60 bg-zinc-950/25 rounded-xl">
                            <BookOpen className="h-6 w-6 text-zinc-500 mb-2 animate-pulse" />
                            <h4 className="font-mono text-[10px] uppercase font-bold text-amber-500/80 tracking-wider mb-1">Slot 3 (Sub-Feature)</h4>
                            <p className="text-[10px] font-mono text-zinc-400 max-w-xs leading-snug" id="slot3-placeholder-body">
                              EMPTY SUB-FEATURE GRID - Drop an article card here to format.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </section>

                {/* GENERAL NEWS STANDS FEED (EXCLUDING SLOTTED ARTICLES) */}
                <section className="space-y-4">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-zinc-300" />
                      <h3 className="font-serif text-md font-bold text-zinc-200 uppercase tracking-widest">
                        {selectedCategory} Chronicle Index
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {displayedFeedArticles.length} matching stories in index block
                    </span>
                  </div>

                  {displayedFeedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="editorial-main-articles-grid">
                      {displayedFeedArticles.map((article) => (
                        <ArticleCard 
                          key={article.id}
                          article={article}
                          onReadMore={setSelectedArticle}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-zinc-900/50 border border-dashed border-zinc-850 p-6 rounded-2xl">
                      <p className="font-serif text-xs italic text-zinc-500">No articles match the current filter sections.</p>
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* TAB CONTENT C: PHOTO GALLERY & MEDIA LIGHTROOM */}
            {currentTab === "gallery" && (() => {
              // Auto-compile photos from live articles
              const autoAggregatedStoryPhotos: GalleryItem[] = [];
              articles.forEach(art => {
                if (art.imageUrl) {
                  autoAggregatedStoryPhotos.push({
                    id: `story-cover-${art.id}`,
                    imageUrl: art.imageUrl,
                    caption: `Cover photograph for editorial headline "${art.headline}"`,
                    takenAt: String(art.date || "Unknown Date"),
                    articleId: art.id,
                    articleHeadline: art.headline
                  });
                }
                if (art.additionalImages && Array.isArray(art.additionalImages)) {
                  art.additionalImages.forEach((img, index) => {
                    if (img) {
                      autoAggregatedStoryPhotos.push({
                        id: `story-addit-${art.id}-${index}`,
                        imageUrl: img,
                        caption: `Supplementary perspective #${index + 1} for "${art.headline}"`,
                        takenAt: String(art.date || "Unknown Date"),
                        articleId: art.id,
                        articleHeadline: art.headline
                      });
                    }
                  });
                }
              });

              const galleryItemsToDisplay = [
                ...(galleryFilterTab === "custom" ? [] : autoAggregatedStoryPhotos),
                ...(galleryFilterTab === "editorial" ? [] : customGalleryItems)
              ];

              return (
                <div className="space-y-6 animate-in fade-in duration-200" id="media-lightroom-gallery">
                  {/* Gallery Header board */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                        <Camera className="h-5 w-5 text-amber-400" /> Playpen Press Photographic Ledger
                      </h2>
                      <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
                        Cozy Polaroid mesh displaying auto-compiled story photos & interactive custom editor submissions
                      </p>
                    </div>

                    {/* Filter Mode Selector */}
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-lg text-xs">
                      <span className="text-[9px] text-zinc-500 px-1 font-mono uppercase font-black">Filter:</span>
                      <button
                        onClick={() => {
                          setGalleryFilterTab("all");
                          showToast("Showing all photos");
                        }}
                        className={`px-2 py-1 rounded-md font-mono text-[10px] uppercase font-bold transition-all ${
                          galleryFilterTab === "all"
                            ? "bg-amber-400 text-zinc-950 shadow"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        All ({autoAggregatedStoryPhotos.length + customGalleryItems.length})
                      </button>
                      <button
                        onClick={() => {
                          setGalleryFilterTab("editorial");
                          showToast("Showing editorial story coverage");
                        }}
                        className={`px-2 py-1 rounded-md font-mono text-[10px] uppercase font-bold transition-all ${
                          galleryFilterTab === "editorial"
                            ? "bg-amber-400 text-zinc-950 shadow"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        Story Press ({autoAggregatedStoryPhotos.length})
                      </button>
                      <button
                        onClick={() => {
                          setGalleryFilterTab("custom");
                          showToast("Showing custom photoreels");
                        }}
                        className={`px-2 py-1 rounded-md font-mono text-[10px] uppercase font-bold transition-all ${
                          galleryFilterTab === "custom"
                            ? "bg-amber-400 text-zinc-950 shadow"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        Custom Reels ({customGalleryItems.length})
                      </button>
                    </div>
                  </div>

                  {/* FORM TO ADD IMAGE (Available for anyone or editors as raw input) */}
                  {isEditorMode && (
                    <div className="bg-zinc-900 border border-zinc-805 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2 animate-pulse">
                        <ImageIcon className="h-4.5 w-4.5 text-amber-500" />
                        <h3 className="font-serif text-sm font-bold text-zinc-200 uppercase tracking-wider">
                          Pinner Tools: Upload Custom Asset
                        </h3>
                      </div>
                      <form onSubmit={handleAddGalleryPhoto} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-mono block uppercase">File upload / Image URL Link</label>
                          <input 
                            type="text" 
                            placeholder="Pasted image HTTPS URL..." 
                            className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            value={newGalleryImageUrl}
                            onChange={(e) => setNewGalleryImageUrl(e.target.value)}
                          />
                          <div className="pt-1">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleGalleryFileChange}
                              className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-mono block uppercase">Context Description Text (Caption)</label>
                          <textarea 
                            placeholder="Describe what's happening or add optional notes..."
                            rows={3}
                            className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none h-[72px]"
                            value={newGalleryCaption}
                            onChange={(e) => setNewGalleryCaption(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5 flex flex-col justify-between">
                          <div>
                            <label className="text-[10px] text-zinc-400 font-mono block uppercase">Metadata Date & Time Taken</label>
                            <input 
                              type="text" 
                              className="w-full text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-amber-450"
                              value={newGalleryTakenAt}
                              onChange={(e) => setNewGalleryTakenAt(e.target.value)}
                            />
                          </div>
                          <button 
                            type="submit"
                            className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-sans text-xs font-bold py-2 px-4 rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                          >
                            <Plus className="h-3.5 w-3.5" /> Commit Photo to Ledger
                          </button>
                        </div>
                      </form>

                      {newGalleryImageUrl && (
                        <div className="pt-2 border-t border-zinc-800/50 flex items-center gap-3">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase">Asset Preview:</span>
                          <div className="relative h-16 w-16 rounded overflow-shadow border border-zinc-800 bg-zinc-950">
                            <img src={newGalleryImageUrl} className="w-full h-full object-cover" alt="Thumb" />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setNewGalleryImageUrl("")}
                            className="text-[10px] font-mono hover:underline text-red-400 cursor-pointer"
                          >
                            Discard file preview
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Polaroid Grid Layout */}
                  {galleryItemsToDisplay.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
                      {galleryItemsToDisplay.map((item) => {
                        const isCustom = item.id.startsWith("gal-");
                        // Generate deterministic slight tilt rotation
                        let tiltAngle = -1;
                        try {
                          const numStr = item.id.replace(/\D/g, '');
                          if (numStr) {
                            tiltAngle = (parseInt(numStr.slice(-3)) % 5) - 2;
                          }
                        } catch (err) {
                          tiltAngle = 1;
                        }

                        return (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedGalleryPhoto(item)}
                            className="paper-crease-overlay bg-[#ede4d7] text-zinc-950 p-4 pt-4 pb-8 shadow-2xl rounded border border-[#d6c9b6] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] cursor-pointer select-none flex flex-col justify-between group h-[300px]"
                            style={{ transform: `rotate(${tiltAngle}deg)` }}
                          >
                            <div className="space-y-3 flex-1 flex flex-col justify-between">
                              {/* Photo Area */}
                              <div className="aspect-square w-full overflow-hidden bg-zinc-950 relative border border-black/10 flex-1 min-h-[140px]">
                                <img 
                                  src={item.imageUrl} 
                                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                                  alt={item.caption || "Gallery item"} 
                                />
                                <div className="absolute top-1 left-1 bg-zinc-950/80 text-white font-mono text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                                  {isCustom ? "📸 Custom upload" : "📰 Story Frame"}
                                </div>
                                {isEditorMode && isCustom && (
                                  <button
                                    onClick={(e) => handleDeleteGalleryItem(item.id, e)}
                                    className="absolute bottom-1 right-1 bg-zinc-900/90 text-red-400 hover:text-red-350 hover:bg-zinc-950 p-1.5 rounded shadow transition cursor-pointer"
                                    title="Delete custom upload"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>

                              {/* Caption Area (Vintage Typewriter aesthetic) */}
                              <div className="px-1 text-center font-serif text-[11px] leading-relaxed text-zinc-800 line-clamp-2 italic font-medium">
                                "{item.caption ? (item.caption.length > 50 ? `${item.caption.slice(0, 48)}...` : item.caption) : "Student press snapshot..."}"
                              </div>
                            </div>

                            {/* Date Taken Monospace metadata */}
                            <div className="mt-3 pt-2 border-t border-zinc-950/10 flex justify-between items-center text-[9px] font-mono text-zinc-650 px-1 uppercase tracking-wider font-extrabold">
                              <span className="truncate max-w-[120px]">At: {item.takenAt}</span>
                              <span className="text-[12px] leading-none text-amber-805/70">★</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-zinc-900/50 border border-dashed border-zinc-850 p-6 rounded-2xl">
                      <ImageIcon className="h-8 w-8 text-zinc-650 mx-auto mb-2 animate-bounce" />
                      <p className="font-serif text-sm italic text-zinc-400">Playpen Press Photo Ledger is quiet. No matches found for current filters.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB CONTENT B: DEDICATED ALL NEWS PAST & PRESENT ARCHIVE */}
            {currentTab === "archive" && (
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200" id="archive-library-segment">
                
                {/* Archive header toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-4 gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                      <Archive className="h-5 w-5 text-amber-400" /> Historical Press Archive Ledger
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
                      Search and query every recorded student chronicle (past and present)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    
                    {/* Date Timeline Sorter Toggle */}
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg text-xs">
                      <span className="text-[10px] text-zinc-500 px-1 font-mono uppercase font-bold">Timeline Sort:</span>
                      <button
                        onClick={() => {
                          setArchiveSortOrder("newest");
                          showToast("Sorted archive timeline: newest first");
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                          archiveSortOrder === "newest" ? "bg-amber-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => {
                          setArchiveSortOrder("oldest");
                          showToast("Sorted archive timeline: oldest first");
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                          archiveSortOrder === "oldest" ? "bg-amber-400 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        Historical (Oldest)
                      </button>
                    </div>

                  </div>
                </div>

                {/* Inline filter pills for tag array sorting */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Narrow ledger rows by tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => {
                      const isActive = archiveFilterTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            if (isActive) {
                              setArchiveFilterTags(archiveFilterTags.filter(t => t !== tag));
                            } else {
                              setArchiveFilterTags([...archiveFilterTags, tag]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border transition ${
                            isActive 
                              ? "bg-amber-400/20 text-amber-300 border-amber-455" 
                              : "bg-zinc-950 text-zinc-500 border-zinc-850 hover:text-zinc-300 hover:border-zinc-700"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                    {archiveFilterTags.length > 0 && (
                      <button 
                        onClick={() => setArchiveFilterTags([])}
                        className="text-[9px] font-mono text-zinc-400 hover:text-white underline pl-1"
                      >
                        Clear segment tags
                      </button>
                    )}
                  </div>
                </div>

                {/* Search query inside ledger */}
                <div className="relative">
                  <Search className="h-4.5 w-4.5 text-zinc-500 absolute left-3 top-1/2 -track-y -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search archive ledger for titles, creators, descriptions..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Grid ledger output */}
                {getSortedAndFilteredArchive().length > 0 ? (
                  <div className="overflow-x-auto" id="archive-table">
                    <table className="w-full text-left text-xs text-zinc-300 min-w-[600px] border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Headline Title</th>
                          <th className="py-3 px-3">Section</th>
                          <th className="py-3 px-3">Reporter</th>
                          {isEditorMode && <th className="py-3 px-3 text-amber-500">FP Layout Seat</th>}
                          <th className="py-3 px-3 text-right">View Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedAndFilteredArchive().map((art) => (
                          <tr 
                            key={art.id} 
                            className="border-b border-zinc-850 hover:bg-zinc-950/40 transition cursor-pointer"
                            onClick={() => setSelectedArticle(art)}
                          >
                            <td className="py-3 px-3 font-mono font-medium text-amber-400">
                              {formatDatePretty(art.date)}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-serif text-sm font-bold text-zinc-100 line-clamp-1 hover:underline">
                                {art.headline}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {art.front_page_tag && (
                                  <span className="text-[8px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 rounded-sm flex items-center gap-0.5">
                                    ★ SLOTTED {art.front_page_tag.toUpperCase()}
                                  </span>
                                )}
                                {art.tags && art.tags.map((tg, idx) => (
                                  <span key={idx} className="text-[8px] font-mono uppercase bg-zinc-955 text-zinc-500 px-1 rounded-sm">
                                    {tg}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="bg-zinc-800 text-zinc-350 text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                {art.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                              {art.byline}
                            </td>
                            {isEditorMode && (
                              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={art.front_page_tag || "none"}
                                  onChange={async (e) => {
                                    const val = e.target.value;
                                    await assignFrontPageTag(art.id, val === "none" ? null : val as any);
                                  }}
                                  className="text-[10px] p-1 bg-zinc-900 border border-zinc-800 rounded text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                                >
                                  <option value="none">None (Standard)</option>
                                  <option value="hero">Hero Slot</option>
                                  <option value="secondary">Secondary</option>
                                  <option value="sub_feature">Sub-Feature</option>
                                </select>
                              </td>
                            )}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 bg-zinc-850 px-2 py-1 text-[9px] font-mono text-zinc-200 hover:bg-zinc-805 transition rounded-sm pr-2.5">
                                  Read Post <ChevronRight className="h-3 w-3 text-amber-400" />
                                </span>
                                {isEditorMode && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteArticle(art.id);
                                    }}
                                    className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-400 cursor-pointer transition flex items-center justify-center mb-0.5"
                                    title="Permanently Delete Article 🗑️"
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
                ) : (
                  <div className="py-20 text-center bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
                    <Inbox className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                    <p className="font-serif text-xs italic text-zinc-500">
                      No archive log rows matching custom tag criteria or search query.
                    </p>
                  </div>
                )}
              </section>
            )}

          </main>

          {/* COLUMN 3: Right Context Sidebar (Story Pool Workspace on Right ONLY for Editor View!) */}
          {isEditorMode && currentTab === "home" ? (
            <aside className="lg:col-span-3 space-y-6 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-850" id="homepage-editor-storypool">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-400">
                    <Layers className="h-4 w-4 animate-bounce" />
                    <span>Story Pool Cabinet Sidebar</span>
                  </div>
                  <HelpCircle className="h-4 w-4 text-zinc-550 cursor-help" title="Fling cards from here over onto Front Page layout slots leftwise dynamically!" />
                </div>
                
                <p className="text-[10px] text-zinc-400 leading-normal font-mono uppercase">
                  ⚡ DRAG STORIES BELOW AND DROP INTO LEFT WIREFRAME LAYOUT SLOTS:
                </p>

                <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                  {articles.map((article) => {
                    const isSlottedInHero = pageSlots.heroId === article.id;
                    const isSlottedInSecondary = pageSlots.secondaryId === article.id;
                    const isSlottedInSubFeature = pageSlots.subFeatureId === article.id;
                    const isAnySlotted = isSlottedInHero || isSlottedInSecondary || isSlottedInSubFeature;
                    const canDrag = editorSubMode === "Layout Designer";

                    return (
                      <div
                        key={article.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, article.id)}
                        className={`group p-3 border rounded-xl transition hover:shadow-lg ${
                          canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                        } ${
                          isAnySlotted 
                            ? "bg-zinc-900/40 border-amber-400/30 border-dashed" 
                            : "bg-zinc-90 w-full bg-zinc-900 border-zinc-801 hover:border-zinc-700"
                        }`}
                        title={canDrag ? "Drag me!" : "Editable - Activate Layout Designer to drag"}
                      >
                        <div className="flex justify-between items-center mb-1 text-[8px] font-mono tracking-wider uppercase">
                          <span className="text-zinc-500">{article.category}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400">
                              {isSlottedInHero ? "★ Slotted Hero" : isSlottedInSecondary ? "★ Slotted Secondary" : isSlottedInSubFeature ? "★ Slotted Sub-Feature" : "Ready • Draggable"}
                            </span>
                            {isEditorMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteArticle(article.id);
                                }}
                                className="text-zinc-500 hover:text-red-400 p-0.5 rounded cursor-pointer transition flex items-center justify-center mb-0.5"
                                title="Permanently delete article 🗑️"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 className="font-serif text-xs font-bold text-zinc-100 group-hover:underline line-clamp-2 leading-tight">
                          {article.headline}
                        </h4>
                        <div className="flex justify-between items-center text-[9px] font-mono mt-2 text-zinc-550">
                          <span>By: {article.byline.slice(0, 15)}...</span>
                          <span>{formatDatePretty(article.date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          ) : (
            null // Hide right sidebar for Reader Mode or Archive view to give clean focus!
          )}

        </div>
      </div>

      {/* FOOTER BAR */}
      <footer className="mt-16 bg-zinc-950 text-zinc-200 py-12 border-t border-zinc-900" id="press-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-zinc-900 pb-8">
            
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Newspaper className="h-7 w-7 text-amber-400 animate-pulse" />
                <span className="font-title text-lg font-black uppercase tracking-tight text-white">THE PLAYPEN PRESS</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                A cozy campus writing desk and local historical registry of student stories, reviews, and community updates.
              </p>
              <div className="pt-2 text-[10px] font-mono text-amber-500">
                Est. 1982 &bull; Playpen Press School Community Association
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-200 mb-4">&bull; Sections</h4>
              <nav className="flex flex-col space-y-2 text-xs text-zinc-450 font-sans">
                <button onClick={() => { setSelectedCategory("Campus Life (Opinions)"); window.scrollTo({top: 0, behavior: "smooth"}); }} className="hover:text-amber-400 text-left cursor-pointer uppercase">Campus Life (Opinions)</button>
                <button onClick={() => { setSelectedCategory("Phantoms Sports"); window.scrollTo({top: 0, behavior: "smooth"}); }} className="hover:text-amber-400 text-left cursor-pointer uppercase">Phantoms Sports</button>
                <button onClick={() => { setSelectedCategory("Studies"); window.scrollTo({top: 0, behavior: "smooth"}); }} className="hover:text-amber-400 text-left cursor-pointer uppercase">Studies</button>
                <button onClick={() => { setSelectedCategory("Events and Clubs"); window.scrollTo({top: 0, behavior: "smooth"}); }} className="hover:text-amber-400 text-left cursor-pointer uppercase">Events and Clubs</button>
              </nav>
            </div>

            <div className="md:col-span-1"></div>

            <div className="md:col-span-4 bg-zinc-900 p-5 border border-zinc-800 rounded-2xl">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2 font-black flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                Student Newsroom Integration Info
              </h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                Your Editorial Assistant employs the Gemini 3.5 Flash Model to proof, draft, critique, and correct copy instantly. Access the AI Coprocessor via the dashboard in Editor view.
              </p>
              <div className="mt-4 flex gap-2">
                {isEditorMode && (
                  <button 
                    onClick={() => { setShowAiLab(true); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                    className="bg-indigo-950 border border-indigo-700 hover:bg-indigo-900 text-white text-[10px] uppercase tracking-wider py-1.5 px-3 font-bold block transition"
                  >
                    Open AI Board
                  </button>
                )}
                <button 
                  onClick={() => { setShowPublishModal(true); }}
                  className="bg-amber-400 hover:bg-amber-500 text-zinc-950 text-[10px] uppercase tracking-wider py-1.5 px-3 font-black block transition"
                >
                  Submit Story
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500 gap-4">
            <span>&copy; {new Date().getFullYear()} THE PLAYPEN PRESS ASSOCIATION. ALL STUDENT VIEWS ARE GUARANTEED BINDING.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Editorial Press Bylaws</a>
              <span>&bull;</span>
              <a href="#" className="hover:underline">Submit Guest Op-Ed</a>
            </div>
          </div>
        </div>
      </footer>

      {/* INDEPENDENT READ ARTICLE MODAL */}
      <ArticleModal 
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? bookmarkedIds.includes(selectedArticle.id) : false}
        onToggleBookmark={(articleId) => {
          if (bookmarkedIds.includes(articleId)) {
            setBookmarkedIds(bookmarkedIds.filter(id => id !== articleId));
            showToast("Article removed from bookmarks Shelf.");
          } else {
            setBookmarkedIds([...bookmarkedIds, articleId]);
            showToast("Article added to your bookmarks Cabinet! 📚");
          }
        }}
        isEditorMode={isEditorMode}
        editorSubMode={editorSubMode}
        onUpdateArticleText={handleUpdateArticleText}
        onUpdateArticleParagraph={handleUpdateArticleParagraph}
      />

      {/* DUAL MODE SUBMISSIONS DRAWER MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" id="composer-modal">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-lg font-black text-zinc-100">
                  {!isEditorMode ? "Student Press submission Form" : "Exclusive Editor Publishing form"}
                </h3>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-850 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* General Submission form */}
            <form onSubmit={handleGeneralSubmitStory} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="flex items-start gap-3 bg-indigo-900/10 border border-indigo-500/20 p-3 text-xs text-indigo-300 rounded-lg">
                <Sparkles className="h-4.5 w-4.5 shrink-0 mt-0.5 text-indigo-400 animate-pulse" />
                <div>
                  <span className="font-bold">Dynamic Submission Preview:</span> You are currently editing as a <strong className="text-amber-400">{isEditorMode ? "Staff Editor" : "Reader (Guest)"}</strong>. Submissions will {isEditorMode ? "publish immediately onto the front page." : "be routed to the Editor's reviews pipeline safely."}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Headline STORY TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide headline title..."
                    value={editorFormHeadline}
                    onChange={(e) => setEditorFormHeadline(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Author Byline / Writers *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Julian Thorne, senior"
                    value={editorFormByline}
                    onChange={(e) => setEditorFormByline(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Subheading Context Summary</label>
                <input
                  type="text"
                  placeholder="Single summary teaser detail..."
                  value={editorFormSubheading}
                  onChange={(e) => setEditorFormSubheading(e.target.value)}
                  className="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Target Category Section *</label>
                  <select
                    value={editorFormCategory}
                    onChange={(e) => {
                      setEditorFormCategory(e.target.value);
                      if (!editorFormTags.includes(e.target.value)) {
                        setEditorFormTags([e.target.value, ...editorFormTags.filter(t => t !== e.target.value)]);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                  >
                    <option>Campus Life (Opinions)</option>
                    <option>Phantoms Sports</option>
                    <option>Studies</option>
                    <option>Events and Clubs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Manual Timeline / Backdate Selector</label>
                  {isEditorMode ? (
                    <input
                      type="date"
                      value={editorFormDate}
                      onChange={(e) => setEditorFormDate(e.target.value)}
                      className="w-full text-xs p-2.2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                    />
                  ) : (
                    <div className="p-2.2 bg-zinc-900 text-zinc-550 border border-zinc-810 rounded-lg text-xs">
                      Today ({new Date().toLocaleDateString()}) - backdating requires Editor lock keys.
                    </div>
                  )}
                </div>
              </div>

              {/* Front Page Tag Assignment Selector */}
              {isEditorMode && (
                <div className="bg-amber-400/5 p-3 rounded-xl border border-amber-400/20">
                  <label className="block text-[10px] font-mono uppercase font-black text-amber-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" /> Front Page Layout Seat Alignment
                  </label>
                  <select
                    value={editorFormFpTag}
                    onChange={(e) => setEditorFormFpTag(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-amber-300 font-mono font-bold"
                  >
                    <option value="none">None (Send to standard archive feed Only)</option>
                    <option value="hero">Hero Slot (Prominent banner top position)</option>
                    <option value="secondary">Secondary Slot (Supporting grid left seat)</option>
                    <option value="sub_feature">Sub-Feature Slot (Supporting grid right seat)</option>
                  </select>
                  <p className="text-[9px] text-zinc-500 mt-1 italic leading-relaxed font-sans">
                    * Assignment adheres strictly to single-seat constraint: assigning this ranks the current story and instantly unlocks any other story holding this exact front page seat.
                  </p>
                </div>
              )}

              {/* EDITOR ONLY TAG DROPDOWN OR SELECTOR */}
              {isEditorMode && (
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1.5 flex items-center gap-1">
                    <Tag className="h-3 w-3 text-amber-400 animate-bounce" /> Multi-select Article Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                    {availableTags.map((tag) => {
                       const isSel = editorFormTags.includes(tag);
                       return (
                         <button
                           type="button"
                           key={tag}
                           onClick={() => {
                             if (isSel) {
                               setEditorFormTags(editorFormTags.filter(t => t !== tag));
                             } else {
                               setEditorFormTags([...editorFormTags, tag]);
                             }
                           }}
                           className={`px-2 py-0.5 text-[9px] font-mono uppercase transition ${
                             isSel ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-500 hover:text-zinc-350"
                           }`}
                         >
                           {tag}
                         </button>
                       );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider mb-1">
                    Illustration Cover Photo (Click to Upload OR Enter URL Link)
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="url"
                      placeholder="Paste cover image link... (e.g. Unsplash URL)"
                      value={editorFormImageUrl}
                      onChange={(e) => setEditorFormImageUrl(e.target.value)}
                      className="flex-1 text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100"
                    />
                    <label className="bg-zinc-850 hover:bg-zinc-750 text-zinc-200 border border-zinc-800 px-3.5 py-2.5 text-xs font-mono rounded-lg flex items-center justify-center cursor-pointer select-none transition">
                      <span>Upload 📷</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => {
                              setEditorFormImageUrl(r.result as string);
                              showToast("Cover graphic uploaded successfully! 🎨");
                            };
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {editorFormImageUrl && (
                    <div className="mt-2 text-center">
                      <img src={editorFormImageUrl} className="mx-auto rounded border border-zinc-800 max-h-24 object-contain shadow-md" alt="Cover thumbnail preview" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider mb-1 flex justify-between items-center">
                    <span>Additional Images (Optional Carousel snapshots)</span>
                    <span className="text-zinc-500 font-normal lowercase">({editorFormAdditionalImages.length} attached)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="additional-img-url-input"
                      placeholder="Add alternative image URL link..."
                      className="flex-1 text-xs p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100 placeholder-zinc-650"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const val = target.value.trim();
                          if (val) {
                            setEditorFormAdditionalImages([...editorFormAdditionalImages, val]);
                            target.value = "";
                            showToast("Snapshot link added!");
                          }
                        }
                      }}
                    />
                    <label className="bg-zinc-850 hover:bg-zinc-750 text-zinc-200 border border-zinc-800 px-3.5 py-2.5 text-xs font-mono rounded-lg flex items-center justify-center cursor-pointer select-none transition">
                      <span>Add File 📁</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => {
                              setEditorFormAdditionalImages([...editorFormAdditionalImages, r.result as string]);
                              showToast("Attached alternative file snapshot! 📁");
                            };
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1 font-mono">Press Enter inside URL box to confirm link attachment</p>

                  {editorFormAdditionalImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 p-2 bg-zinc-950/60 rounded-lg border border-zinc-850">
                      {editorFormAdditionalImages.map((img, i) => (
                        <div key={i} className="relative group/thumb w-14 h-14 rounded border border-zinc-800 overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" alt="story snapshot" />
                          <button
                            type="button"
                            onClick={() => {
                              setEditorFormAdditionalImages(editorFormAdditionalImages.filter((_, idx) => idx !== i));
                              showToast("Snapshot detached.");
                            }}
                            className="absolute inset-0 bg-red-950/80 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-[9px] font-mono text-white transition duration-155 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1">Article copy contents * (double enter splits paragraphs)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Compose article narratives here..."
                  value={editorFormBodyText}
                  onChange={(e) => setEditorFormBodyText(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 placeholder-zinc-650 font-serif leading-relaxed text-zinc-200 text-xs"
                />
              </div>

              <div className="border-t border-zinc-800 pt-4 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-zinc-950 transition py-2 px-6 text-xs font-bold uppercase tracking-widest font-mono"
                >
                  {isEditorMode ? "Publish Live &rarr;" : "Transmit Draft Submission"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDITORIAL AI LAB WORKSPACE MODAL */}
      {showAiLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" id="ai-lab-modal">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-850 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
            
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
                <h3 className="font-serif text-lg font-black text-white">
                  EDITORIAL AI ADVISORY CENTER • POWERED BY GEMINI
                </h3>
              </div>
              <button 
                onClick={() => setShowAiLab(false)}
                className="rounded-lg p-2 text-zinc-450 hover:bg-zinc-850 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* AI panel Form controls (Col span 5) */}
                <div className="md:col-span-5 bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4">
                  <div className="flex flex-wrap gap-1 bg-zinc-900 p-1 rounded-lg">
                    {["draft", "proofread", "headlines", "pitches"].map((act) => (
                      <button
                        key={act}
                        onClick={() => setAiAction(act as any)}
                        className={`flex-1 text-center py-1.5 text-[9px] font-mono uppercase font-black tracking-wider transition rounded-md ${
                          aiAction === act 
                            ? "bg-amber-400 text-zinc-950" 
                            : "text-zinc-400 hover:text-zinc-250"
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {aiAction === "draft" && (
                      <div className="space-y-3 font-mono">
                        <div>
                          <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">STORY FOCUS TOPIC</label>
                          <input 
                            type="text"
                            placeholder="e.g. Phantoms robots coding prize"
                            value={draftTopic}
                            onChange={(e) => setDraftTopic(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">KEY BACKGROUND FACTS (ONE PER LINE)</label>
                          <textarea 
                            rows={3}
                            placeholder="- Julian Thorne led class coding&#10;- Vision code written in Py"
                            value={draftKeyFacts}
                            onChange={(e) => setDraftKeyFacts(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-250 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">TONE</label>
                            <select 
                              value={draftStyle} 
                              onChange={(e) => setDraftStyle(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded text-xs p-1 text-zinc-300"
                            >
                              <option>Standard Journalism</option>
                              <option>Narrative &amp; Immersive</option>
                              <option>Witty &amp; Punchy</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">SECTION</label>
                            <select 
                              value={draftSection} 
                              onChange={(e) => setDraftSection(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded text-xs p-1 text-zinc-300"
                            >
                              <option>Campus Life (Opinions)</option>
                              <option>Phantoms Sports</option>
                              <option>Studies</option>
                              <option>Events and Clubs</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {aiAction === "proofread" && (
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-550 uppercase font-black mb-1">PASTE COPYWRITE TO REWRITE/PROOF</label>
                        <textarea 
                          rows={6}
                          placeholder="Paste story paragraphs here to analyze reading readiness..."
                          value={textToProof}
                          onChange={(e) => setTextToProof(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs font-serif leading-relaxed text-zinc-300"
                        />
                      </div>
                    )}

                    {aiAction === "headlines" && (
                      <div className="space-y-3 font-mono">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase">BASELINE SENTENCE</label>
                          <input 
                            type="text"
                            placeholder="Phantoms stadium track updates..."
                            value={draftHeadlineInput}
                            onChange={(e) => setDraftHeadlineInput(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-black">ACCENT FACTS</label>
                          <textarea 
                            rows={3}
                            placeholder="Enter background notes to enhance options..."
                            value={summaryFactsInput}
                            onChange={(e) => setSummaryFactsInput(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                          />
                        </div>
                      </div>
                    )}

                    {aiAction === "pitches" && (
                      <div className="space-y-3 font-mono">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-bold">THEME CONCEPT</label>
                          <input 
                            type="text"
                            placeholder="Screen fatigue or AP stress arrays..."
                            value={pitchTheme}
                            onChange={(e) => setPitchTheme(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-250"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase">TARGET PORTAL SECTION</label>
                          <select 
                            value={pitchCategory} 
                            onChange={(e) => setPitchCategory(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded text-xs p-1 text-zinc-350"
                          >
                            <option>Campus Life (Opinions)</option>
                            <option>Phantoms Sports</option>
                            <option>Studies</option>
                            <option>Events and Clubs</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="bg-rose-950/20 border border-rose-900 text-rose-350 text-[11px] p-2.5 rounded-lg">
                        ⚠️ {aiError}
                      </div>
                    )}

                    <button
                      onClick={runAiAssistant}
                      disabled={aiLoading}
                      className="w-full bg-amber-400 disabled:bg-zinc-800 text-zinc-950 font-mono text-[11=px] uppercase font-black py-2.5 tracking-wider hover:bg-amber-505 transition rounded-lg cursor-pointer"
                    >
                      {aiLoading ? "Consulting Gemini..." : "Consult AI Adviser"}
                    </button>
                  </div>
                </div>

                {/* AI Results Output (Col span 7) */}
                <div className="md:col-span-7 bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4 overflow-y-auto max-h-[480px]">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#e67e22] font-black">Advisory recommended output</span>
                    {aiAction === "draft" && aiDraftOutput && (
                      <button 
                        onClick={handleImportAiDraft}
                        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] px-3 py-1 font-mono uppercase font-black transition rounded-md"
                      >
                        Import Draft to Publisher
                      </button>
                    )}
                  </div>

                  {aiAction === "draft" && (
                    aiDraftOutput ? (
                      <div className="space-y-3 text-xs text-left">
                        <span className="text-[10px] font-mono text-amber-450 font-black tracking-wider uppercase">Author: {aiDraftOutput.byline}</span>
                        <h4 className="font-serif text-lg font-black text-zinc-100">{aiDraftOutput.headline}</h4>
                        <p className="font-serif italic text-zinc-450 text-xs">{aiDraftOutput.subheading}</p>
                        <div className="border-t border-zinc-800 pt-3 space-y-3.5 font-serif text-zinc-300 leading-relaxed text-sm">
                          {aiDraftOutput.paragraphs.map((p, key) => (
                            <p key={key}>{p}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="font-serif italic text-zinc-500 py-20 text-center text-xs">Press background details and hit Consult to dynamically auto-sentence a live draft!</p>
                    )
                  )}

                  {aiAction === "proofread" && (
                    aiProofOutput ? (
                      <div className="space-y-4 text-xs text-left">
                        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                          <span className="text-xl font-mono font-black text-emerald-400">{aiProofOutput.overallScore}</span>
                          <div>
                            <p className="text-[10px] font-mono uppercase text-zinc-400">Copy readiness Index</p>
                            <p className="text-[9px] text-zinc-500 leading-none font-mono">Scores evaluated against rigorous guidelines</p>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">Style Analysis</span>
                          <p className="font-serif italic text-zinc-300 bg-zinc-900 p-2.5 rounded border border-zinc-850 leading-relaxed mt-1">
                            {aiProofOutput.critique}
                          </p>
                        </div>

                        {aiProofOutput.suggestions && aiProofOutput.suggestions.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono text-amber-400 uppercase">Grammar corrections suggestions</span>
                            {aiProofOutput.suggestions.map((s, idx) => (
                              <div key={idx} className="bg-zinc-900 p-2 border border-dashed border-zinc-800 space-y-1">
                                <p className="text-[11px] line-through text-zinc-550 leading-none">"{s.original}"</p>
                                <p className="font-bold text-zinc-200 leading-tight">"{s.revised}"</p>
                                <p className="text-[9px] text-emerald-400 font-mono">Correction: {s.reason}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">Polished Copied production text</span>
                          <div className="p-3 bg-zinc-900 border border-zinc-800 font-serif leading-relaxed text-zinc-300 text-sm max-h-[160px] overflow-y-auto">
                            {aiProofOutput.polishedText}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="font-serif italic text-zinc-500 py-20 text-center text-xs">Pasted draft proof reviews will execute diagnostics instantly here.</p>
                    )
                  )}

                  {aiAction === "headlines" && (
                    aiHeadlinesOutput ? (
                      <div className="space-y-3">
                        {aiHeadlinesOutput.headlines.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setEditorFormHeadline(item.title);
                              setEditorFormSubheading(item.subtitle);
                              showToast("Linked headlines option straight into Composer!");
                            }}
                            className="bg-zinc-900 border border-zinc-850 p-3 rounded-lg hover:border-zinc-700 transition cursor-pointer text-left"
                          >
                            <span className="inline-block bg-zinc-800 text-zinc-400 text-[8px] font-mono px-1.5 py-0.2 rounded uppercase mb-1">{item.style}</span>
                            <h5 className="font-serif text-sm font-bold text-zinc-200 leading-snug">{item.title}</h5>
                            <p className="text-[10px] text-zinc-500 font-serif italic mt-0.5">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-serif italic text-zinc-500 py-20 text-center text-xs">Headline options suggestions will list here.</p>
                    )
                  )}

                  {aiAction === "pitches" && (
                    aiPitchesOutput ? (
                      <div className="space-y-3.5 text-left">
                        {aiPitchesOutput.ideas.map((idea, idx) => (
                          <div key={idx} className="bg-zinc-905 p-3.5 border-l-2 border-amber-400 border-y border-r border-zinc-800 text-xs space-y-1 rounded-r-lg">
                            <h5 className="font-serif text-sm font-black text-zinc-150">{idea.title}</h5>
                            <p className="text-[11px] text-zinc-350"><span className="font-bold text-zinc-200 uppercase font-mono text-[9px]">Scope:</span> {idea.angle}</p>
                            <p className="text-[10px] text-zinc-500 font-mono"><span className="text-zinc-450 font-bold uppercase">Sources:</span> {idea.sources}</p>
                            <p className="text-[10px] text-zinc-500 font-mono"><span className="text-zinc-450 font-bold uppercase">Actions / Tests:</span> {idea.methods}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-serif italic text-zinc-500 py-20 text-center text-xs">Pitched investigational briefs will document themselves here.</p>
                    )
                  )}

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* PORTAL CABINET DESK ADMINISTRATIVE DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs transition-opacity duration-300" id="portal-cabinet-sidebar-overlay">
          <div className="absolute inset-0" onClick={() => setSidebarOpen(false)}></div>
          
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250 z-50">
            
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-5">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-serif text-sm font-black uppercase tracking-tight text-zinc-100">Portal desk cabinet</h3>
                  <p className="text-[10px] font-mono tracking-widest text-zinc-500">ADMINISTRATIVE DIRECTORIES</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Close Cabinet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* Directory 0: Premium Editorial Cover Layout Theme */}
              <div className="space-y-2.5" id="theme-selection-drawer">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                  <Palette className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">SELECT PRESS THEME</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <button
                    onClick={() => changeTheme("purple-cream")}
                    className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition cursor-pointer ${
                      theme === "purple-cream"
                        ? "bg-purple-950/20 text-purple-300 border-purple-500 shadow-sm"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex items-center gap-1 font-bold">
                      <Sun className="h-3.5 w-3.5 text-amber-500" /> CREAM
                    </span>
                    <span className="text-[9px] text-zinc-500">Default Purple</span>
                  </button>
                  <button
                    onClick={() => changeTheme("purple-grey")}
                    className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition cursor-pointer ${
                      theme === "purple-grey"
                        ? "bg-purple-950/30 text-purple-200 border-purple-500 shadow-sm"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex items-center gap-1 font-bold">
                      <Moon className="h-3.5 w-3.5 text-purple-400" /> TWILIGHT
                    </span>
                    <span className="text-[9px] text-zinc-500">Dark Grey</span>
                  </button>
                </div>
              </div>

              {/* Directory 1: Circulations and metrics */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">&bull; Staff telemetry stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-zinc-550 block font-bold">CIRCULATION FLUX</span>
                    <span className="text-xs font-bold text-zinc-200">2,500 daily reads</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-zinc-550 block font-bold">WRITERS INDEX</span>
                    <span className="text-xs font-bold text-zinc-200">12 Active authors</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-zinc-550 block">LIVE STREAM CYCLES</span>
                    <span className="text-xs font-bold text-zinc-200">{articles.length} Broadcasts</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-zinc-550 block">METEORIC VECTOR</span>
                    <span className="text-xs font-bold text-yellow-500">⛅ Sunny 72°F</span>
                  </div>
                </div>
              </div>

              {/* Directory 2: Bookmark Drawer */}
              <div className="space-y-2.5" id="saved-shelf">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                  <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">BOOKMARKS SHELF ({bookmarkedIds.length})</span>
                </div>
                {bookmarkedIds.length > 0 ? (
                  <div className="space-y-2">
                    {articles.filter(a => bookmarkedIds.includes(a.id)).map((article) => (
                      <div 
                        key={article.id}
                        className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded-lg hover:border-zinc-700 transition cursor-pointer"
                        onClick={() => {
                          setSelectedArticle(article);
                          setSidebarOpen(false);
                        }}
                      >
                        <div className="flex flex-col max-w-[85%] text-left">
                          <span className="text-[8px] font-mono uppercase text-amber-450 font-bold">{article.category}</span>
                          <span className="font-serif text-xs font-bold text-zinc-200 line-clamp-1 group-hover:underline">
                            {article.headline}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookmarkedIds(bookmarkedIds.filter(id => id !== article.id));
                            showToast("Removed from Bookmarks.");
                          }}
                          className="text-zinc-500 hover:text-rose-500 p-1 rounded-sm cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 text-center rounded-lg">
                    <p className="text-[11px] font-serif italic text-zinc-500">
                      Bookmarks drawer empty. Pin articles from their modal view tabs!
                    </p>
                  </div>
                )}
              </div>

              {/* Directory 3: Copywrite Sandbox */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">&bull; Headline copywriter sandbox</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-805 p-3.5 rounded-lg space-y-3">
                  <textarea 
                    rows={3}
                    placeholder="Dry run heading draft structures here..."
                    value={draftTextForCounter}
                    onChange={(e) => setDraftTextForCounter(e.target.value)}
                    className="w-full text-xs p-2 bg-zinc-950 border border-zinc-800 rounded font-mono text-zinc-200"
                  />
                  <div className="grid grid-cols-3 gap-1 text-center font-mono text-[9px] text-zinc-450">
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-850">
                      <span>WORDS</span>
                      <span className="block text-xs font-bold text-zinc-350">{draftTextForCounter ? draftTextForCounter.trim().split(/\s+/).filter(Boolean).length : 0}</span>
                    </div>
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-850">
                      <span>CHARS</span>
                      <span className="block text-xs font-bold text-zinc-350">{draftTextForCounter.length}</span>
                    </div>
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-850">
                      <span>READ</span>
                      <span className="block text-xs font-bold text-zinc-350">{Math.ceil(draftTextForCounter.length / 15)}s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Directory 4: Anonymous Campus Tip Line */}
              <div className="space-y-2.5" id="campus-tipline">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                  <Send className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Anonymous campus tip line</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-810 p-4 space-y-3 rounded-xl text-left text-xs">
                  <p className="text-[10px] text-zinc-450 leading-relaxed font-mono uppercase">
                    Tips submitted remain fully discrete and anonymous for press safety.
                  </p>
                  <input
                    type="text"
                    placeholder="Subject Topic..."
                    value={tipTopic}
                    onChange={(e) => setTipTopic(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Investigation details..."
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!tipTopic.trim() || !tipMessage.trim()) return;
                      const newTip = {
                        id: Date.now(),
                        topic: tipTopic,
                        message: tipMessage,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      setSubmittedTips([newTip, ...submittedTips]);
                      setTipTopic("");
                      setTipMessage("");
                      showToast("Tip sent over secure dispatch server!");
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-mono text-[9px] font-bold uppercase py-1.5 transition rounded"
                  >
                    Send Tip safely
                  </button>
                  
                  {submittedTips.length > 0 && (
                    <div className="pt-2.5 border-t border-zinc-800 space-y-2 max-h-[140px] overflow-y-auto">
                      <span className="text-[8px] font-mono text-zinc-550 uppercase">LOG PILLS ({submittedTips.length})</span>
                      {submittedTips.map((tip) => (
                        <div key={tip.id} className="bg-zinc-950 p-2 border border-zinc-800 text-[10px]">
                          <div className="flex justify-between font-mono text-zinc-400 font-bold mb-0.5">
                            <span>📍 {tip.topic}</span>
                            <span>{tip.timestamp}</span>
                          </div>
                          <p className="font-serif italic text-zinc-350">{tip.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="border-t border-zinc-800 bg-zinc-900 p-6 text-center text-xs">
              <span className="text-zinc-500 font-mono">PLAYPEN PRESS CLEARANCE</span>
            </div>

          </div>
        </div>
      )}

      {/* PASSWORD PROMPT MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" id="password-verification-modal">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-4">
              <Lock className="h-5 w-5 text-amber-500 animate-pulse" />
              <h3 className="font-serif text-lg font-black text-zinc-100 uppercase tracking-wider">
                Editorial Authorization Required
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
              Access to editor-privileged controls is secure. Please input the editorial clearance password below to enable Editor Workspace.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === "reaquit") {
                  setIsEditorMode(true);
                  setUserRole("Editor");
                  setShowPasswordModal(false);
                  setPasswordInput("");
                  showToast("Editorial Mode Activated Successfully! 🗝️");
                } else {
                  showToast("Invalid Editorial Credentials.");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-mono uppercase font-black text-zinc-450 mb-1.5">
                  Editorial Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter editorial access key..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-400 text-zinc-100 placeholder-zinc-650 font-mono tracking-widest"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput("");
                  }}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-zinc-950 px-5 py-2 text-xs font-mono font-black uppercase transition shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" /> Unlock privileges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGHLIGHT POLAROID DETAIL MODAL */}
      {selectedGalleryPhoto && (
        <div 
          onClick={() => setSelectedGalleryPhoto(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200" 
          id="polaroid-highlight-modal"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="paper-crease-overlay bg-[#ede3d5] text-zinc-950 p-6 pt-5 pb-8 shadow-2xl rounded-xl border border-[#dbc9b6] w-full max-w-xl animate-in zoom-in-95 duration-200 select-none space-y-4 relative"
          >
            {/* Header Frame Row */}
            <div className="flex justify-between items-center border-b border-zinc-900/10 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-700 font-bold block">
                ★ Playpen Press Photo Lightroom
              </span>
              <button 
                onClick={() => setSelectedGalleryPhoto(null)}
                className="text-zinc-700 hover:text-zinc-950 p-1 bg-black/5 hover:bg-black/10 rounded-full cursor-pointer transition"
                title="Close Lightbox"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Polaroid Main Image */}
            <div className="aspect-video sm:aspect-[4/3] w-full bg-zinc-950 overflow-hidden rounded border border-black/10 shadow-inner flex items-center justify-center">
              <img 
                src={selectedGalleryPhoto.imageUrl} 
                className="max-w-full max-h-full object-contain" 
                alt="Selected gallery lightroom entry" 
              />
            </div>

            {/* Caption Context Description */}
            <div className="space-y-3 bg-[#e4d7c6] p-4 rounded border border-[#d2bcab]">
              <div className="font-serif text-sm italic leading-relaxed text-zinc-900">
                "{selectedGalleryPhoto.caption || "No captured caption details supplied. A student snapshot documenting student history."}"
              </div>

              {/* Related Article Shortcut Button */}
              {selectedGalleryPhoto.articleId && (
                <div className="pt-2 border-t border-zinc-900/10 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold">Associated Article:</span>
                  <button
                    onClick={() => {
                      const found = articles.find(art => art.id === selectedGalleryPhoto.articleId);
                      if (found) {
                        setSelectedArticle(found);
                        setSelectedGalleryPhoto(null);
                      } else {
                        showToast("Related research draft could not be localized.");
                      }
                    }}
                    className="font-mono text-[10px] uppercase font-bold text-amber-900 bg-amber-400/25 border border-amber-900/30 px-3 py-1 rounded-md hover:bg-amber-400/40 transition flex items-center gap-1 cursor-pointer"
                  >
                    Open Story Coverage &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Vintage Monospace metadata stamps */}
            <div className="pt-2 border-t border-zinc-900/15 flex flex-wrap justify-between items-center text-[10px] font-mono text-zinc-750 uppercase tracking-widest font-bold">
              <span>LEDGER DEPOSIT ID: {selectedGalleryPhoto.id.slice(0, 15)}</span>
              <span>Taken: {selectedGalleryPhoto.takenAt}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
