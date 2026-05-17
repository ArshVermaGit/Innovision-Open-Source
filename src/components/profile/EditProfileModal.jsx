"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { GithubIcon, LinkedinIcon, TwitterIcon, GlobeIcon, InstagramIcon, Save, X } from "lucide-react";

export default function EditProfileModal({ open, onOpenChange, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
    instagram: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        github: user.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
        twitter: user.socialLinks?.twitter || "",
        website: user.socialLinks?.website || "",
        instagram: user.socialLinks?.instagram || ""
      });
    }
  }, [user]);

  const calculateProfileCompletion = () => {
    const fields = [
      user?.name,
      user?.email,
      user?.image,
      user?.bio,
      user?.socialLinks?.github,
      user?.socialLinks?.linkedin,
      user?.socialLinks?.twitter,
      user?.socialLinks?.website,
      user?.socialLinks?.instagram
    ];
    const filledFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          socialLinks: {
            github: formData.github,
            linkedin: formData.linkedin,
            twitter: formData.twitter,
            website: formData.website,
            instagram: formData.instagram
          }
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
        onOpenChange(false);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and social media links
          </DialogDescription>
        </DialogHeader>

        {/* Profile Completion */}
        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Profile Completion</span>
            <span className="text-muted-foreground">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Complete your profile to unlock all features and improve your visibility
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Social Media Links</h3>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <GithubIcon className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="github"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <TwitterIcon className="h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <GlobeIcon className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
