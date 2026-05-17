"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, Flag, GraduationCap, Loader2, BookOpen, Sparkles, Check, ChevronsUpDown, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { KARNATAKA_COLLEGES, ENGINEERING_BRANCHES, SEMESTERS } from "@/lib/engineering-data";
import { BRANCH_SUBJECTS } from "@/lib/engineering-subjects";
import { BRANCH_SUBJECTS_PART1 } from "@/lib/engineering-subjects-part1";
import { BRANCH_SUBJECTS_PART2 } from "@/lib/engineering-subjects-part2";
import { BRANCH_SUBJECTS_PART3 } from "@/lib/engineering-subjects-part3";
import { BRANCH_SUBJECTS_PART4 } from "@/lib/engineering-subjects-part4";
import { BRANCH_SUBJECTS_PART5 } from "@/lib/engineering-subjects-part5";
import { getAvailableStreams, getSubjectsByClassAndBoard } from "@/lib/curriculum-data";
import { PageBackground, GridPattern, ScrollReveal } from "@/components/ui/PageWrapper";

// Merge all branch subjects
const ALL_BRANCH_SUBJECTS = {
  ...BRANCH_SUBJECTS,
  ...BRANCH_SUBJECTS_PART1,
  ...BRANCH_SUBJECTS_PART2,
  ...BRANCH_SUBJECTS_PART3,
  ...BRANCH_SUBJECTS_PART4,
  ...BRANCH_SUBJECTS_PART5,
};
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth";
import { useNotifications } from "@/contexts/notifications";
import { useRouter } from "next/navigation";
import { loader } from "@/components/ui/Custom/ToastLoader";

//Select Card component
const SelectionCard = ({ options, selectedValue, onSelect, title }) => {
  return (
    <div className="space-y-2">
      <FormLabel className="text-sm font-medium">{title}</FormLabel>
      <div className="flex flex-wrap justify-center gap-2">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`
              p-4 border rounded-xl w-36 cursor-pointer transition-all duration-300
              ${selectedValue === option.value
                ? "border-blue-400 bg-blue-500/10 ring-1 ring-blue-400 scale-[1.02]"
                : "border-border/50 hover:bg-accent/60 hover:border-blue-400/50"
              }
            `}
          >
            <div className="text-center">
              <div className="font-semibold">{option.label}</div>
              {option.description && <div className="text-xs text-muted-foreground mt-1">{option.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");
  const [openCollege, setOpenCollege] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, courseCount: 0, maxCourses: 3 });
  const [engineeringData, setEngineeringData] = useState({
    college: "",
    branch: "",
    semester: "",
    subject: "",
    modules: ["", "", "", "", ""],
    pdfFile: null,
  });
  const [curriculumData, setCurriculumData] = useState({
    classLevel: "",
    board: "",
    stream: "",
    subject: "",
    topics: ["", "", ""],
  });
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const router = useRouter();
  const { showLoader } = loader();

  // Fetch premium status on mount
  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (user) {
        try {
          const res = await fetch("/api/premium/status");
          const data = await res.json();
          setPremiumStatus(data);
        } catch (error) {
          console.error("Error fetching premium status:", error);
        }
      }
    };
    fetchPremiumStatus();
  }, [user]);

  // Get available subjects based on selected branch and semester
  const availableSubjects =
    engineeringData.branch && engineeringData.semester
      ? ALL_BRANCH_SUBJECTS[engineeringData.branch]?.[engineeringData.semester] || []
      : [];

  const classLevels = [
    "LKG",
    "UKG",
    "CLASS_1",
    "CLASS_2",
    "CLASS_3",
    "CLASS_4",
    "CLASS_5",
    "CLASS_6",
    "CLASS_7",
    "CLASS_8",
    "CLASS_9",
    "CLASS_10",
    "CLASS_11",
    "CLASS_12",
  ];
  const boards = ["CBSE", "STATE"];

  // Get available streams for Class 11 and 12
  const availableStreams =
    curriculumData.classLevel && curriculumData.board
      ? getAvailableStreams(curriculumData.classLevel, curriculumData.board)
      : null;

  // Get available subjects based on class, board, and stream
  const availableCurriculumSubjects =
    curriculumData.classLevel && curriculumData.board
      ? getSubjectsByClassAndBoard(curriculumData.classLevel, curriculumData.board, curriculumData.stream || null)
      : [];

  // Debug log
  useEffect(() => {
    console.log("Curriculum Data:", curriculumData);
    console.log("Available Subjects:", availableCurriculumSubjects);
  }, [curriculumData, availableCurriculumSubjects]);

  const handleCurriculumSubmit = async () => {
    if (isSubmitting) return;
    // Check premium status for curriculum generation
    if (!premiumStatus.isPremium) {
      toast.error("Curriculum generation is only available for Premium users. Upgrade to access!");
      return;
    }

    if (!curriculumData.classLevel || !curriculumData.board) {
      toast.error("Please select class and board");
      return;
    }

    if (availableStreams && !curriculumData.stream) {
      toast.error("Please select a stream");
      return;
    }

    if (!curriculumData.subject) {
      toast.error("Please select a subject");
      return;
    }

    const filledTopics = curriculumData.topics.filter((t) => t.trim() !== "");
    if (filledTopics.length === 0) {
      toast.error("Please add at least one topic");
      return;
    }

    setIsSubmitting(true);

    const streamInfo = curriculumData.stream ? ` (${curriculumData.stream} stream)` : "";
    const prompt = `Generate a comprehensive curriculum course for ${curriculumData.subject
      } for ${curriculumData.classLevel.replace("_", " ")}${streamInfo} (${curriculumData.board} board). 
        Cover these topics: ${filledTopics.join(", ")}. 
        Include detailed explanations, examples, and age-appropriate learning activities.`;

    try {
      let res = await fetch("/api/user_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, difficulty: "balanced" }),
      });
      const roadmapData = await res.json();
      const id = roadmapData.id;

      if (!id) {
        toast.error("Failed to generate course");
        setIsSubmitting(false);
        return;
      }

      const interval = setInterval(async () => {
        let res = await fetch(`/api/roadmap/${id}`);
        let data = await res.json();
        if (data.process !== "pending") {
          if (data.process === "completed") {
            toast.success("Curriculum course generated successfully");
            showLoader();
            await fetchNotifications();
            router.push(`/roadmap/${id}`);
          } else {
            toast.error(data.message || "Failed to generate course");
            setIsSubmitting(false);
          }
          clearInterval(interval);
        }
      }, 3000);
    } catch (error) {
      toast.error("Error generating course");
      setIsSubmitting(false);
    }
  };

  const addCurriculumTopic = () => {
    setCurriculumData((prev) => ({
      ...prev,
      topics: [...prev.topics, ""],
    }));
  };

  const updateCurriculumTopic = (index, value) => {
    const newTopics = [...curriculumData.topics];
    newTopics[index] = value;
    setCurriculumData((prev) => ({
      ...prev,
      topics: newTopics,
    }));
  };

  const removeCurriculumTopic = (index) => {
    if (curriculumData.topics.length > 1) {
      const newTopics = curriculumData.topics.filter((_, i) => i !== index);
      setCurriculumData((prev) => ({
        ...prev,
        topics: newTopics,
      }));
    }
  };

  const handleEngineeringSubmit = async () => {
    if (isSubmitting) return;
    // Check premium status for engineering generation
    if (!premiumStatus.isPremium) {
      toast.error("Engineering course generation is only available for Premium users. Upgrade to access!");
      return;
    }

    if (!engineeringData.college || !engineeringData.branch || !engineeringData.semester || !engineeringData.subject) {
      toast.error("Please fill all required fields");
      return;
    }

    const filledModules = engineeringData.modules.filter((m) => m.trim() !== "");
    if (filledModules.length === 0) {
      toast.error("Please add at least one module");
      return;
    }

    setIsSubmitting(true);

    const prompt = `Generate a comprehensive engineering course for ${engineeringData.subject} in ${engineeringData.branch
      }, ${engineeringData.semester} at ${engineeringData.college}. 
        Cover these modules: ${filledModules.join(", ")}. 
        Include detailed explanations, examples, and practical applications for each module.`;

    try {
      let res = await fetch("/api/user_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, difficulty: "balanced" }),
      });
      const roadmapData = await res.json();
      const id = roadmapData.id;

      if (!id) {
        toast.error("Failed to generate course");
        setIsSubmitting(false);
        return;
      }

      const interval = setInterval(async () => {
        let res = await fetch(`/api/roadmap/${id}`);
        let data = await res.json();
        if (data.process !== "pending") {
          if (data.process === "completed") {
            toast.success("Engineering course generated successfully");
            showLoader();
            await fetchNotifications();
            router.push(`/roadmap/${id}`);
          } else {
            toast.error(data.message || "Failed to generate course");
            setIsSubmitting(false);
          }
          clearInterval(interval);
        }
      }, 3000);
    } catch (error) {
      toast.error("Error generating course");
      setIsSubmitting(false);
    }
  };

  const addModule = () => {
    setEngineeringData((prev) => ({
      ...prev,
      modules: [...prev.modules, ""],
    }));
  };

  const updateModule = (index, value) => {
    const newModules = [...engineeringData.modules];
    newModules[index] = value;
    setEngineeringData((prev) => ({
      ...prev,
      modules: newModules,
    }));
  };

  const removeModule = (index) => {
    if (engineeringData.modules.length > 1) {
      const newModules = engineeringData.modules.filter((_, i) => i !== index);
      setEngineeringData((prev) => ({
        ...prev,
        modules: newModules,
      }));
    }
  };

  const formSchema = z.object({
    concept: z.string().min(2, { message: "Concept must be at least 2 characters long" }).max(300, {
      message: "Concept must not exceed 300 characters.",
    }),
    knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"], {
      errorMap: () => ({ message: "Please select a knowledge level" }),
    }),
    timeCommitment: z.enum(["1-2-hours", "2-3-hours", "3-4-hours", "4-5-hours"], {
      errorMap: () => ({
        message: "Please select a time commitment",
      }),
    }),
    difficultyLevel: z.enum(["fast", "balanced", "in-depth"], {
      errorMap: () => ({ message: "Please select a difficulty level" }),
    }),
    completionTime: z.enum(["1-week", "2-weeks", "1-month", "2-months", "3-months", "6-months"], {
      errorMap: () => ({
        message: "Please select a completion time",
      }),
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      knowledgeLevel: "",
      timeCommitment: "1-2-hours",
      difficultyLevel: "",
      completionTime: "1-week",
    },
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!user) {
      toast.error("Please login to generate your course");
      setIsSubmitting(false);
      return;
    }

    try {
      const checkRes = await fetch("/api/roadmap/all");
      const checkData = await checkRes.json();

      const completedCount = checkData.docs.filter((e) => e.process === "completed").length;

      if (completedCount >= 6) {
        toast.error("You have reached the limit of 6 courses. Delete one to create a new one.");
        setIsSubmitting(false);
        return;
      }

      const prompt = `Generate a structured learning roadmap for "${data.concept}" 
Level: ${data.knowledgeLevel}
Style: ${data.difficultyLevel === "in-depth" ? "In-Depth" : data.difficultyLevel === "fast" ? "Fast-Paced" : "Balanced"}
Daily time: ${data.timeCommitment.replace("-", "–")}
Complete in: ${data.completionTime.replace("-", " ")}
Generate maximum chapters if 3-months or longer.
Include: chapter titles, descriptions, learning objectives, key topics.
Return valid JSON only.`;

      const res = await fetch("/api/user_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          difficulty: data.difficultyLevel,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.id) {
        toast.error(result.message || "Failed to start generation");
        setIsSubmitting(false);
        return;
      }

      toast.success("Generating your course...");

      // Poll for completion
      const interval = setInterval(async () => {
        try {
          const poll = await fetch(`/api/roadmap/${result.id}`);
          const status = await poll.json();

          if (status.process === "completed") {
            clearInterval(interval);
            toast.success("Course ready!");
            showLoader();
            await fetchNotifications();
            router.push(`/roadmap/${result.id}`);
          } else if (status.process === "error" || status.process === "unsuitable") {
            clearInterval(interval);
            toast.error(status.message || "Generation failed");
            setIsSubmitting(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

      // Auto cleanup after 2 minutes
      setTimeout(() => clearInterval(interval), 120000);
    } catch (error) {
      toast.error("Network error. Try again.");
      setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    for (const field in errors) {
      if (errors[field]?.message) {
        toast.error(errors[field].message);
      }
    }
  };

  const knowledgeLevelOptions = [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to the topic",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some prior knowledge",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Deep understanding",
    },
  ];

  const difficultyLevelOptions = [
    {
      value: "fast",
      label: "Fast-paced",
      description: "Rapid learning",
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Steady progress",
    },
    {
      value: "in-depth",
      label: "In-depth",
      description: "Comprehensive study",
    },
  ];

  useEffect(() => {
    if (isSubmitting) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [isSubmitting]);

  return (
    <div className="min-h-screen bg-background relative">
      <PageBackground />
      <GridPattern opacity={0.02} />

      {isSubmitting && (
        <div className="w-full h-screen flex flex-col gap-2 items-center justify-center fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500"></Loader2>
          </div>
          <p className="text-lg font-medium">Please wait while we generate your roadmap</p>
          <p className="text-sm text-muted-foreground">This may take a moment...</p>
        </div>
      )}
      <div className="mx-auto max-w-3xl py-10 relative z-10">
        <ScrollReveal>
          <div className="mb-8 text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Generation</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Course Generator</h1>
            <p className="mt-2 text-muted-foreground">Create your personalized learning journey</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="custom" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4" />
                Custom Topic
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="flex items-center gap-2 data-[state=active]:bg-background">
                <BookOpen className="h-4 w-4" />
                Curriculum
                {!premiumStatus.isPremium && (
                  <span className="ml-1 text-xs bg-linear-to-r from-yellow-500 to-orange-500 text-black px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="engineering" className="flex items-center gap-2 data-[state=active]:bg-background">
                <GraduationCap className="h-4 w-4" />
                Engineering
                {!premiumStatus.isPremium && (
                  <span className="ml-1 text-xs bg-linear-to-r from-yellow-500 to-orange-500 text-black px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom">
              <Card className="p-6 border-0 shadow-none bg-card/50 backdrop-blur-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="concept"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">Concept to Learn</FormLabel>
                          <FormDescription>What main topic would you like to learn?</FormDescription>
                          <FormControl>
                            <Input
                              className={"focus-visible:ring-blue-200 focus-visible:border-blue-400 bg-background/50 mt-2"}
                              placeholder="e.g., Trigonometry, Web development"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-6 max-sm:flex-col">
                      <FormField
                        control={form.control}
                        name="knowledgeLevel"
                        render={({ field }) => (
                          <FormItem>
                            <SelectionCard
                              options={knowledgeLevelOptions}
                              selectedValue={field.value}
                              onSelect={field.onChange}
                              title={
                                <div className="mb-3">
                                  <GraduationCap className="h-4 w-4 inline-block mr-2" />
                                  Current Knowledge Level
                                </div>
                              }
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeCommitment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center h-max gap-2">
                              <Clock className="h-4 w-4" />
                              Time Commitment
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time commitment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1-2-hours">1-2 hours per day</SelectItem>
                                <SelectItem value="2-3-hours">2-3 hours per day</SelectItem>
                                <SelectItem value="3-4-hours">3-4 hours per day</SelectItem>
                                <SelectItem value="4-5-hours">4-5 hours per day</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="flex gap-6 max-sm:flex-col">
                      <FormField
                        control={form.control}
                        name="difficultyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <SelectionCard
                              options={difficultyLevelOptions}
                              selectedValue={field.value}
                              onSelect={field.onChange}
                              title={
                                <div className="mb-3">
                                  <Flag className="h-4 w-4 inline-block mr-2" />
                                  Preferred Difficulty Level
                                </div>
                              }
                            />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="completionTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Target Completion Time
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select completion time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1-week">1 Week</SelectItem>
                                <SelectItem value="2-weeks">2 Weeks</SelectItem>
                                <SelectItem value="1-month">1 Month</SelectItem>
                                <SelectItem value="2-months">2 Months</SelectItem>
                                <SelectItem value="3-months">3 Months</SelectItem>
                                <SelectItem value="6-months">6 Months</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Generating Roadmap..." : "Generate My Learning Roadmap"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              <Card className="p-6 border-0 shadow-none">
                {!premiumStatus.isPremium && (
                  <div className="mb-6 p-5 bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">★</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Premium Feature</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Curriculum generation is available only for Premium users. Upgrade now for just ₹100/month!
                        </p>
                        <Button
                          onClick={() => router.push("/premium")}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Class Level</label>
                      <Select
                        value={curriculumData.classLevel}
                        onValueChange={(value) =>
                          setCurriculumData((prev) => ({
                            ...prev,
                            classLevel: value,
                            stream: "",
                            subject: "",
                          }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classLevels.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Board</label>
                      <Select
                        value={curriculumData.board}
                        onValueChange={(value) =>
                          setCurriculumData((prev) => ({
                            ...prev,
                            board: value,
                            stream: "",
                            subject: "",
                          }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.map((board) => (
                            <SelectItem key={board} value={board}>
                              {board}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stream Selection for Class 11 & 12 */}
                  {availableStreams && (
                    <div>
                      <label className="text-sm font-medium">Stream</label>
                      <p className="text-xs text-muted-foreground mb-2">Select your stream</p>
                      <div className="flex flex-wrap gap-2">
                        {availableStreams.map((stream) => (
                          <button
                            key={stream}
                            type="button"
                            onClick={() =>
                              setCurriculumData((prev) => ({
                                ...prev,
                                stream: stream,
                                subject: "",
                              }))
                            }
                            className={`px-4 py-2 rounded-lg border transition-all ${curriculumData.stream === stream
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent"
                              }`}
                          >
                            {stream}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subject Selection */}
                  <div>
                    <label className="text-sm font-medium">Select Subject</label>
                    <p className="text-xs text-muted-foreground mb-4">Choose from available subjects</p>
                    {!curriculumData.classLevel || !curriculumData.board ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Select class and board to view subjects</p>
                      </div>
                    ) : availableStreams && !curriculumData.stream ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Select a stream to view subjects</p>
                      </div>
                    ) : availableCurriculumSubjects.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">No subjects available</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-muted/10">
                        <div className="flex flex-wrap gap-1.5">
                          {availableCurriculumSubjects.map((subject) => (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => {
                                const subjectTopics =
                                  subject.topics && subject.topics.length > 0 ? subject.topics : ["", "", ""];
                                setCurriculumData((prev) => ({
                                  ...prev,
                                  subject: subject.name,
                                  topics: subjectTopics,
                                }));
                              }}
                              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${curriculumData.subject === subject.name
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background hover:bg-accent border"
                                }`}
                            >
                              {subject.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium">Topics to Cover</label>
                    <p className="text-xs text-muted-foreground mb-5">Define the topics for this subject</p>
                    <div className="space-y-2">
                      {curriculumData.topics.map((topic, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Topic ${index + 1}`}
                            value={topic}
                            onChange={(e) => updateCurriculumTopic(index, e.target.value)}
                            className="flex-1"
                          />
                          {curriculumData.topics.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCurriculumTopic(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addCurriculumTopic} className="mt-2">
                      + Add Topic
                    </Button>
                  </div>

                  <Button onClick={handleCurriculumSubmit} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Generating Course..." : "Generate Curriculum Course"}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="engineering">
              <Card className="p-6 border-0 shadow-none">
                {!premiumStatus.isPremium && (
                  <div className="mb-6 p-5 bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">★</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Premium Feature</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Engineering course generation is available only for Premium users. Upgrade now for just ₹100/month!
                        </p>
                        <Button
                          onClick={() => router.push("/premium")}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  {/* College and Branch Selection */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">College Name</label>
                      <Popover open={openCollege} onOpenChange={setOpenCollege}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCollege}
                            className="w-full justify-between mt-2 h-10"
                          >
                            <span className="truncate">{engineeringData.college || "Search college..."}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-100 p-0">
                          <Command>
                            <CommandInput placeholder="Search college..." />
                            <CommandEmpty>No college found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {KARNATAKA_COLLEGES.map((college) => (
                                <CommandItem
                                  key={college}
                                  value={college}
                                  onSelect={() => {
                                    setEngineeringData((prev) => ({ ...prev, college: college }));
                                    setOpenCollege(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      engineeringData.college === college ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {college}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Branch</label>
                      <Select
                        value={engineeringData.branch}
                        onValueChange={(value) => setEngineeringData((prev) => ({ ...prev, branch: value, subject: "" }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENGINEERING_BRANCHES.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Semester Selection */}
                  <div>
                    <label className="text-sm font-medium">Semester</label>
                    <Select
                      value={engineeringData.semester}
                      onValueChange={(value) => setEngineeringData((prev) => ({ ...prev, semester: value, subject: "" }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="text-sm font-medium">Select Subject</label>
                    <p className="text-xs text-muted-foreground mb-4">Choose from available subjects</p>
                    {!engineeringData.branch || !engineeringData.semester ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Select branch and semester to view subjects</p>
                      </div>
                    ) : availableSubjects.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">No subjects available</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-muted/10">
                        <div className="flex flex-wrap gap-1.5">
                          {availableSubjects.map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => setEngineeringData((prev) => ({ ...prev, subject: subject }))}
                              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${engineeringData.subject === subject
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background hover:bg-accent border"
                                }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Modules Section */}
                  <div>
                    <label className="text-sm font-medium">Course Modules</label>
                    <p className="text-xs text-muted-foreground mb-5">Define the topics/modules for this subject</p>
                    <div className="space-y-2">
                      {engineeringData.modules.map((module, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Module ${index + 1}`}
                            value={module}
                            onChange={(e) => updateModule(index, e.target.value)}
                            className="flex-1"
                          />
                          {engineeringData.modules.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(index)}>
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addModule} className="mt-2">
                      + Add Module
                    </Button>
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="text-sm font-medium">Syllabus PDF (Optional)</label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setEngineeringData((prev) => ({ ...prev, pdfFile: e.target.files[0] }))}
                      className="mt-2"
                    />
                  </div>

                  <Button onClick={handleEngineeringSubmit} className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300" disabled={isSubmitting}>
                    {isSubmitting ? "Generating Course..." : "Generate Engineering Course"}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollReveal>
      </div>
    </div>
  );
}
