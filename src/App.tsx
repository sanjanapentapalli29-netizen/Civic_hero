import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  Building, 
  Compass, 
  FileCheck, 
  Award, 
  Volume2, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Play, 
  User, 
  Share2, 
  Flame, 
  Trash2, 
  X, 
  HelpCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Phone,
  ShieldCheck,
  Zap,
  Printer
} from "lucide-react";
import CameraCapture from "./components/CameraCapture";
import VoiceReporter from "./components/VoiceReporter";
import { Issue, CitizenProfile, Badge, CommunityHeroProfile, InspectionLog } from "./types";

// Static Badges List
const BADGES: Badge[] = [
  { id: "eco-warrior", name: "Eco Warrior", description: "Reported 3 or more sanitation/garbage piles", icon: "🌱", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "hawk-eye", name: "Hawk Eye", description: "Validated 5 neighbor complaints successfully", icon: "👁️", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "collaborator", name: "Collaborator", description: "Added 3 constructive municipal feedback comments", icon: "🤝", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "pothole-patrol", name: "Road Warden", description: "Successfully logged road potholes", icon: "🛡️", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "grand-pioneer", name: "Civic Vanguard", description: "Accumulated over 1000 reputation points", icon: "⭐", color: "bg-rose-100 text-rose-800 border-rose-200" }
];

export default function App() {
  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Reporting Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Garbage Dump");
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>("Medium");
  const [reportedBy, setReportedBy] = useState("Sanjana Pentapalli");
  const [imageUrl, setImageUrl] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [department, setDepartment] = useState("Greater Hyderabad Municipal Corporation (GHMC)");
  const [submitting, setSubmitting] = useState(false);
  const [isAiClassifying, setIsAiClassifying] = useState(false);

  // Geolocation
  const [location, setLocation] = useState({ lat: 17.4062, lng: 78.4691, address: "Lakdikapul Road, Hyderabad" });
  const [gpsStatus, setGpsStatus] = useState<"inactive" | "loading" | "active">("inactive");

  // Comments / Interactivity
  const [commentText, setCommentText] = useState("");

  // Gamification User State
  const [profile, setProfile] = useState<CitizenProfile>({
    name: "Sanjana Pentapalli",
    xp: 680,
    level: 4,
    completedReports: 2,
    validationsPerformed: 4,
    unlockedBadges: ["eco-warrior", "collaborator"]
  });

  // SMS Simulator State
  const [smsSender, setSmsSender] = useState("+91 99402 12345");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsLogs, setSmsLogs] = useState<string[]>([]);
  const [isSmsSending, setIsSmsSending] = useState(false);

  // Mini-game State ("Block Cleaner Sweep")
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [litterItems, setLitterItems] = useState<{ id: number; type: string; x: number; y: number }[]>([]);
  const [gameUnlockedBadge, setGameUnlockedBadge] = useState(false);

  // API Dispatch Visualizer Modal
  const [apiLogModal, setApiLogModal] = useState<any | null>(null);

  // Certificate Modal
  const [showCertificate, setShowCertificate] = useState(false);

  // Community Hero Program States
  const [guardianProfile, setGuardianProfile] = useState<CommunityHeroProfile>({
    name: "Sanjana Pentapalli",
    age: 52,
    assignedRoad: "Road No 36, Jubilee Hills, Hyderabad",
    monthlyStipend: 5000,
    status: "active", // 'none' | 'applied' | 'active'
    reportedCount: 1,
    resolvedCount: 1,
    inspectionHistory: [
      { date: "2026-06-20", roadStatus: "clear", notes: "Completed morning walk from Metro pillar 10 to Road 36 junction. All garbage bins are clean and street lights are perfectly operational." },
      { date: "2026-06-15", roadStatus: "issue-logged", notes: "Identified a severe asphalt crack near Gachibowli flyover entrance. Filed complaint for GHMC action crew dispatch." }
    ]
  });
  const [guardianAge, setGuardianAge] = useState<number>(55);
  const [guardianRoad, setGuardianRoad] = useState<string>("Road No 45, Jubilee Hills, Hyderabad");
  const [inspectionStatus, setInspectionStatus] = useState<'clear' | 'issue-logged' | 'verified'>("clear");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [guardianSuccessMsg, setGuardianSuccessMsg] = useState<string | null>(null);
  const [guardianErrorMsg, setGuardianErrorMsg] = useState<string | null>(null);

  // Fetch reports on mount
  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        if (data.length > 0 && !selectedIssue) {
          setSelectedIssue(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load issues", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Hydrate custom locations
  const handleQuickLocation = (address: string, lat: number, lng: number) => {
    setLocation({ lat, lng, address });
    setGpsStatus("active");
  };

  // Get current device position
  const getDeviceLocation = () => {
    setGpsStatus("loading");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({
            lat,
            lng,
            address: `${lat.toFixed(4)} N, ${lng.toFixed(4)} E (Captured Live via Mobile GPS Sensor)`
          });
          setGpsStatus("active");
        },
        (error) => {
          console.warn("Geolocation failed, using fallback Hyderabad coordinate.", error);
          setLocation({
            lat: 17.4374 + (Math.random() - 0.5) * 0.05,
            lng: 78.4482 + (Math.random() - 0.5) * 0.05,
            address: "Jubilee Hills, Road No 45, Hyderabad (Approximate Cellular Triangulation)"
          });
          setGpsStatus("active");
        }
      );
    } else {
      setGpsStatus("inactive");
    }
  };

  // Trigger AI analysis on current form inputs manually
  const triggerManualAiClassify = async () => {
    if (!description && !title) return;
    setIsAiClassifying(true);
    try {
      const queryText = title ? `${title}. ${description}` : description;
      const res = await fetch("/api/parse-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: queryText })
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || title);
        setCategory(data.category || category);
        setDescription(data.description || description);
        setUrgency(data.urgency || urgency);
        setDepartment(data.department || department);
      }
    } catch (error) {
      console.error("Manual AI parsing error", error);
    } finally {
      setIsAiClassifying(false);
    }
  };

  // Upvote / Validate complaint
  const handleVote = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user-sanjana-29" })
      });

      if (res.ok) {
        const updated = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updated : i));
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(updated);
        }

        // Award Rep to current user for validation task
        setProfile(prev => {
          const alreadyVoted = selectedIssue?.votedUserIds?.includes("user-sanjana-29");
          const validationDelta = alreadyVoted ? -1 : 1;
          const xpBonus = alreadyVoted ? -15 : 15;
          let newBadges = [...prev.unlockedBadges];
          const newValids = Math.max(0, prev.validationsPerformed + validationDelta);
          
          if (newValids >= 5 && !newBadges.includes("hawk-eye")) {
            newBadges.push("hawk-eye");
          }

          return {
            ...prev,
            xp: Math.max(0, prev.xp + xpBonus),
            level: Math.floor((prev.xp + xpBonus) / 200) + 1,
            validationsPerformed: newValids,
            unlockedBadges: newBadges
          };
        });
      }
    } catch (err) {
      console.error("Error upvoting issue", err);
    }
  };

  // Submit Complaint Form
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        urgency,
        reportedBy,
        location,
        imageUrl: imageUrl || undefined,
        voiceTranscript: voiceTranscript || undefined,
        department
      };

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setIssues([created, ...issues]);
        setSelectedIssue(created);

        // Reset fields
        setTitle("");
        setDescription("");
        setImageUrl("");
        setVoiceTranscript("");

        // Reward Citizen with XP and potentially Eco-Warrior Badge
        setProfile(prev => {
          const reportsCount = prev.completedReports + 1;
          const xpBonus = 100; // Large reward for filing a solid case
          let badges = [...prev.unlockedBadges];
          
          if (reportsCount >= 3 && !badges.includes("eco-warrior")) {
            badges.push("eco-warrior");
          }

          return {
            ...prev,
            completedReports: reportsCount,
            xp: prev.xp + xpBonus,
            level: Math.floor((prev.xp + xpBonus) / 200) + 1,
            unlockedBadges: badges
          };
        });
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger External API transmission simulator
  const handleSimulatedGhmcSubmit = async (issue: Issue) => {
    try {
      const res = await fetch("/api/ghmc-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issue)
      });
      if (res.ok) {
        const logData = await res.json();
        setApiLogModal(logData);
      }
    } catch (err) {
      console.error("Municipal transmission failed", err);
    }
  };

  // SMS Simulator Action
  const handleSendSimulatedSms = async () => {
    if (!smsMessage.trim()) return;
    setIsSmsSending(true);
    try {
      const res = await fetch("/api/sms-receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: smsSender, messageText: smsMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setSmsLogs(data.logs);
        setSmsMessage("");
        fetchIssues(); // Refresh reports list because SMS auto-logs a report!
      }
    } catch (err) {
      console.error("SMS simulated gateway offline", err);
    } finally {
      setIsSmsSending(false);
    }
  };

  // Comment submission
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !commentText.trim()) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: profile.name, text: commentText })
      });

      if (res.ok) {
        const updated = await res.json();
        setIssues(issues.map(i => i.id === selectedIssue.id ? updated : i));
        setSelectedIssue(updated);
        setCommentText("");

        // Earn XP for collaborative discussion
        setProfile(prev => {
          const newXP = prev.xp + 25;
          return {
            ...prev,
            xp: newXP,
            level: Math.floor(newXP / 200) + 1
          };
        });
      }
    } catch (err) {
      console.error("Comment failed to submit", err);
    }
  };

  // Simulate Ward Officer resolving the issue
  const simulateOfficerResolution = async (issueId: string) => {
    try {
      const resolvedPics = [
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600"
      ];
      
      const res = await fetch(`/api/issues/${issueId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolvedImageUrl: resolvedPics[Math.floor(Math.random() * resolvedPics.length)],
          notes: "The municipal cleanup patrol has thoroughly scrubbed the spot, disposed of hazardous waste safely, and verified cleanliness standard compliance.",
          updatedBy: "Ward Sanitation Officer V. Satyanarayana"
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updated : i));
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(updated);
        }

        // Award resolution rep bonus
        setProfile(prev => {
          const newXP = prev.xp + 75;
          return {
            ...prev,
            xp: newXP,
            level: Math.floor(newXP / 200) + 1
          };
        });
      }
    } catch (err) {
      console.error("Resolution simulation failed", err);
    }
  };

  // Sweep Minigame Logic
  const startSweepGame = () => {
    setGameActive(true);
    setGameScore(0);
    setGameUnlockedBadge(false);
    // Populate 8 items of litter on the virtual road
    const items = [
      { id: 1, type: "plastic_bottle", x: 15, y: 30 },
      { id: 2, type: "aluminum_can", x: 75, y: 20 },
      { id: 3, type: "paper_cup", x: 45, y: 65 },
      { id: 4, type: "plastic_bag", x: 80, y: 70 },
      { id: 5, type: "rotten_food", x: 25, y: 80 },
      { id: 6, type: "rust_can", x: 60, y: 40 },
      { id: 7, type: "cardboard", x: 90, y: 25 },
      { id: 8, type: "soda_can", x: 10, y: 60 },
    ];
    setLitterItems(items);
  };

  const sweepItem = (itemId: number) => {
    setLitterItems(prev => {
      const next = prev.filter(item => item.id !== itemId);
      const points = gameScore + 10;
      setGameScore(points);

      // Check win condition
      if (next.length === 0) {
        setGameUnlockedBadge(true);
        // Reward citizen profile
        setProfile(curr => {
          const badges = [...curr.unlockedBadges];
          if (!badges.includes("grand-pioneer")) {
            badges.push("grand-pioneer");
          }
          return {
            ...curr,
            xp: curr.xp + 150, // Massive XP for mini game victory
            level: Math.floor((curr.xp + 150) / 200) + 1,
            unlockedBadges: badges
          };
        });
      }
      return next;
    });
  };

  const handleApplyGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardianErrorMsg(null);
    setGuardianSuccessMsg(null);

    if (guardianAge < 50) {
      setGuardianErrorMsg("Eligibility Requirement: The Community Heroes Program is specialized to empower and support experienced citizens aged 50 and above. Please enter an age of 50 or older to register.");
      return;
    }

    setGuardianProfile({
      name: profile.name,
      age: guardianAge,
      assignedRoad: guardianRoad,
      monthlyStipend: 5000,
      status: "active",
      reportedCount: 0,
      resolvedCount: 0,
      inspectionHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          roadStatus: "clear",
          notes: `Program initiation check on ${guardianRoad}. Initiated daily vigil protocols.`
        }
      ]
    });

    setGuardianSuccessMsg(`Success! You have been officially registered as the Road Representative of "${guardianRoad}". You will receive a monthly stipend of ₹5,000 for maintaining oversight and filing road checks.`);
    
    // Reward registration bonus XP
    setProfile(prev => {
      const newXP = prev.xp + 50;
      return {
        ...prev,
        xp: newXP,
        level: Math.floor(newXP / 200) + 1
      };
    });
  };

  const handleLogInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardianErrorMsg(null);
    setGuardianSuccessMsg(null);

    if (!inspectionNotes.trim()) {
      setGuardianErrorMsg("Please enter detailed inspection logs to describe the current state of your assigned road.");
      return;
    }

    const log: InspectionLog = {
      date: new Date().toISOString().split('T')[0],
      roadStatus: inspectionStatus,
      notes: inspectionNotes
    };

    setGuardianProfile(prev => ({
      ...prev,
      inspectionHistory: [log, ...prev.inspectionHistory]
    }));

    setGuardianSuccessMsg("Inspection log recorded successfully! You have been awarded +50 Civic XP for performing your official representative duty.");
    setInspectionNotes("");

    // Award XP
    setProfile(prev => {
      const newXP = prev.xp + 50;
      return {
        ...prev,
        xp: newXP,
        level: Math.floor(newXP / 200) + 1
      };
    });

    // If "Issues Found", auto-fill registrar values to assist them!
    if (inspectionStatus === "issue-logged") {
      setTitle(`Hazard Identified: ${guardianProfile.assignedRoad}`);
      setDescription(`Official Representative Inspection Log: ${inspectionNotes}`);
      setLocation(prev => ({
        ...prev,
        address: guardianProfile.assignedRoad
      }));
      setGpsStatus("active");
    }
  };

  const handleOptOutGuardian = () => {
    setGuardianProfile(prev => ({
      ...prev,
      status: "none"
    }));
    setGuardianSuccessMsg("You have opted out of the Community Heroes Program. Thank you for your service.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none" id="civic-hero-root">
      
      {/* 1. Header Navigation */}
      <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-sm z-10" id="global-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none animate-bounce">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Civic Hero <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Hyderabad Hub</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Identify. Validate. Track. Clean.</p>
          </div>
        </div>

        {/* Global Stats / Leaderboard profile info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.name}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-end gap-1">
              <Award className="w-3.5 h-3.5" />
              Level {profile.level} • Neighborhood Hero
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setShowCertificate(true)}
            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg p-2 flex items-center gap-1.5 text-xs font-bold transition duration-200 cursor-pointer"
            id="open-cert-btn"
          >
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">My Certificate</span>
          </button>
          
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white dark:border-slate-850 shadow-md flex items-center justify-center text-white font-extrabold text-sm relative">
            SP
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] text-white font-bold animate-ping">
              🔥
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-6 overflow-y-auto max-w-7xl mx-auto w-full" id="dashboard-layout">
        
        {/* LEFT COMPONENT: Real-time Reports Feed & Tracking Console */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="complaints-feed-panel">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Neighborhood Issues
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Verify & support local citizen reports</p>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 text-[10px] font-extrabold rounded uppercase tracking-wider animate-pulse">
                Live Feed
              </span>
            </div>

            {/* List scroll container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {issues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <Clock className="w-8 h-8 text-slate-300 animate-spin mb-2" />
                  <p className="text-xs text-slate-500">Contacting Municipal API database...</p>
                </div>
              ) : (
                issues.map((issue) => {
                  const hasVoted = issue.votedUserIds?.includes("user-sanjana-29");
                  return (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedIssue?.id === issue.id
                          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 shadow-md ring-1 ring-blue-500"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800"
                      }`}
                      id={`issue-card-${issue.id}`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                          issue.status === 'resolved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : issue.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : issue.status === 'validated'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {issue.status}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3" />
                          {new Date(issue.createdAt).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {issue.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {issue.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {issue.category}
                        </span>
                        
                        {/* Vote/Verify indicator */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(issue.id);
                            }}
                            className={`px-2 py-1 rounded flex items-center gap-1 font-bold transition ${
                              hasVoted
                                ? "bg-emerald-500 text-white"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-800 border border-slate-200 dark:border-slate-700"
                            }`}
                            title="Upvote to Validate Issue"
                            id={`upvote-btn-${issue.id}`}
                          >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{issue.votes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SMS Simulation Triage Gateway Panel */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-500 animate-pulse" />
              Cellular SMS Gateway Simulator
            </h3>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Hyderabad citizens without smartphones can SMS reports to our cellular trunk. Tap below to simulate SMS ingestion powered by AI triage!
            </p>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Citizen Contact No.</label>
                  <input
                    type="text"
                    value={smsSender}
                    onChange={(e) => setSmsSender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-mono"
                    id="sms-sender-input"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Gateway Endpoint</label>
                  <input
                    type="text"
                    disabled
                    value="+91 800-SMART-CIVIC"
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-slate-400 rounded-lg p-2 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Message Text</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="e.g., Plastic trash dumped near Jubilee Hills Metro station Pillar 12"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs h-16 resize-none"
                  id="sms-msg-textarea"
                />
              </div>

              <button
                type="button"
                onClick={handleSendSimulatedSms}
                disabled={isSmsSending || !smsMessage.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                id="send-simulated-sms-btn"
              >
                {isSmsSending ? "Triaging Text..." : "Simulate Incoming SMS Message"}
                <ArrowRight className="w-3 h-3" />
              </button>

              {smsLogs.length > 0 && (
                <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-2.5 rounded-lg border border-slate-800 max-h-32 overflow-y-auto mt-2">
                  <p className="text-emerald-400 font-bold mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span>GATEWAY TRACE LOG</span>
                    <span className="text-[7px]">OK 200</span>
                  </p>
                  {smsLogs.map((log, idx) => (
                    <div key={idx} className="mb-1 leading-relaxed">{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: Interactive Smart Reporting Console */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6" id="smart-reporting-console">
          
          {/* Main Reporting Form Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-md border border-slate-200 dark:border-slate-850 p-5 md:p-6 flex flex-col relative">
            <div className="flex items-start justify-between mb-4 border-b border-slate-100 dark:border-slate-900 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600 animate-spin" />
                  Smart Complaint Registrar
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Use AI analysis on voice, photos or text inputs</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${gpsStatus === 'active' ? 'bg-blue-600 animate-ping' : 'bg-amber-500'}`}></span>
                <span className="text-[10px] font-extrabold uppercase tracking-tight">
                  GPS: {gpsStatus === 'active' ? "LOCATED" : gpsStatus === 'loading' ? "FETCHING..." : "MANUAL"}
                </span>
              </div>
            </div>

            {/* Tabs for capturing input */}
            <form onSubmit={handleSubmitReport} className="space-y-4" id="civic-report-form">
              
              {/* Image capture area */}
              <CameraCapture 
                onCapture={(base64) => setImageUrl(base64)} 
                savedImage={imageUrl} 
              />

              {/* Voice interface area */}
              <VoiceReporter
                onTranscriptChange={(txt) => setVoiceTranscript(txt)}
                onParsedResult={(aiData) => {
                  setTitle(aiData.title);
                  setCategory(aiData.category);
                  setDescription(aiData.description);
                  setUrgency(aiData.urgency);
                  setDepartment(aiData.department);
                }}
              />

              {/* Manual Title & Description Inputs */}
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Complaint Title
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">(Auto pre-filled by AI or manual)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Concise title (e.g. Garbage Dump near Banjara Hills Rd 10)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    id="complaint-title-input"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Detailed Incident Description
                    </label>
                    {description && (
                      <button
                        type="button"
                        onClick={triggerManualAiClassify}
                        disabled={isAiClassifying}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1 hover:underline"
                        id="auto-refine-ai-btn"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {isAiClassifying ? "Analyzing..." : "Auto-Refine details"}
                      </button>
                    )}
                  </div>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide depth here or use our AI Voice transcription tool above to generate it perfectly!"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 h-20 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    id="complaint-desc-input"
                  />
                </div>
              </div>

              {/* Category & Urgency Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold"
                    id="category-select"
                  >
                    <option value="Garbage Dump">Garbage Dump</option>
                    <option value="Drainage & Sewerage">Drainage & Sewerage</option>
                    <option value="Street Lighting">Street Lighting</option>
                    <option value="Road Repairs">Road Repairs</option>
                    <option value="Water Clogging">Water Clogging</option>
                    <option value="Public Safety">Public Safety</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Estimated Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold"
                    id="urgency-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Hazards)</option>
                  </select>
                </div>
              </div>

              {/* Department Routing Panel */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start gap-2.5">
                <Building className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Routed Municipal Department</p>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 mt-0.5"
                    id="department-route-input"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Smart-routed according to category matching algorithms</p>
                </div>
              </div>

              {/* Location Input Section */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-5/50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    GPS Geo-Coordinates Location
                  </label>
                  <button
                    type="button"
                    onClick={getDeviceLocation}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    id="auto-gps-btn"
                  >
                    <Compass className="w-3 h-3 animate-spin" />
                    Auto GPS
                  </button>
                </div>

                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="e.g. Road No 36, Near Oakridge, Banjara Hills, Hyderabad"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-2 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                  id="location-address-input"
                />

                {/* Quick Hyderabad Landmarks */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[9px] text-slate-400 font-bold self-center mr-1">LANDMARKS:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickLocation("Road No 10, Banjara Hills, Hyderabad", 17.4156, 78.4345)}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 px-2 py-0.5 rounded font-medium"
                    id="landmark-banjara"
                  >
                    Banjara Hills
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLocation("DLF Cyber City Junction, Gachibowli", 17.4483, 78.3741)}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 px-2 py-0.5 rounded font-medium"
                    id="landmark-gachibowli"
                  >
                    Gachibowli
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLocation("KPHB Colony Main Gate, Kukatpally", 17.4855, 78.3885)}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 px-2 py-0.5 rounded font-medium"
                    id="landmark-kukatpally"
                  >
                    Kukatpally
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !title || !description}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1"
                  id="submit-report-form-btn"
                >
                  {submitting ? "Logging complaint..." : "Submit Complaint to Civic Ledger"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: Gamification Achievements & Selected Ticket Workspace */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-6" id="achievements-and-details">
          
          {/* User Gamified Profile Stats */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center justify-between">
              <span>Citizen Achievements</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </h3>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0 animate-pulse">
                🏆
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Reputation</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {profile.xp} <span className="text-[10px] font-extrabold text-amber-500">XP</span>
                </p>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-900 pt-3">
              <div className="flex justify-between text-[11px] font-extrabold">
                <span className="text-slate-800 dark:text-slate-300">Level {profile.level}</span>
                <span className="text-blue-600 font-mono">{(profile.xp % 200)} / 200 XP to Level Up</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${((profile.xp % 200) / 200) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">{profile.completedReports}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Reported</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">{profile.validationsPerformed}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Validated</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">{profile.unlockedBadges.length}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Badges</p>
              </div>
            </div>
          </div>

          {/* ACTIVE ELDERS / COMMUNITY HERO REPRESENTATIVES PROGRAM CARD */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-950 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
            
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-900 pb-2.5">
              <div>
                <h3 className="text-[12px] font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Community Heroes
                </h3>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Active Elders Program (50+ Years)</p>
              </div>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                Stipend Model
              </span>
            </div>

            {guardianProfile.status === "active" ? (
              <div className="space-y-4">
                {/* Active Dashboard Info */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-extrabold uppercase flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Certified Hero Representative
                    </span>
                    <span className="text-xs font-bold text-blue-600">₹5,000 / month</span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 font-semibold uppercase text-[9px] leading-tight">Community Hero Representative</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{guardianProfile.name} (Age {guardianProfile.age})</p>
                    
                    <p className="text-slate-500 font-semibold uppercase text-[9px] leading-tight mt-2">Assigned Road Reach</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{guardianProfile.assignedRoad}</p>
                  </div>
                </div>

                {/* Log road patrol activity form */}
                <form onSubmit={handleLogInspection} className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-850">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Log Road Patrol Check</h4>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectionStatus("clear")}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition ${
                        inspectionStatus === "clear"
                          ? "bg-green-100 text-green-800 border-green-500"
                          : "bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      🟢 All Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionStatus("issue-logged")}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition ${
                        inspectionStatus === "issue-logged"
                          ? "bg-rose-100 text-rose-800 border-rose-500"
                          : "bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      🚨 Log Hazard
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectionStatus("verified")}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition ${
                        inspectionStatus === "verified"
                          ? "bg-amber-100 text-amber-800 border-amber-500"
                          : "bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      👁️ Verify Ticket
                    </button>
                  </div>

                  <div>
                    <textarea
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      placeholder="Enter specific physical inspection details (e.g., 'Checked potholes between Metro Pillar 10 and Peddamma Temple. All dry and safe.')"
                      className="w-full h-16 p-2 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 rounded-lg shadow transition"
                  >
                    Submit Official Representative Log
                  </button>
                </form>

                {/* Guardian Notifications feedback */}
                {guardianSuccessMsg && (
                  <p className="text-[10px] text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-300 p-2 rounded-lg border border-green-200/20">
                    {guardianSuccessMsg}
                  </p>
                )}

                {/* Patrol History Logs */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-850 pt-2.5">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Recent Rep Patrol Logs</span>
                    <span className="font-mono text-[9px] text-slate-400">{guardianProfile.inspectionHistory.length} Recorded</span>
                  </h4>
                  
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1" id="guardian-log-scroller">
                    {guardianProfile.inspectionHistory.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-850 text-[10px] leading-tight">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-slate-400">{item.date}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            item.roadStatus === "clear"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              : item.roadStatus === "verified"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}>
                            {item.roadStatus}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium italic">"{item.notes}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOptOutGuardian}
                  className="w-full text-slate-400 hover:text-rose-600 text-[9px] font-bold text-center uppercase tracking-wider cursor-pointer"
                >
                  Request Program Deassignment
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  The Telangana Municipal Administration department awards <b>monthly income of ₹5,000</b> to citizens aged <b>50 and above</b> to represent, watch over, and verify roads in their immediate neighborhoods.
                </p>

                <form onSubmit={handleApplyGuardian} className="space-y-2.5">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1 uppercase">Your Age (Eligibility check)</label>
                    <input
                      type="number"
                      min="30"
                      max="110"
                      value={guardianAge}
                      onChange={(e) => setGuardianAge(parseInt(e.target.value) || 0)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 block mb-1 uppercase">Represented Road Name</label>
                    <select
                      value={guardianRoad}
                      onChange={(e) => setGuardianRoad(e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold"
                    >
                      <option value="Road No 36, Jubilee Hills, Hyderabad">Road No 36, Jubilee Hills</option>
                      <option value="Road No 45, Jubilee Hills, Hyderabad">Road No 45, Jubilee Hills</option>
                      <option value="Gachibowli DLF Main Road, Hyderabad">Gachibowli DLF Main Road</option>
                      <option value="Begumpet Main Flyover Road, Hyderabad">Begumpet Main Flyover Road</option>
                      <option value="Kukatpally Metro Stretch, Hyderabad">Kukatpally Metro Stretch</option>
                    </select>
                  </div>

                  {guardianErrorMsg && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                      {guardianErrorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg shadow-sm transition cursor-pointer"
                  >
                    Apply & Claim Road Watch Area
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Clean-Up Sweep Arcade Interactive Game */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between z-10">
              <span>Block Cleaner Sweep Mini-game</span>
              <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded font-extrabold">XP +150</span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-3 z-10 leading-relaxed">
              Earn premium medals and reputation! Clear virtual plastic containers, rusted cans, and trash off Hyderabad lanes:
            </p>

            {gameActive ? (
              <div className="relative h-44 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col" id="arcade-game-arena">
                <div className="p-1.5 bg-slate-800 text-white text-[9px] font-mono flex justify-between z-10 shrink-0">
                  <span>CLEAN-UP SCORE: <b className="text-emerald-400">{gameScore} pts</b></span>
                  <span>LITTER LEFT: <b>{litterItems.length} items</b></span>
                </div>

                <div className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]"></div>
                  
                  {litterItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => sweepItem(item.id)}
                      style={{ left: `${item.x}%`, top: `${item.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-150 transition active:scale-90 animate-pulse bg-white/20 dark:bg-black/30 p-1.5 rounded-full border border-white/10"
                      title={`Click to Sweep ${item.type}`}
                      id={`litter-item-${item.id}`}
                    >
                      {item.type === "plastic_bottle" || item.type === "plastic_bag" ? "🥤" : item.type === "aluminum_can" || item.type === "rust_can" || item.type === "soda_can" ? "🥫" : "🗑️"}
                    </button>
                  ))}

                  {litterItems.length === 0 && (
                    <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center">
                      <ShieldCheck className="w-8 h-8 text-amber-400 animate-bounce mb-1" />
                      <p className="text-xs font-black text-white">LANE SCRUBBED DRY!</p>
                      <p className="text-[9px] text-emerald-300 mt-1">Excellent performance. Earned +150 Civic Rep & Unlocked "Civic Vanguard" Master Badge!</p>
                      <button
                        type="button"
                        onClick={startSweepGame}
                        className="mt-3 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-[10px] py-1 px-3 rounded-lg shadow-md transition"
                        id="replay-game-btn"
                      >
                        Sweep Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startSweepGame}
                className="w-full border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 hover:bg-emerald-50/10 hover:border-emerald-500 transition text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                id="start-arcade-btn"
              >
                <Zap className="w-7 h-7 text-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Start virtual Sweep Arcade Game</span>
                <span className="text-[9px] text-slate-500">Instant XP to unlock prestigious printable certifications</span>
              </button>
            )}
          </div>

          {/* Badges Grid Collection */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-850 p-5 flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">
              Unlocked Badges & Medals
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              {BADGES.map((badge) => {
                const isUnlocked = profile.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isUnlocked
                        ? `${badge.color} shadow-sm font-semibold`
                        : "bg-slate-50/40 border-slate-200/50 opacity-40 dark:bg-slate-900/10 border-dashed"
                    }`}
                    title={badge.description}
                    id={`badge-cell-${badge.id}`}
                  >
                    <div className="text-xl mb-1.5">{badge.icon}</div>
                    <span className="text-[10px] leading-tight font-extrabold tracking-tight uppercase">
                      {badge.name}
                    </span>
                    <span className="text-[8px] text-slate-500 font-medium leading-tight mt-0.5 mt-auto">
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 3. Bottom Selected Case Workspace & API Console Details */}
      {selectedIssue && (
        <section className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 p-6 shadow-2xl relative z-10 shrink-0" id="issue-workspace-viewer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Case Details Columns */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 text-[10px] font-extrabold rounded-md font-mono uppercase">
                  TICKET ID: {selectedIssue.id.substring(0, 10).toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                  selectedIssue.urgency === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Urgency: {selectedIssue.urgency}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-950 dark:text-white leading-tight">
                {selectedIssue.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedIssue.description}
              </p>

              {/* Geo location visualizer details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850 text-xs flex gap-2">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Report Location Coordinate</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">{selectedIssue.location.address}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Lat: {selectedIssue.location.lat.toFixed(6)} | Lng: {selectedIssue.location.lng.toFixed(6)}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote(selectedIssue.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedIssue.votedUserIds?.includes("user-sanjana-29")
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                  }`}
                  id={`workspace-vote-${selectedIssue.id}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedIssue.votedUserIds?.includes("user-sanjana-29") ? "You Validated!" : "Validate / Agree"}</span>
                </button>

                {selectedIssue.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => simulateOfficerResolution(selectedIssue.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    id={`workspace-resolve-${selectedIssue.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Officer Resolved Spot</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSimulatedGhmcSubmit(selectedIssue)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 dark:shadow-none"
                  id={`workspace-api-dispatch-${selectedIssue.id}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Interactive API Gateway Dispatch</span>
                </button>
              </div>
            </div>

            {/* Evidence Image Columns */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Evidence Photo Attachment</label>
              {selectedIssue.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-44 shadow-sm">
                  <img
                    src={selectedIssue.imageUrl}
                    alt={selectedIssue.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedIssue.resolvedImageUrl && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase shadow-md animate-pulse">
                      Cleaned Spot Photo Attached
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400 min-h-36">
                  <span className="text-2xl mb-1">📷</span>
                  <p className="text-[11px] font-bold text-slate-500">No Image Evidence Attached</p>
                  <p className="text-[9px] mt-0.5 opacity-85">Click retake in registrar to associate snaps</p>
                </div>
              )}

              {/* Resolved Image Toggle if available */}
              {selectedIssue.resolvedImageUrl && (
                <div className="mt-3.5">
                  <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-2">Verified Resolution Photo</label>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 bg-black aspect-video max-h-44 shadow-md">
                    <img
                      src={selectedIssue.resolvedImageUrl}
                      alt="Resolved Sanitation Cleanliness"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status Tracking History Timeline */}
            <div className="md:col-span-4 border-l border-slate-100 dark:border-slate-900 md:pl-6">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Live Status Progression Trace</label>
              
              <div className="relative border-l border-slate-200 dark:border-slate-850 ml-2.5 space-y-4">
                {selectedIssue.history?.map((step, idx) => (
                  <div key={idx} className="relative pl-5" id={`timeline-step-${idx}`}>
                    <span className="absolute -left-1.5 top-1 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-white dark:ring-slate-950" />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                      <span className="uppercase text-slate-900 dark:text-slate-200 font-bold">{step.status}</span>
                      <span>{new Date(step.changedAt).toLocaleTimeString("en-IN", { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.notes}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Logged by: {step.updatedBy}
                    </p>
                  </div>
                ))}
              </div>

              {/* Comments Section */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-900">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Citizen & Authority Discussion</p>
                <div className="space-y-2 max-h-24 overflow-y-auto mb-3 pr-1">
                  {selectedIssue.comments?.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No comments filed yet. Be the first to advise.</p>
                  ) : (
                    selectedIssue.comments?.map((c) => (
                      <div key={c.id} className="text-[11px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-150 dark:border-slate-850">
                        <span className="font-bold text-slate-800 dark:text-slate-200 mr-1.5">{c.author}:</span>
                        <span className="text-slate-600 dark:text-slate-300">{c.text}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask officers or share status updates..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    id="comment-text-input"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg text-xs font-bold transition disabled:opacity-50"
                    id="post-comment-btn"
                  >
                    Send
                  </button>
                </form>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 4. Footer Status Bar */}
      <footer className="h-10 bg-slate-900 text-slate-300 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 text-[10px] font-medium z-10" id="global-footer">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span> 
            GHMC API Live Gateway Online
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> 
            Cellular SMS Triangulator Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span> 
            AI Classifier Gemini-3.5-flash
          </span>
        </div>
        <div className="text-slate-500 font-mono tracking-tighter">
          ID: CIVIC-HERO-HYD-5803 • LOCALHOST:3000
        </div>
      </footer>

      {/* --- POPUP MODAL: Interactive API Dispatch Visualizer --- */}
      {apiLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="api-log-modal-container">
          <div className="bg-slate-950 border border-blue-900/40 rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl relative">
            <button
              type="button"
              onClick={() => setApiLogModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              id="close-api-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
              <h3 className="text-base font-black text-white font-mono">GHMC/HMWS MUNICIPAL API DISPATCH TRACE</h3>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Below is the active JSON communication trace sent from your Civic Hero browser container directly to Hyderabad's municipal routing server gateway.
            </p>

            <div className="space-y-4 font-mono text-[10px] max-h-96 overflow-y-auto">
              
              {/* Endpoint Called */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-blue-400 font-bold">API POST ENDPOINT:</span>
                <p className="text-slate-200 mt-1">{apiLogModal.apiEndpoint}</p>
              </div>

              {/* Request Headers */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-purple-400 font-bold">REQUEST CLIENT HEADERS:</span>
                <pre className="text-slate-300 mt-1 overflow-x-auto">
                  {JSON.stringify(apiLogModal.headersSent, null, 2)}
                </pre>
              </div>

              {/* JSON Payload Sent */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold">RAW COMPLAINT PAYLOAD:</span>
                <pre className="text-slate-300 mt-1 overflow-x-auto">
                  {JSON.stringify(apiLogModal.requestPayload, null, 2)}
                </pre>
              </div>

              {/* Server Response Received */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold">OFFICIAL MUNICIPAL RESPONSE (201 CREATED):</span>
                <pre className="text-emerald-200 mt-1 overflow-x-auto">
                  {JSON.stringify(apiLogModal.response, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-900 flex justify-end">
              <button
                type="button"
                onClick={() => setApiLogModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition"
                id="close-api-trace-btn"
              >
                Conclude Transmission Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: Citizen Certificate of Service --- */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="certificate-modal-container">
          <div className="bg-white border-8 border-emerald-800 rounded-3xl max-w-2xl w-full p-8 text-center shadow-2xl relative text-slate-900" id="certificate-view">
            <button
              type="button"
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
              id="close-cert-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Border decoration */}
            <div className="border-2 border-amber-500 p-6 flex flex-col items-center">
              <Compass className="w-12 h-12 text-emerald-700 mb-2 animate-spin" />
              
              <h2 className="text-xs font-black tracking-widest text-emerald-800 uppercase">
                GOVERNMENT OF TELANGANA
              </h2>
              <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                DEPARTMENT OF MUNICIPAL ADMINISTRATION & URBAN DEVELOPMENT
              </h3>

              <h1 className="text-2xl font-serif font-black text-slate-800 my-4 tracking-tight border-b-2 border-double border-slate-300 pb-1 w-full">
                Certificate of Civic Service
              </h1>

              <p className="text-xs font-serif italic text-slate-600">
                This prestigious award is proudly conferred to honor the diligent civic responsibility of
              </p>

              <h4 className="text-xl font-bold text-slate-950 my-3 tracking-wide underline decoration-amber-500 underline-offset-4">
                {profile.name}
              </h4>

              <p className="text-[11px] text-slate-600 max-w-lg leading-relaxed mb-6 font-serif">
                For outstanding community collaboration, meticulous neighborhood monitoring, and active sanitation upvotes via the <b>Civic Hero Platform</b>. By validating {profile.validationsPerformed} issues, publishing {profile.completedReports} formal complaint tickets, and accumulating <b>{profile.xp} Reputation Points</b>, you have rendered invaluable service in maintaining clean, safe, and hygienic neighborhood blocks across Greater Hyderabad.
              </p>

              <div className="grid grid-cols-2 gap-12 w-full pt-4 border-t border-slate-200 text-left">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 font-mono">VERIFICATION ID:</p>
                  <p className="text-xs font-bold font-mono text-slate-800">TX-HYD-MAUD-9923841</p>
                  <p className="text-[8px] text-slate-400 mt-1">Verify status at: ghmc.gov.in/civic-hero-validation</p>
                </div>
                <div className="text-right flex flex-col items-end justify-end">
                  <div className="text-xs font-serif font-bold text-slate-800">Shri M. Dana Kishore, IAS</div>
                  <div className="text-[8px] text-slate-400">Principal Secretary to Government, MA&UD Dept</div>
                  <div className="w-16 h-8 border border-dashed border-emerald-600 mt-1.5 flex items-center justify-center text-[8px] font-bold text-emerald-700 uppercase tracking-tight">
                    SEALED APEX
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-4">
              <p className="text-[10px] text-slate-400 font-medium self-center text-left max-w-xs">
                *Level 4 or higher required to unlock printable government certification. Share to motivate your neighbors!
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  id="print-cert-btn"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificate(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                  id="close-cert-success-btn"
                >
                  Splendid!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
