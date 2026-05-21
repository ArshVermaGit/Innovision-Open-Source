"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  LogOut,
  Trophy,
  Crown,
  MoonStar,
  Settings,
  User,
  Sun,
  Moon,
} from "lucide-react";
import PremiumGoogleTranslate from "../PremiumGoogleTranslate";

/**
 * User menu dropdown component with profile, settings, and logout.
 */
const UserMenu = ({
  user,
  isPremium,
  xp,
  streak,
  theme,
  nightMode,
  toggleTheme,
  toggleNightMode,
  signOutUser,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Profile Avatar - Direct Link */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/profile" className="relative hidden sm:block">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-transparent hover:ring-blue-500/50 transition-all cursor-pointer">
              <AvatarImage src={user?.image || "/default-avatar.png"} alt={user?.name} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white text-sm font-light">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isPremium && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-yellow-500 flex items-center justify-center">
                <Crown className="h-2 w-2 text-black" />
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent className="bg-black border-white/10">
          <p className="font-light text-white">View Profile</p>
        </TooltipContent>
      </Tooltip>

      {/* Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-muted text-foreground" aria-label="Open settings">
            <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border-border">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-light text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground font-light truncate">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/gamification" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </Link>
          </DropdownMenuItem>

          {!isPremium && (
            <DropdownMenuItem asChild>
              <Link href="/premium" className="flex items-center gap-2 text-yellow-600">
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Mobile only stats */}
          <div className="sm:hidden px-2 py-1.5 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP</span>
              <span className="font-medium text-green-600">{xp}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Streak</span>
              <span className="font-medium text-orange-600">{streak} days</span>
            </div>
          </div>
          <DropdownMenuSeparator className="sm:hidden" />

          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm">Night Mode</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNightMode}
                aria-label={nightMode ? "Disable night mode" : "Enable night mode"}
              >
                <MoonStar className={`h-4 w-4 ${nightMode ? 'fill-amber-500' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Theme</span>
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground mb-1">Language</p>
            <PremiumGoogleTranslate />
          </div>

          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be logged out from your current session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white" onClick={signOutUser}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
