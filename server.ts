import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse request body
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = apiKey && apiKey !== "MY_GEMINI_API_KEY";

let ai: GoogleGenAI | null = null;
if (isRealApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully with active key.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY detected. AI Assistant will operate in rich simulation mode.");
}

// ----------------- AI ROUTE ENDPOINTS -----------------

app.post("/api/ai/generate", async (req: express.Request, res: express.Response) => {
  const authUserId = req.headers["x-user-id"];
  if (!authUserId) {
    res.status(403).json({ error: "Unauthorized access: Missing authentication context." });
    return;
  }

  const { feature, payload } = req.body;

  if (!feature) {
    res.status(400).json({ error: "Missing parameter: feature" });
    return;
  }

  // Construct context-specific prompts for Gemini
  let prompt = "";
  let systemInstruction = "You are StudentOS AI, an elite academic advisor, coding mentor, and career guide for university students. You provide concise, structured, and action-oriented markdown formatting. Always speak with professional clarity, and format lists with bullets.";

  switch (feature) {
    case "daily_planner":
      prompt = `Create a highly organized, hour-by-hour dynamic daily study schedule based on:
      - Current Courses: ${JSON.stringify(payload.courses || [])}
      - Pending Assignments: ${JSON.stringify(payload.assignments || [])}
      - Today's Goals: ${JSON.stringify(payload.goals || [])}
      Format with a "Chronological Schedule" table and a "Focus Strategies" advice section. Make it high-impact and realistic.`;
      systemInstruction += " You specialize in time-management and visual grid scheduling.";
      break;

    case "study_planner":
      prompt = `Generate a customized study preparation plan for the course: "${payload.courseName || "General Academic Prep"}" with target grade: "${payload.targetGrade || "A+"}".
      Consider:
      - Remaining weeks: ${payload.weeks || 4}
      - Current confidence: ${payload.confidence || "Medium"}
      - Specific exam topics or notes: ${payload.topics || "Full syllabus"}
      Provide a week-by-week sprint breakdown, mock questions, and list critical recall/memorization techniques for this specific subject.`;
      break;

    case "coding_coach":
      prompt = `Review this coding problem/milestone for student Leetcode/platform prep:
      - Problem title/topic: "${payload.topic || "Data Structures & Algorithms"}"
      - Student's current solution/attempt or question: "${payload.codeAttempt || "Searching for optimization guidance"}"
      - Target complexity: ${payload.targetComplexity || "Optimal Time & Space"}
      Provide a conceptual breakdown of the optimal approach, detailed dry-run steps, space-time analysis, and 3 subtle bug-spotting hints. Do NOT just write raw code immediately—give conceptual steps first, followed by clear TypeScript/Python snippet for the optimized function.`;
      systemInstruction += " You are an expert engineer from Google, guiding Leetcode/System-design preparation.";
      break;

    case "hackathon_recommendation":
      prompt = `Design a winning project blueprint and complete roadmap for an upcoming hackathon:
      - Hackathon Name/Theme: "${payload.theme || "AI Innovation Hack"}"
      - Tech Stack preference: "${payload.techStack || "React, Tailwind, Express, Firebase"}"
      - Team size: ${payload.teamSize || 3}
      Provide:
      1. Project Idea Concept (Unique & High-impact)
      2. Architecture details
      3. Precise 36-hour phase breakdown (Planning, MVP Core, UI Polish, Pitch preparation)
      4. Checklist for Submission & Winning Pitch.`;
      break;

    case "resume_analyzer":
      prompt = `Analyze and critique the following Resume bullet points or description:
      - Selected Role Target: "${payload.targetRole || "Software Engineering Intern"}"
      - Resume Content: "${payload.resumeText || ""}"
      Provide an objective score out of 100 based on standard high-frequency hiring filters. Detail:
      1. Action Verbs checklist (which are missing or weak)
      2. Quantifiable Impact suggestions (where to inject metrics/percentages)
      3. ATS keyword optimization matches for "${payload.targetRole || "SWE Intern"}".`;
      break;

    case "placement_roadmap":
      prompt = `Generate an intensive placement preparation roadmap for role: "${payload.roleName || "Full Stack Engineer"}" targeting companies like: "${payload.companies || "Google, Stripe, Vercel"}".
      - Prep duration: ${payload.durationWeeks || 8} weeks
      - Strengths: ${payload.strengths || "Frontend, React"}
      - Areas to improve: ${payload.weaknesses || "Algorithms, System Design"}
      Provide a structured timeline, focus topics, high-frequency mock questions list, and resource references.`;
      break;

    case "deadline_prediction":
      prompt = `Analyze academic bottlenecks and predict deadline crash risks:
      - Course workload: ${JSON.stringify(payload.courses || [])}
      - Upcoming deadlines: ${JSON.stringify(payload.assignments || [])}
      - Attendance logs: ${JSON.stringify(payload.attendance || [])}
      Predict:
      1. Bottleneck alert risk percentage
      2. Course with highest grade risk
      3. Concrete actionable schedule adjustments to avoid burnout.`;
      systemInstruction += " You specialize in predictive student telemetry and risk metrics.";
      break;

    case "profile_bio_optimizer":
      prompt = `Generate a compelling, highly polished professional profile bio, elevator pitch, or elevator summary based on:
      - Name: "${payload.fullName || ""}"
      - Major: "${payload.major || ""}"
      - University: "${payload.university || ""}"
      - Graduation Year: ${payload.graduationYear || 2027}
      - Total Courses: ${payload.totalCourses || 0}
      - Total Projects: ${payload.totalProjects || 0}
      - Hooked coding accounts: ${payload.hookedCodingProfiles || 0}
      Create 3 beautiful variations:
      1. A professional, high-impact resume summary statement.
      2. An engaging LinkedIn "About" introduction pitch.
      3. A casual, ultra-polished 20-second elevator pitch/intro.`;
      systemInstruction += " You specialize in professional branding and ATS-friendly elevator pitches.";
      break;

    case "achievement_recommender":
      prompt = `Recommend 4 high-value professional certifications, academic milestones, or extracurricular achievements suitable for:
      - Student Major: "${payload.major || "Computer Science"}"
      - Current University: "${payload.university || ""}"
      - Already completed achievements: ${JSON.stringify(payload.currentAchievements || [])}
      For each recommendation, provide:
      - Title of Certificate/Achievement
      - Issuer or Organization
      - Category (academic | technical | soft_skills | extracurricular)
      - Why it is valuable for their career path.
      Keep the formatting clean, bulleted, and professional.`;
      systemInstruction += " You are an expert career counselor specializing in high-value student credentials and career-boosting certifications.";
      break;

    case "chat_assistant":
      prompt = `The student is asking: "${payload.message || "Hello StudentOS AI!"}"
      Provide coaching advice, quick academic summaries, or general student productivity counseling based on this message. Keep it conversational and structured.`;
      break;

    default:
      prompt = `Review student request: ${JSON.stringify(payload)}`;
  }

  // If real API key is configured, execute Gemini API request
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ result: response.text });
      return;
    } catch (apiError: any) {
      console.error("Gemini API execution failed, shifting to expert backup simulation:", apiError);
    }
  }

  // EXPERT SIMULATION MODE (Fallback when API key is missing or encounters quota/errors)
  let simulatedOutput = "";

  if (feature === "daily_planner") {
    simulatedOutput = `### 📅 Smart StudentOS Daily Planner
Based on your current academic workload, assignments, and study habits, here is your customized high-performance schedule for today:

#### Chronological Schedule
| Time | Task / Block | Focus | Category |
| :--- | :--- | :--- | :--- |
| **08:00 AM - 09:00 AM** | 🌅 Morning Power Hour | Goal setting, review day's deadlines, quick revision | General |
| **09:00 AM - 11:30 AM** | 🧠 High-Cognitive Block | Deep work on core assignments (status: pending) | Academic |
| **11:30 AM - 12:30 PM** | 💻 Coding Lab Sprint | Practice 1 Leetcode problem & commit progress | Coding |
| **12:30 PM - 01:30 PM** | 🍽️ Mindful Break & Nutrition | Step away from screens, rehydrate | Wellbeing |
| **01:30 PM - 03:30 PM** | 📚 Lecture / Sync block | Attend scheduled classes & review attendance | Academic |
| **03:30 PM - 05:00 PM** | 🧪 Project Milestone Block | Build hackathon/research draft milestones | Project |
| **05:00 PM - 06:00 PM** | 📝 Review & Admin prep | Clean inbox, update finance log, prepare for tomorrow | Admin |

#### Focus Strategies
- **Pomodoro Cycles**: Use $25/5$ minute blocks during the deep work segment to maintain continuous mental sharpness.
- **Micro-rewards**: Complete your high-priority assignment before checking notifications.
- **Streak Protection**: You currently have a study streak active. Log at least one completion today to maintain it!`;
  } else if (feature === "study_planner") {
    simulatedOutput = `### 📚 Academic Sprint Blueprint: Exam Preparation
Tailored preparation plan designed for **${payload.courseName || "Selected Course"}** targeting a final grade of **${payload.targetGrade || "A+"}**.

#### Week-by-Week Sprint Breakdown
*   **Week 1: Core Foundation & Audit**
    *   Synthesize all class notes, active learning flashcards, and textbook slides.
    *   Map out complex formulas, historical timelines, or systems architecture maps.
    *   *Task*: Complete 1 conceptual summary mind map.
*   **Week 2: Passive to Active Transition**
    *   Shift from highlighting text to active recall. Write explanations as if teaching a freshman.
    *   Work through sample problem sets, midterms, or practice assignment prompts.
*   **Week 3: Time-Bound Simulation Sprints**
    *   Simulate exam conditions with past papers. No notes, exact time constraints.
    *   Audit incorrect questions and build an "Error Journal" tracking cognitive missteps.
*   **Week 4: Precision Refinement & Light Maintenance**
    *   Target high-frequency, high-value concepts. Review the "Error Journal" daily.
    *   Maintain regular sleeping patterns; cognitive consolidation occurs primarily during REM sleep.

#### Critical Recall Techniques
1.  **Feynman Technique**: Explain the hardest concept in your course in 3 simple sentences.
2.  **Spaced Repetition**: Re-test your low-confidence chapters at 1, 3, and 6-day intervals.`;
  } else if (feature === "coding_coach") {
    simulatedOutput = `### 💻 Elite Coding Coach: Approach and Hints
Let's optimize your LeetCode prep for **${payload.topic || "Algorithm Practice"}** with a target complexity of **${payload.targetComplexity || "Optimal Time & Space"}**.

#### Optimal Approach (Two-Pointer / Sliding Window / Map-Cache)
To solve this class of problem optimally without brute-forcing ($O(N^2)$), use an auxiliary Hash Map to track indices or state in a single pass ($O(N)$ time complexity).

#### Space-Time Complexity
-   **Time Complexity**: $O(N)$ — We traverse the input array exactly once.
-   **Space Complexity**: $O(N)$ — To store frequency hashes or index maps.

#### Subtle Bug-Spotting Hints
1.  **Empty / Edge Inputs**: What happens if the input size is $0$ or $1$? Enforce pre-checks.
2.  **Integer Overflow**: If aggregating values, are counts bound to exceed typical 32-bit registers?
3.  **Index Off-by-One**: Ensure your right/left boundary conditions do not read past array tails.

#### Recommended TypeScript Optimized Skeleton
\`\`\`typescript
// Optimal O(N) Time, O(N) Space Solution
function solveOptimized(nums: number[], target: number): number[] {
    const tracker = new Map<number, number>(); // Key: component value, Value: index
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (tracker.has(complement)) {
            return [tracker.get(complement)!, i];
        }
        tracker.set(nums[i], i);
    }
    return [];
}
\`\`\`

Implement this, and run tests on boundary inputs!`;
  } else if (feature === "hackathon_recommendation") {
    simulatedOutput = `### 🏆 Premium Hackathon Project Blueprint
Recommended MVP solution for **${payload.theme || "Innovative AI Tech Hack"}** built on **${payload.techStack || "React, Tailwind, Express"}**.

#### Project Idea Concept: "EduSphere AI"
A gamified student knowledge graph that automatically compiles course slides, lecture transcripts, and syllabus docs into interactive, node-based 3D graphs using Gemini-API entity extraction.

#### Architecture Stack
-   **Frontend**: React + Tailwind CSS with Glassmorphism styles and Lucide Icons.
-   **Backend**: Express.js server handle processing requests securely.
-   **Database**: Cloud Firestore for persistent student metadata and graph cache.

#### Complete 36-Hour Phase Breakdown
1.  **Hours 0 - 6 (Planning & Mockups)**: Solidify wireframes, draft Firestore entities, initialize project repos.
2.  **Hours 6 - 18 (MVP Backend & Core)**: Establish Express routes, hook up local node processing, verify basic queries.
3.  **Hours 18 - 30 (UI Integration & Aesthetics)**: Build the dashboard, insert charts, wire reactive triggers.
4.  **Hours 30 - 36 (Pitch & Pitch deck)**: Record a 2-minute high-quality video demo, focus on business viability and user experience.`;
  } else if (feature === "resume_analyzer") {
    simulatedOutput = `### 📄 Resume Impact Analysis & Scorecard
Analysis computed for target role: **${payload.targetRole || "Software Engineering Intern"}**.

#### Overall Score: 82 / 100 (Competitive, but has structural gaps)

#### 1. Action Verbs Checklist
-   **Strengths**: Active verbs like *Implemented*, *Engineered*, and *Optimized* are present.
-   **Weaknesses**: Discovered passive phrases like *Responsible for...* or *Worked on...*
-   *Correction*: Replace with *Architected*, *Pioneered*, *Streamlined*.

#### 2. Quantifiable Impact Audit
-   Your points look highly functional but lack business metrics.
-   *Before*: "Created database schemas and speed up queries for assignments."
-   *After*: "Redesigned PostgreSQL schemas and index configurations, **reducing average query latency by 42%** and supporting 10k+ active mock requests."

#### 3. ATS Keyword Match Matchers
Ensure your resume includes these crucial keywords:
-   *Tech*: TypeScript, React, RESTful APIs, CI/CD, Jest, Git, Agile Methodology.
-   *Method*: Component-driven architecture, State management, Schema optimization.`;
  } else if (feature === "placement_roadmap") {
    simulatedOutput = `### 🚀 Intensive Placement Preparation Roadmap
8-Week prep sequence tailored to **${payload.roleName || "Software Engineer"}** targeting roles at top-tier tech companies.

#### Weeks 1 - 2: DSA Core & Data Structure Mastery
-   **Topics**: Arrays, Hash Maps, Two-Pointers, Sliding Windows, Stacks & Queues.
-   **Goals**: Solve 15 Easy, 10 Medium problems. Keep coding profile updated.
-   **Mock Question**: Implement an $O(N)$ sliding window minimum.

#### Weeks 3 - 4: Advanced DSA & Graph Traversals
-   **Topics**: Recursion, Backtracking, DFS/BFS, Binary Trees, Priority Queues.
-   **Goals**: Solve 15 Medium, 5 Hard problems. Use LeetCode profile trackers.
-   **Mock Question**: Clone a graph or solve Dijkstra's shortest path.

#### Weeks 5 - 6: System Design & Framework Architecture
-   **Topics**: High-Level System Design, RESTful APIs, Databases, Caching, Load Balancers.
-   **Goals**: Design an Instagram or URL shortener mockup.
-   **Mock Question**: How do you prevent database lock bottlenecks during high-volume queries?

#### Weeks 7 - 8: Mock Interviews, Portfolio, & Behavioral
-   **Topics**: STAR method questions, resume polishing, pitch reviews, system simulations.
-   **Goals**: Conduct 3 peer mock interviews, record 1 video intro.`;
  } else if (feature === "deadline_prediction") {
    simulatedOutput = `### 🚨 Predictive Academic Workload Telemetry
#### Bottleneck Analytics & Prediction
-   **Workload Burnout Alert Index**: **38% (Low-Medium Risk)**
-   **Predicted Peak Friction Week**: Week 6 (Multiple assignment overlaps)

#### course-specific Risk Breakdown
-   **High Workload Risk**: Advanced Algorithms (Complex programming labs pending)
-   **Attendance Warning Alert**: Attendance currently sitting at 74% in Database Systems (Minimum threshold: 75%).
-   *Adjustment Recommendation*: Attend the upcoming Wednesday lab session to push attendance back into the safe zone.

#### Actionable Adjustments
-   Set aside 2 hours tonight specifically for the upcoming LeetCode milestone to prevent end-of-week cramming.`;
  } else if (feature === "profile_bio_optimizer") {
    simulatedOutput = `### 🌟 AI Professional Bio Optimization
Tailored professional branding suggestions engineered for **${payload.fullName || "Student"}**:

#### 1. ATS-Friendly Resume Summary Statement
> Goal-driven **${payload.major || "Selected Major"}** undergraduate at **${payload.university || "University"}** (Graduating ${payload.graduationYear || new Date().getFullYear() + 4}) with proven foundational expertise in course-aligned workflows and practical project execution. Active technical contributor with **${payload.totalProjects || 1} core development repositories** and synced algorithmic tracking profiles. Eager to leverage disciplined analytical problem-solving and software engineering principles in a high-impact professional environment.

#### 2. LinkedIn "About" Introduction Pitch
> "Hey! I'm ${payload.fullName || "Student"}, a passionate **${payload.major || "Selected Major"}** student at **${payload.university || "University"}** dedicated to engineering reliable digital solutions. 🚀 
> 
> My academic journey consists of **${payload.totalCourses || 3} core engineering modules**, which I balance alongside hands-on development—currently maintaining active repositories in my codebase portfolios. Whether optimizing relational database indices or writing clean algorithms, I thrive on translating abstract theoretical structures into modular, production-ready code. 
> 
> Let's connect! Always open to speaking about student engineering roles, open source development, or system-design challenges."

#### 3. Casual 20-Second Elevator Pitch
> *"Hi, I'm ${payload.fullName || "Student"}. I study **${payload.major || "Selected Major"}** at **${payload.university || "University"}**, graduating in ${payload.graduationYear || new Date().getFullYear() + 4}. I love building neat developer tools, and I've already designed **${payload.totalProjects || 1} custom web applications** using modern tech stacks. Right now, I'm preparing for upcoming software internships by optimizing algorithms and honing my systems understanding. I'd love to learn more about engineering roles at your company!"*`;
  } else if (feature === "achievement_recommender") {
    simulatedOutput = `### 🏆 Recommended Certifications & Achievements

Recommended achievements specifically curated for **${payload.major || "Selected Major"}** at **${payload.university || "University"}**:

1. **AWS Certified Developer - Associate**
   - **Issuer**: Amazon Web Services (AWS)
   - **Category**: technical
   - **Value**: Demonstrates real-world proficiency in cloud application development, deployment, and optimization. Highly sought-after by top-tier tech companies.

2. **Professional Scrum Master I (PSM I)**
   - **Issuer**: Scrum.org
   - **Category**: soft_skills
   - **Value**: Establishes your mastery of Scrum framework and Agile methodologies. Strongly differentiates candidates for software developer, product management, or technical program management roles.

3. **Dean's List / Academic Excellence Honors**
   - **Issuer**: ${payload.university || "University"}
   - **Category**: academic
   - **Value**: Showcases your academic consistency and high-gpa standing directly to recruiters checking academic rigor.

4. **Major Hackathon Winner or Open Source Contributor**
   - **Issuer**: Major League Hacking (MLH) / GitHub
   - **Category**: extracurricular
   - **Value**: Proves real-world developer grit, collaboration under tight deadlines, and actual engineering output beyond standard university coursework.`;
  } else {
    simulatedOutput = `### 🤖 StudentOS AI Coach
Hello! I am your AI Academic Advisor. How can I assist you with your academic goals today?
- Ask me to create a **Study Plan** for your upcoming midterms.
- Share a resume bullet point to run a **Resume Critique**.
- Let me map out a **Placement Prep Roadmap** for you!`;
  }

  res.json({ result: simulatedOutput, simulated: true });
});

// ----------------- VITE AND ASSETS HOSTING -----------------

async function startServer() {
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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StudentOS Express Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
