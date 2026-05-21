"use client";
import { useEffect, useState, useContext } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Palette,
  Trophy,
  BarChart3,
  Upload,
  Flame,
  Sparkles,
  Code2,
  Youtube,
  BookOpen,
  Crown,
  MoonStar,
  Home,
  MessageSquare,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";
import xpContext from "@/contexts/xp";
import { useNightMode } from "@/contexts/nightMode";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Sub-components
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("light");
  const [streak, setStreak] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { xp, show, changed } = useContext(xpContext);
  const { nightMode, toggleNightMode } = useNightMode();
  const pathname = usePathname();

  const isActiveLink = (href) => {
    return pathname === href || (href === "/roadmap" && pathname === "/");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchStreak(user.email);
      fetchPremiumStatus(user.email);
    }
  }, [user]);

  const fetchPremiumStatus = async (email) => {
    try {
      const res = await fetch(`/api/premium/status`);
      const data = await res.json();
      setIsPremium(data.isPremium || false);
    } catch (error) {
      console.error("Error fetching premium status:", error);
    }
  };

  const fetchStreak = async (email) => {
    try {
      const res = await fetch(`/api/gamification/stats?userId=${email}`);
      const data = await res.json();
      setStreak(data.streak || 0);
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      window.location.replace("/");
    }
  };

  // Navigation items for logged-in users
  const createMenuItems = [
    { href: "/generate", label: "AI Course Generator", icon: Sparkles, description: "Create courses with AI" },
    { href: "/studio", label: "Course Studio", icon: Palette, description: "Design custom courses" },
    { href: "/content-ingestion", label: "Content Ingestion", icon: Upload, description: "Import existing content" },
    { href: "/youtube-course", label: "YouTube Course", icon: Youtube, description: "Learn from YouTube" },
  ];

  const learnMenuItems = [
    { href: "/roadmap", label: "My Courses", icon: Home, description: "Your learning dashboard" },
    { href: "/courses", label: "Browse Courses", icon: BookOpen, description: "Explore all courses" },
    { href: "/code-editor", label: "Code Editor", icon: Code2, description: "Practice coding" },
  ];

  const moreMenuItems = [
    { href: "/features", label: "Features", icon: Trophy, description: "Platform features" },
    { href: "/gamification", label: "Achievements", icon: Zap, description: "Badges & rewards" },
    { href: "/demo", label: "Demo", icon: BarChart3, description: "See how it works" },
    { href: "/contact", label: "Contact", icon: MessageSquare, description: "Get in touch" },
  ];

  // Landing page navigation
  const landingNavItems = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How It Works" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <header className="h-16 w-full border-b fixed top-0 left-0 bg-background/80 backdrop-blur-xl z-[100] border-border">
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between">
          {/* Logo - Left */}
          <Link
            href={user ? `/roadmap` : "/"}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <Image src="/InnoVision_LOGO-removebg-preview.png" alt="logo" width={28} height={28} className="sm:w-8 sm:h-8" />
            <span className="text-sm sm:text-base font-light text-foreground hidden min-[400px]:block">InnoVision</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <DesktopNav
            user={user}
            createMenuItems={createMenuItems}
            learnMenuItems={learnMenuItems}
            moreMenuItems={moreMenuItems}
            landingNavItems={landingNavItems}
            isActiveLink={isActiveLink}
          />

          {/* Right Section */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {user && (
              <>
                {/* Premium Badge */}
                {isPremium && (
                  <Link href="/premium" className="hidden lg:flex">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                      <Crown className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="text-xs font-light text-yellow-400">PRO</span>
                    </div>
                  </Link>
                )}

                {/* XP */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/10 cursor-help relative">
                      <Sparkles className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-xs font-light text-green-400">{xp}</span>
                      {show && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: -10 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-2 right-0 text-xs text-green-400 font-light"
                        >
                          +{changed}
                        </motion.span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border-white/10">
                    <p className="font-light text-white">Level {Math.floor(xp / 500) + 1}</p>
                    <p className="text-xs text-gray-400 font-light">{xp} XP earned</p>
                  </TooltipContent>
                </Tooltip>

                {/* Streak */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 cursor-help">
                      <Flame className={`h-3.5 w-3.5 ${streak >= 7 ? 'text-red-500' : 'text-orange-500'}`} />
                      <span className={`text-xs font-light ${streak >= 7 ? 'text-red-400' : 'text-orange-400'}`}>
                        {streak}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border-white/10">
                    <p className="font-light text-white">{streak} Day Streak!</p>
                    <p className="text-xs text-gray-400 font-light">Keep learning daily</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}


            {user && <NotificationBell />}

            {/* Theme Toggle - Always visible */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? <Moon className="h-4 w-4 sm:h-4 sm:w-4" /> : <Sun className="h-4 w-4 sm:h-4 sm:w-4" />}
            </Button>

            {/* Night Mode - Always visible */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleNightMode}
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted ${nightMode ? 'text-amber-400' : 'text-foreground'}`}
                  aria-label={nightMode ? "Disable night mode" : "Enable night mode"}
                >
                  <MoonStar className={`h-4 w-4 sm:h-4 sm:w-4 ${nightMode ? 'fill-amber-400' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background border-border">
                <p className="font-light text-foreground">Night Mode (Blue Light Filter)</p>
              </TooltipContent>
            </Tooltip>

            {/* User Menu or Login */}
            {user ? (
              <UserMenu
                user={user}
                isPremium={isPremium}
                xp={xp}
                streak={streak}
                theme={theme}
                nightMode={nightMode}
                toggleTheme={toggleTheme}
                toggleNightMode={toggleNightMode}
                signOutUser={signOutUser}
              />
            ) : (
              <Link href="/login" className="shrink-0">
                <Button size="sm" className="bg-transparent border border-border hover:bg-muted text-foreground h-8 px-4 text-xs sm:text-sm sm:h-9 sm:px-5 rounded-full font-light">
                  Get Started
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        user={user}
        createMenuItems={createMenuItems}
        learnMenuItems={learnMenuItems}
        moreMenuItems={moreMenuItems}
        landingNavItems={landingNavItems}
        isActiveLink={isActiveLink}
      />
    </>
  );
};

export default Navbar;