import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// JSON database file
const DATA_FILE = path.join(process.cwd(), "reports.json");

// Helper to seed reports
const SEED_ISSUES = [
  {
    id: "seed-1",
    title: "Major Garbage Accumulation Near School",
    description: "A huge pile of garbage has been accumulating next to the primary school gate. It attracts street dogs, flies, and emits a foul odor making it extremely unhygienic for the young students.",
    category: "Garbage Dump",
    urgency: "High",
    status: "validated",
    votes: 24,
    votedUserIds: ["anon-1", "anon-2"],
    reportedBy: "Karthik Sharma",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    location: {
      lat: 17.4156,
      lng: 78.4345,
      address: "Road No 10, Near Oakridge School, Banjara Hills, Hyderabad"
    },
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    department: "Greater Hyderabad Municipal Corporation (GHMC)",
    history: [
      {
        status: "reported",
        changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Issue reported by citizen.",
        updatedBy: "Karthik Sharma"
      },
      {
        status: "validated",
        changedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Verified and upvoted by 20+ community members.",
        updatedBy: "System (Community Verification)"
      }
    ],
    comments: [
      {
        id: "c1",
        author: "Meera Reddy",
        text: "Yes, this is very dangerous! My children walk by this every single morning.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "c2",
        author: "Municipal Inspector",
        text: "Assigned to Ward No. 92 sanitation officer. Clean-up scheduled for this week.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "seed-2",
    title: "Dangerous Open Sewer Cover on Main Road",
    description: "The concrete cover of the storm drain is broken and wide open on the main traffic junction. It poses a fatal threat to cyclists and pedestrians, especially after sunset.",
    category: "Drainage & Sewerage",
    urgency: "Critical",
    status: "in-progress",
    votes: 45,
    votedUserIds: ["anon-1", "anon-3", "anon-4"],
    reportedBy: "Srinivas Rao",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    location: {
      lat: 17.4483,
      lng: 78.3741,
      address: "DLF Cybercity Road, Gachibowli, Hyderabad"
    },
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
    department: "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWS&SB)",
    history: [
      {
        status: "reported",
        changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Sewer hazard reported.",
        updatedBy: "Srinivas Rao"
      },
      {
        status: "validated",
        changedAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Urgency bumped to Critical due to high traffic zone validation.",
        updatedBy: "Community Validator Bot"
      },
      {
        status: "in-progress",
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Work order raised. HMWS&SB repair crew dispatched with barricades.",
        updatedBy: "Assistant Commissioner (HMWS&SB)"
      }
    ],
    comments: [
      {
        id: "c3",
        author: "Vikram Sen",
        text: "Almost crashed my scooter into this yesterday. Thank you for flagging!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "seed-3",
    title: "Street Lights Out on Block-C Stretch",
    description: "A block of 5 street lights is completely non-functional. The entire residential road is pitch black, leading to safety concerns for ladies and senior citizens during evening walks.",
    category: "Street Lighting",
    urgency: "Medium",
    status: "reported",
    votes: 8,
    votedUserIds: [],
    reportedBy: "Ananya Patel",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    location: {
      lat: 17.4298,
      lng: 78.4112,
      address: "Road No 36, Near Metro Station, Jubilee Hills, Hyderabad"
    },
    imageUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=600",
    department: "Telangana State Southern Power Distribution Company (TSSPDCL)",
    history: [
      {
        status: "reported",
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Electrical outage logged.",
        updatedBy: "Ananya Patel"
      }
    ],
    comments: []
  },
  {
    id: "seed-4",
    title: "Clogged Inflow Channel Flooding Gated Community Entry",
    description: "Heavy plastic and leaf clogging has completely blocked the storm channel, causing minor flooding across the road even after brief rains.",
    category: "Water Clogging",
    urgency: "Medium",
    status: "resolved",
    votes: 38,
    votedUserIds: ["anon-5"],
    reportedBy: "Praveen Kumar",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: {
      lat: 17.4855,
      lng: 78.3885,
      address: "Phase 4, KPHB Colony, Kukatpally, Hyderabad"
    },
    imageUrl: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=600",
    resolvedImageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600",
    department: "Greater Hyderabad Municipal Corporation (GHMC)",
    history: [
      {
        status: "reported",
        changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Inflow blockage reported.",
        updatedBy: "Praveen Kumar"
      },
      {
        status: "validated",
        changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Community upvotes verify safety concern.",
        updatedBy: "System"
      },
      {
        status: "in-progress",
        changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "GHMC disaster management force (DRF) team assigned.",
        updatedBy: "GHMC Admin"
      },
      {
        status: "resolved",
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "DRF team successfully cleared plastic bags, trash, and silt. Water is flowing smoothly.",
        updatedBy: "Inspector Jagadeesh"
      }
    ],
    comments: [
      {
        id: "c4",
        author: "Kalyan G",
        text: "Fantastic job! The road is completely dry and safe now. Thank you, GHMC DRF!",
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

function readReports(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to read reports file, using seeds", error);
  }
  // Initialize with seed data
  writeReports(SEED_ISSUES);
  return SEED_ISSUES;
}

function writeReports(reports: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write reports file", error);
  }
}

// Ensure database file is seeded immediately
readReports();

// --- API ENDPOINTS ---

// Get all reports
app.get("/api/issues", (req, res) => {
  const reports = readReports();
  res.json(reports);
});

// Create new report
app.post("/api/issues", (req, res) => {
  const newReport = {
    id: "issue-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    votes: 0,
    votedUserIds: [],
    history: [
      {
        status: "reported",
        changedAt: new Date().toISOString(),
        notes: "Civic complaint registered successfully in the system.",
        updatedBy: req.body.reportedBy || "Citizen"
      }
    ],
    comments: [],
    ...req.body,
    createdAt: new Date().toISOString()
  };

  const reports = readReports();
  reports.unshift(newReport);
  writeReports(reports);

  res.status(201).json(newReport);
});

// Upvote / Validate a report
app.post("/api/issues/:id/vote", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[index];
  if (!report.votedUserIds) report.votedUserIds = [];

  const uid = userId || "anonymous";
  const userHasVoted = report.votedUserIds.includes(uid);

  if (userHasVoted) {
    // Unvote
    report.votedUserIds = report.votedUserIds.filter((u: string) => u !== uid);
    report.votes = Math.max(0, report.votes - 1);
  } else {
    // Vote
    report.votedUserIds.push(uid);
    report.votes += 1;

    // Auto promote status from reported to validated if votes reach a threshold
    if (report.status === "reported" && report.votes >= 5) {
      report.status = "validated";
      report.history.push({
        status: "validated",
        changedAt: new Date().toISOString(),
        notes: "Community verification successfully validated this neighborhood issue.",
        updatedBy: "System (Community Consensus)"
      });
    }
  }

  writeReports(reports);
  res.json(report);
});

// Resolve an issue
app.post("/api/issues/:id/resolve", (req, res) => {
  const { id } = req.params;
  const { resolvedImageUrl, notes, updatedBy } = req.body;
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[index];
  report.status = "resolved";
  if (resolvedImageUrl) {
    report.resolvedImageUrl = resolvedImageUrl;
  }
  
  report.history.push({
    status: "resolved",
    changedAt: new Date().toISOString(),
    notes: notes || "The issue has been marked resolved after cleanup/repair operations.",
    updatedBy: updatedBy || "Civic Warden"
  });

  writeReports(reports);
  res.json(report);
});

// Update issue status (reported -> validated -> in-progress -> resolved)
app.post("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, notes, updatedBy } = req.body;
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[index];
  report.status = status;
  report.history.push({
    status: status,
    changedAt: new Date().toISOString(),
    notes: notes || `Status updated to ${status}.`,
    updatedBy: updatedBy || "Municipal Authority"
  });

  writeReports(reports);
  res.json(report);
});

// Add comment to an issue
app.post("/api/issues/:id/comment", (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[index];
  const newComment = {
    id: "comment-" + Date.now() + "-" + Math.floor(Math.random() * 100),
    author: author || "Citizen Partner",
    text: text,
    createdAt: new Date().toISOString()
  };

  report.comments.push(newComment);
  writeReports(reports);
  res.status(201).json(report);
});

// --- AI INTELLIGENT ROUTING & CATEGORIZATION ENDPOINT ---

app.post("/api/parse-issue", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Missing text to parse" });
  }

  if (!ai) {
    // Mock fall-back parsing if API key is not yet set
    const lowerText = text.toLowerCase();
    let category = "General Concern";
    let department = "Greater Hyderabad Municipal Corporation (GHMC)";
    let urgency: "Low" | "Medium" | "High" | "Critical" = "Medium";
    let title = "Neighborhood Issue";

    if (lowerText.includes("garbage") || lowerText.includes("trash") || lowerText.includes("waste") || lowerText.includes("clean")) {
      category = "Garbage Dump";
      department = "Greater Hyderabad Municipal Corporation (GHMC)";
      title = "Sanitation & Garbage Accumulation";
      urgency = "High";
    } else if (lowerText.includes("sewer") || lowerText.includes("drain") || lowerText.includes("water leak") || lowerText.includes("pipes")) {
      category = "Drainage & Sewerage";
      department = "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWS&SB)";
      title = "Sewer Spill or Drain Blockage";
      urgency = "Critical";
    } else if (lowerText.includes("light") || lowerText.includes("dark") || lowerText.includes("bulb") || lowerText.includes("lamp")) {
      category = "Street Lighting";
      department = "Telangana State Southern Power Distribution Company (TSSPDCL)";
      title = "Streetlight Blackout Outage";
      urgency = "Medium";
    } else if (lowerText.includes("road") || lowerText.includes("pothole") || lowerText.includes("asphalt") || lowerText.includes("crack")) {
      category = "Road Repairs";
      department = "GHMC Road Infrastructure Engineering Division";
      title = "Severe Pothole Maintenance";
      urgency = "High";
    }

    return res.json({
      title: title,
      category: category,
      description: text,
      urgency: urgency,
      department: department,
      isMocked: true
    });
  }

  try {
    const prompt = `You are the AI Intelligent Municipal Router representing Hyderabad smart municipal hubs. 
Analyze the following raw citizen text or voice transcript and return a structured JSON report. 
Refine the description into a polite, official municipal request. Categorize it, assign the correct authority department, and estimate the severity.

Raw Citizen Text: "${text}"

Assign one of these categories:
- "Garbage Dump" (garbage piles, uncollected trash, animal issues)
- "Drainage & Sewerage" (clogged sewers, overflowing septic, storm drain damage)
- "Street Lighting" (dark poles, flickering lights, exposed electrical wires)
- "Road Repairs" (potholes, cave-ins, broken curbs, open trenches)
- "Water Clogging" (flooded streets, standing marshy water, storm blockage)
- "Public Safety" (collapsed walls, hazardous trees, dangerous structures)

Assign one of these Hyderabad departments based on the concern:
- "Greater Hyderabad Municipal Corporation (GHMC)" (for Garbage, Public Safety, Water Clogging, general parks)
- "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWS&SB)" (for Drainage, Water Pipelines, sewers)
- "Telangana State Southern Power Distribution Company (TSSPDCL)" (for Street Lighting, exposed power cables, transformers)
- "GHMC Road Infrastructure Engineering Division" (for major highway potholes or road re-laying)

Determine severity: "Low", "Medium", "High", or "Critical". Broken street lights on small lanes is "Medium". Open sewer covers on main roads or deep water flooding school entries is "Critical" or "High".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise 3-6 word professional title for the complaint ticket" },
            category: { type: Type.STRING, description: "One of the listed categories that matches best" },
            description: { type: Type.STRING, description: "A highly clear, formal and polite rewritten municipal description based on the user's input, detailing the core hazard and importance of fixing it." },
            urgency: { type: Type.STRING, description: "One of: Low, Medium, High, Critical" },
            department: { type: Type.STRING, description: "The correct department name matching the category" }
          },
          required: ["title", "category", "description", "urgency", "department"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json({ ...parsedResult, isMocked: false });
  } catch (error: any) {
    console.error("Gemini parse failed", error);
    res.status(500).json({ error: "Failed to parse issue via Gemini AI", details: error.message });
  }
});

// --- SIMULATED COMPLAINT API TRANSMISSION TO RESPECITVE SITES ---
app.post("/api/ghmc-submit", (req, res) => {
  const { id, title, category, description, department, location } = req.body;

  // Let's create an elegant real-looking municipal API feedback trace
  const apiRoute = category === "Garbage Dump" 
    ? "https://api.ghmc.gov.in/v2/sanitation/complaints"
    : category === "Drainage & Sewerage"
    ? "https://hmws&sb.telangana.gov.in/api/sewerage/ticket"
    : category === "Street Lighting"
    ? "https://tsspdcl.org/api/lighting/outages/log"
    : "https://api.ghmc.gov.in/v2/engineering/roads/patching";

  const requestHeaders = {
    "Content-Type": "application/json",
    "X-Citizen-Gateway-Token": "Bearer civic-hero-token-898234",
    "X-Source-Platform": "CivicHeroApp-v1.0",
    "Authorization": "ApiKey ghmc_sec_99182312_live",
  };

  const payload = {
    ticket_id: id || "TX-" + Math.floor(Math.random() * 900000 + 100000),
    complaint_title: title,
    classification: category,
    details: description,
    assigned_authority: department,
    coordinates: {
      latitude: location?.lat || 17.3850,
      longitude: location?.lng || 78.4867
    },
    geo_address: location?.address || "Hyderabad Urban",
    reporting_agent: "Smart Civic Hero Portal",
    status_webhook_url: "https://our-civic-hero-app/api/webhooks/municipal-update"
  };

  // Simulating an active gateway log response
  res.json({
    status: "success",
    timestamp: new Date().toISOString(),
    apiEndpoint: apiRoute,
    headersSent: requestHeaders,
    requestPayload: payload,
    response: {
      status_code: 201,
      ticket_registered: true,
      municipal_reference_id: "GHMC-" + Math.floor(Math.random() * 1000000 + 500000),
      officer_assigned: "Shri V. Satyanarayana (Zonal Dy. Commissioner)",
      officer_contact: "+91 94400 12345",
      estimated_sla_hours: category === "Drainage & Sewerage" ? 24 : 48,
      message: "Complaint successfully synced with official Hyderabad Municipal Hub. Action team is being triggered."
    }
  });
});

// --- SMS / TEXT GATEWAY SIMULATOR ENDPOINT ---
app.post("/api/sms-receive", async (req, res) => {
  const { sender, messageText } = req.body;
  if (!messageText || messageText.trim() === "") {
    return res.status(400).json({ error: "Message text cannot be empty" });
  }

  const logs: string[] = [
    `[Gateway] SMS received from ${sender || "+91 9988776655"}: "${messageText}"`,
    `[Gateway] Triggering AI Router parsing protocol...`
  ];

  let parsed: any = {
    title: "SMS Reported Issue",
    category: "Garbage Dump",
    description: messageText,
    urgency: "Medium",
    department: "Greater Hyderabad Municipal Corporation (GHMC)"
  };

  if (ai) {
    try {
      logs.push(`[AI Engine] Connecting to Gemini-3.5-flash text comprehension services...`);
      const prompt = `A citizen sent this SMS text to report a neighborhood problem: "${messageText}".
Extract a structured municipal ticket from this SMS.
Choose a proper category ("Garbage Dump", "Drainage & Sewerage", "Street Lighting", "Road Repairs", "Water Clogging", "Public Safety") and a proper Hyderabad department, write a detailed formal version of the report, and assign a priority.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              urgency: { type: Type.STRING },
              department: { type: Type.STRING }
            },
            required: ["title", "category", "description", "urgency", "department"]
          }
        }
      });

      parsed = JSON.parse(response.text || "{}");
      logs.push(`[AI Engine] Structured representation extracted successfully!`);
      logs.push(`[AI Engine] Category: ${parsed.category} | Assigned To: ${parsed.department}`);
    } catch (err: any) {
      logs.push(`[AI Engine] Error during AI classification, using local parser. Error: ${err.message}`);
    }
  } else {
    logs.push(`[AI Engine] Gemini API key missing, relying on pattern-matching local parser...`);
    // Simple local pattern matching
    const txt = messageText.toLowerCase();
    if (txt.includes("sewer") || txt.includes("drain") || txt.includes("pipe") || txt.includes("overflow")) {
      parsed.title = "Sewer Spill via SMS";
      parsed.category = "Drainage & Sewerage";
      parsed.department = "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWS&SB)";
      parsed.urgency = "High";
    } else if (txt.includes("light") || txt.includes("electricity") || txt.includes("dark")) {
      parsed.title = "Streetlight Blackout via SMS";
      parsed.category = "Street Lighting";
      parsed.department = "Telangana State Southern Power Distribution Company (TSSPDCL)";
      parsed.urgency = "Medium";
    } else if (txt.includes("pothole") || txt.includes("crater") || txt.includes("road")) {
      parsed.title = "Road Hazard via SMS";
      parsed.category = "Road Repairs";
      parsed.department = "GHMC Road Infrastructure Engineering Division";
      parsed.urgency = "High";
    }
  }

  // Auto create issue
  const newReport = {
    id: "issue-sms-" + Date.now(),
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    urgency: parsed.urgency,
    status: "reported",
    votes: 1,
    votedUserIds: [],
    reportedBy: "SMS Citizen (" + (sender ? sender.slice(-4) : "9955") + ")",
    createdAt: new Date().toISOString(),
    location: {
      lat: 17.3850 + (Math.random() - 0.5) * 0.1,
      lng: 78.4867 + (Math.random() - 0.5) * 0.1,
      address: "Hyderabad (Auto-extracted from cellular celltower triangulation)"
    },
    department: parsed.department,
    history: [
      {
        status: "reported",
        changedAt: new Date().toISOString(),
        notes: "Issue automatically logged via SMS Gateway. Raw payload: " + messageText,
        updatedBy: "SMS Gateway Bot"
      }
    ],
    comments: [],
    isSimulated: true
  };

  const reports = readReports();
  reports.unshift(newReport);
  writeReports(reports);

  logs.push(`[Gateway] Registered ticket ${newReport.id} in active system.`);
  logs.push(`[Gateway] Sending automated confirmation SMS back to citizen: "Thank you for being a Civic Hero! Your complaint has been registered as Ticket #${newReport.id.substring(0,8)}. Tracking link has been sent."`);

  res.json({
    logs: logs,
    report: newReport
  });
});

// --- START UP DEV OR PROD VITE MIDDLEWARE ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Civic Platform Express server running on port ${PORT}`);
  });
}

start();
