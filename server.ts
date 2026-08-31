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
      prompt = `The student is asking: "${payload.message || payload.query || "Hello StudentOS AI!"}"
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
  } else if (feature === "chat_assistant") {
    const queryText = (payload.message || payload.query || "").toLowerCase();
    if (queryText.includes("dijkstra") || queryText.includes("shortest path")) {
      simulatedOutput = `### 🧠 StudentOS AI: Dijkstra's Algorithm
Here is a conceptual guide to optimizing your shortest-path search using Dijkstra's Algorithm:

1. **Keep a Priority Queue**: Store nodes as pair of \`(distance, node_id)\`.
2. **Relaxation step**: For each neighbor of a node, check if the distance to reach it through the current node is smaller than the previously recorded distance.
3. **Complexity**: Dijkstra's with a binary heap runs in $O((V + E) \\log V)$ time and uses $O(V)$ space.

Here is a C++ skeleton to get you started:
\`\`\`cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

// Distance, Node pair
typedef pair<int, int> pii;

void dijkstra(int start, vector<vector<pii>>& adj, int V) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);
    
    pq.push({0, start});
    dist[start] = 0;
    
    while(!pq.empty()) {
        int u = pq.top().second;
        pq.pop();
        
        for(auto x : adj[u]) {
            int v = x.first;
            int weight = x.second;
            if(dist[v] > dist[u] + weight) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
}
\`\`\`
Let me know if you need help dry-running this code in the sandbox!`;
    } else if (queryText.includes("quicksort") || queryText.includes("quick sort")) {
      simulatedOutput = `### 🧠 StudentOS AI: Quick Sort Algorithm
Quick Sort is a Divide and Conquer algorithm. It picks an element as a pivot and partitions the given array around the picked pivot.

#### 1. Conceptual Steps
*   Choose a pivot element (often the last element or a random element).
*   Partition: Reorder the array so that all elements with values less than the pivot come before the pivot, and all elements with values greater than the pivot come after it.
*   Recursively apply the above steps to the sub-arrays.

#### 2. TypeScript Skeleton
\`\`\`typescript
function quickSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}
\`\`\`
`;
    } else if (queryText.includes("mergesort") || queryText.includes("merge sort")) {
      simulatedOutput = `### 🧠 StudentOS AI: Merge Sort Algorithm
Merge Sort is a Divide and Conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.

#### 1. Conceptual Steps
*   Divide the unsorted list into n sublists, each containing one element.
*   Repeatedly merge sublists to produce new sorted sublists until there is only one sublist remaining.

#### 2. TypeScript Skeleton
\`\`\`typescript
function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}
// Merging helper...
\`\`\`
`;
    } else if (queryText.includes("binary search")) {
      simulatedOutput = `### 🧠 StudentOS AI: Binary Search Algorithm
Binary Search is a search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array.

#### 1. Conceptual Steps
*   Start with the middle element.
*   If the target value is equal to the middle element, return its index.
*   If the target value is less than the middle element, search the left half.
*   If the target value is greater than the middle element, search the right half.

#### 2. TypeScript Skeleton
\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`
`;
    } else if (queryText.includes("bfs")) {
      simulatedOutput = `### 🧠 StudentOS AI: Breadth-First Search (BFS)
BFS is an algorithm for traversing or searching tree or graph data structures. It starts at the tree root and explores all nodes at the present depth level before moving to the nodes at the next depth level.

#### 1. Conceptual Steps
*   Initialize a Queue and a visited set.
*   Enqueue the start node and mark it as visited.
*   While the queue is not empty, dequeue a node, process it, and enqueue all its unvisited neighbors.

#### 2. TypeScript Skeleton
\`\`\`typescript
function bfs(graph: Map<number, number[]>, start: number): number[] {
    const queue: number[] = [start];
    const visited = new Set<number>([start]);
    const result: number[] = [];

    while (queue.length > 0) {
        const node = queue.shift()!;
        result.push(node);

        for (const neighbor of graph.get(node) || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return result;
}
\`\`\`
`;
    } else if (queryText.includes("dfs")) {
      simulatedOutput = `### 🧠 StudentOS AI: Depth-First Search (DFS)
DFS is an algorithm for traversing or searching tree or graph data structures. The algorithm starts at the root node and explores as far as possible along each branch before backtracking.

#### 1. Conceptual Steps
*   Initialize a Visited set to keep track of explored nodes.
*   Use a recursive helper or a stack to explore depth-first.
*   Mark the current node as visited, then recursively visit all unvisited neighbors.

#### 2. TypeScript Skeleton
\`\`\`typescript
function dfs(graph: Map<number, number[]>, node: number, visited = new Set<number>()): number[] {
    visited.add(node);
    const result = [node];

    for (const neighbor of graph.get(node) || []) {
        if (!visited.has(neighbor)) {
            result.push(...dfs(graph, neighbor, visited));
        }
    }
    return result;
}
\`\`\`
`;
    } else if (queryText.includes("matrix") || queryText.includes("2d array") || queryText.includes("grid")) {
      simulatedOutput = `### 🧠 StudentOS AI: Matrix & 2D Grid Walkthrough
A matrix (2D array) is a key structure for representing grids, images, graphs (adjacency matrix), and dynamic programming tables.

#### 1. Common Traversal Patterns
*   **Row-by-Row**: Standard nested loop.
*   **DFS/BFS on Grid**: Moving in 4 or 8 directions (e.g. islands count, shortest path in maze).
*   **Diagonal Traversal**: Traversing along diagonals (useful in DP like matrix chain multiplication).

#### 2. C++ Grid DFS Skeleton
\`\`\`cpp
#include <vector>
using namespace std;

int rows, cols;
vector<pair<int, int>> dirs = {{0,1}, {0,-1}, {1,0}, {-1,0}};

void dfs(int r, int c, vector<vector<int>>& grid, vector<vector<bool>>& visited) {
    visited[r][c] = true;
    for (auto d : dirs) {
        int nr = r + d.first;
        int nc = c + d.second;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
            dfs(nr, nc, grid, visited);
        }
    }
}
\`\`\`
Try writing a matrix traversal snippet and executing it in the compiler sandbox!`;
    } else if (queryText.includes("array") || queryText.includes("vector")) {
      simulatedOutput = `### 🧠 StudentOS AI: Array / Vector Mastery
Arrays are contiguous memory blocks representing sequences. Vectors (dynamic arrays) grow dynamically.

#### 1. Core Algorithms
*   **Two Pointers**: Used on sorted arrays (e.g., Two Sum II, Container With Most Water).
*   **Sliding Window**: Subarrays of variable or fixed size (e.g., Longest Substring Without Repeating Characters).
*   **Kadane's Algorithm**: Finding maximum subarray sum in $O(N)$ time.

#### 2. Two-Pointer TypeScript Example
\`\`\`typescript
function hasTargetSum(arr: number[], target: number): boolean {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        const currentSum = arr[left] + arr[right];
        if (currentSum === target) return true;
        else if (currentSum < target) left++;
        else right--;
    }
    return false;
}
\`\`\`
Write an array reversal or rotation in the C++ sandbox and click Compile to run!`;
    } else if (queryText.includes("linked list")) {
      simulatedOutput = `### 🧠 StudentOS AI: Linked List Guide
A linked list is a linear data structure where elements are not stored in contiguous memory locations. Instead, elements are linked using pointers.

#### 1. Common Operations
*   **Reversing a Linked List**: In-place reversal of pointers.
*   **Fast & Slow Pointers**: Detecting cycles (Floyd's Cycle Finding Algorithm) or finding the middle node.
*   **Merging Sorted Lists**: Combining two sorted lists.

#### 2. TypeScript List Node & Reversal
\`\`\`typescript
class ListNode {
    val: number;
    next: ListNode | null = null;
    constructor(val: number) { this.val = val; }
}

function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr = head;
    while (curr !== null) {
        let nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}
\`\`\`
`;
    } else if (queryText.includes("tree") || queryText.includes("bst") || queryText.includes("binary search tree")) {
      simulatedOutput = `### 🧠 StudentOS AI: Binary Trees & BSTs
Binary trees consist of nodes with at most two children. BSTs enforce that the left subtree contains values less than the parent, and the right subtree contains values greater.

#### 1. Traversals
*   **Pre-order**: Root -> Left -> Right
*   **In-order**: Left -> Root -> Right (returns sorted elements for BSTs)
*   **Post-order**: Left -> Right -> Root
*   **Level-order**: BFS traversal using a queue.

#### 2. C++ In-order traversal example
\`\`\`cpp
#include <iostream>
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};

void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    std::cout << root->val << " ";
    inorder(root->right);
}
\`\`\`
`;
    } else if (queryText.includes("algorithm") || queryText.includes("algo")) {
      // Extract what they might be asking about before the word "algorithm"
      const words = queryText.replace(/[\?\!]/g, "").split(" ");
      const algoIdx = words.findIndex(w => w === "algorithm" || w === "algo");
      let subject = "selected";
      if (algoIdx > 0) {
        subject = words[algoIdx - 1];
      }
      simulatedOutput = `### 🧠 StudentOS AI: ${subject.charAt(0).toUpperCase() + subject.slice(1)} Algorithm Guide
Here is a conceptual guide to implementing the **${subject}** algorithm:

1. **Understand the Goal**: Identify the inputs, base cases, and desired outputs.
2. **Choose the Right Data Structures**: Determine if you need an array, hash map, stack, queue, or graph representation.
3. **Optimize the Complexity**: Check for redundant work and see if you can apply dynamic programming or sliding window techniques to reduce runtime.

Would you like to write a draft of the **${subject}** algorithm and compile it in the C++ Compiler sandbox?`;
    } else if (queryText.includes("resume") || queryText.includes("audit") || queryText.includes("cv") || queryText.includes("internship")) {
      simulatedOutput = `### 📄 StudentOS AI: Resume Feedback
Based on your request, here are three high-impact strategies to polish your developer resume:

*   **Lead with Impact**: Instead of "built API endpoints," use **"Architected 12 RESTful API route handlers with Express, decreasing database round-trip times by 24%."**
*   **ATS Keyword Matching**: Ensure your resume contains concrete technical tags: *TypeScript*, *React*, *Vite*, *Node.js*, *Express*, *Firestore*, and *Git*.
*   **Quantification**: Every bullet point should try to answer *how much*, *how fast*, or *how many* users/transactions were impacted.`;
    } else if (queryText.includes("study") || queryText.includes("plan") || queryText.includes("exam") || queryText.includes("schedule")) {
      simulatedOutput = `### 📅 StudentOS AI: Study Planner
Here is a high-yield study methodology to ace your upcoming assessments:

*   **Active Recall**: Instead of re-reading notes, close the book and write down everything you remember.
*   **Spaced Repetition**: Review the material at intervals of 1 day, 3 days, and 7 days.
*   **Error Journaling**: Keep track of every problem you solve incorrectly, note down the conceptual mistake, and re-solve it 2 days later.`;
    } else {
      simulatedOutput = `### 🤖 StudentOS AI Coach
Hello! I am your AI Academic Advisor. How can I assist you with your academic goals today?

*   Ask me to create a **Study Plan** for your upcoming midterms.
*   Share a resume bullet point to run a **Resume Critique**.
*   Let me map out a **Placement Prep Roadmap** for you!

*(You asked: "${payload.message || payload.query || "Hello"}")*`;
    }
  } else {
    simulatedOutput = `### 🤖 StudentOS AI Coach
Hello! I am your AI Academic Advisor. How can I assist you with your academic goals today?
- Ask me to create a **Study Plan** for your upcoming midterms.
- Share a resume bullet point to run a **Resume Critique**.
- Let me map out a **Placement Prep Roadmap** for you!`;
  }
  
  res.json({ result: simulatedOutput, simulated: true });
});

app.post("/api/compile", async (req: express.Request, res: express.Response) => {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Compile proxy error:", error);
    res.status(500).json({ error: 'Compilation failed' });
  }
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
