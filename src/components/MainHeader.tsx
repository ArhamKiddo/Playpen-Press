import { Newspaper, PenTool, Sparkles, Shield, Menu, Eye, Edit3, Search } from "lucide-react";

interface MainHeaderProps {
  currentCategory: string;
  setCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openLab: () => void;
  openPublish: () => void;
  userRole: "Viewer" | "Editor";
  onChangeRole: (role: "Viewer" | "Editor") => void;
  openSidebar: () => void;
  onTabChange: (tab: "home" | "gallery" | "archive") => void;
  currentTab: "home" | "gallery" | "archive";
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  siteTitle?: string;
  setSiteTitle?: (title: string) => void;
  editorSubMode?: "Layout Designer" | "Text Editor";
  isEditorMode?: boolean;
}

export default function MainHeader({
  searchQuery,
  setSearchQuery,
  openLab,
  openPublish,
  userRole,
  onChangeRole,
  openSidebar,
  onTabChange,
  currentTab,
  sidebarExpanded,
  setSidebarExpanded,
  siteTitle = "The Playpen Press",
  setSiteTitle,
  editorSubMode,
  isEditorMode,
}: MainHeaderProps) {
  
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b-4 border-double border-zinc-800 bg-zinc-950 text-zinc-100 py-4" id="main-editorial-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Premium Top bar for Role Switcher Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-800 pb-3 gap-3 text-xs font-mono uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold">Vol. XLIV, No. 12</span>
            <span className="text-zinc-600">•</span>
            <span>Cozy Press Lounge</span>
          </div>

          {/* DYNAMIC ROLE SWITCHER PREFERRED AT THE VERY TOP OF THE PAGE */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 p-1.5 rounded-lg shadow-inner" id="role-toggle-container">
            <span className="text-[10px] font-bold text-zinc-400 font-mono px-2 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-amber-400" /> MODE PREVIEW:
            </span>
            <button
              onClick={() => onChangeRole("Viewer")}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition duration-150 flex items-center gap-1 cursor-pointer ${
                userRole === "Viewer"
                  ? "bg-amber-400 text-zinc-900 border border-amber-300 shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              id="role-btn-viewer"
            >
              <Eye className="h-3 w-3" />
              Reader View (Viewer)
            </button>
            <button
              onClick={() => onChangeRole("Editor")}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition duration-150 flex items-center gap-1 cursor-pointer ${
                userRole === "Editor"
                  ? "bg-emerald-500 text-zinc-950 border border-emerald-400 shadow-md font-extrabold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              id="role-btn-editor"
            >
              <Edit3 className="h-3 w-3" />
              Editor View (CMS) ✍️
            </button>
          </div>

          <div className="font-semibold text-zinc-200">
            {formattedDate}
          </div>
        </div>

        {/* Masthead Hero Cover */}
        <div className="flex flex-col items-center justify-between py-6 md:flex-row gap-6 border-b border-zinc-800">
          
          <div className="flex items-center gap-3 order-2 md:order-1">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="group p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition duration-150 cursor-pointer flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
              id="sidebar-toggle-button"
              title="Toggle Left Sidebar"
            >
              <Menu className="h-4.5 w-4.5 text-zinc-400 group-hover:text-amber-400" />
              <span className="font-bold text-zinc-300 group-hover:text-zinc-100">Sections</span>
            </button>

            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => {
                const isWriting = isEditorMode && editorSubMode === "Text Editor";
                if (!isWriting) {
                  onTabChange("home");
                }
              }}
              id="masthead-logo-container"
            >
              <Newspaper className="h-10 w-10 text-amber-400 stroke-[1.5]" />
              <div className="flex flex-col">
                <span 
                  contentEditable={isEditorMode && editorSubMode === "Text Editor"}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent || "";
                    if (setSiteTitle && val) {
                      setSiteTitle(val);
                    }
                  }}
                  onClick={(e) => {
                    if (isEditorMode && editorSubMode === "Text Editor") {
                      e.stopPropagation();
                    }
                  }}
                  className={`font-title text-3xl font-black uppercase tracking-tighter text-zinc-100 sm:text-4xl hover:text-amber-400 transition focus:outline-none focus:ring-1 focus:ring-amber-400 rounded ${
                    (isEditorMode && editorSubMode === "Text Editor") 
                      ? "border border-dashed border-amber-400/40 hover:border-amber-400 p-0.5 cursor-text" 
                      : ""
                  }`}
                >
                  {siteTitle}
                </span>
                <span className="font-serif text-xs italic tracking-widest text-zinc-400 uppercase leading-none pl-1">
                  A Cozy Campus Hearth &amp; Bulletin
                </span>
              </div>
            </div>
          </div>

          {/* Tab Subnavigation Links (Home vs All Past News Archive) */}
          <div className="flex gap-4 order-3 text-xs font-mono uppercase font-bold tracking-wider">
            <button
              onClick={() => onTabChange("home")}
              className={`pb-1 border-b-2 transition ${currentTab === "home" ? "border-amber-400 text-amber-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
            >
              Home Frontpage
            </button>
            <button
              onClick={() => onTabChange("gallery")}
              className={`pb-1 border-b-2 transition ${currentTab === "gallery" ? "border-amber-400 text-amber-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
            >
              Gallery &amp; Photos 📷
            </button>
            <button
              onClick={() => onTabChange("archive")}
              className={`pb-1 border-b-2 transition ${currentTab === "archive" ? "border-amber-400 text-amber-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
            >
              All News Archive
            </button>
          </div>

          {/* Action Buttons: Lab & Submit Story */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 order-1 md:order-4">
            
            {/* Editorial AI Lab button is ONLY visible if user is an Editor! */}
            {userRole === "Editor" && (
              <button
                onClick={openLab}
                className="group flex items-center gap-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50 px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-indigo-900 transition duration-150 shadow-sm cursor-pointer"
                id="ai-labs-nav-button"
              >
                <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400 animate-pulse" />
                <span>Editorial AI Lab</span>
              </button>
            )}

            {/* Submit Story is open to everyone! (No lock indicator or locks shown) */}
            <button
              onClick={openPublish}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition duration-150 cursor-pointer"
              id="submit-story-nav-button"
            >
              <PenTool className="h-4 w-4 text-amber-400" />
              <span>Submit Story</span>
            </button>

            {/* Right sidebar Portal cabinet control desk */}
            <button
              onClick={openSidebar}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-805 transition"
              title="Open Desk"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Search Band */}
        <div className="flex items-center justify-between gap-4 pt-3 text-xs">
          <div className="flex items-center gap-2 relative w-full max-w-sm">
            <Search className="h-4 w-4 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news, reviews, and archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <span className="hidden md:inline text-[11px] font-mono text-zinc-500">
            THE PLAYPEN PRESS &bull; 100% COFFEE-BREWED AND HOMEGROWN CAMPUS BULLETIN
          </span>
        </div>

      </div>
    </header>
  );
}
