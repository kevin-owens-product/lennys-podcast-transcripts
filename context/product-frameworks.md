# Product Management Frameworks

Distilled from 269 episodes of Lenny's Podcast. Each framework is attributed to the guest who articulated it.

---

## 1. Opportunity Solution Tree (Teresa Torres)

**Source**: `episodes/teresa-torres/transcript.md`

A visual framework for connecting outcomes to solutions through opportunities:

```
Outcome (business/product metric)
├── Opportunity A (unmet need / pain / desire)
│   ├── Solution A1
│   │   ├── Assumption Test 1
│   │   └── Assumption Test 2
│   └── Solution A2
├── Opportunity B
│   ├── Solution B1
│   └── Solution B2
└── Opportunity C
    └── Solution C1
```

**Key rules**:
- Opportunities are NOT solutions. "We need a search bar" is a solution. "Users can't find what they're looking for" is an opportunity.
- 98% of people write opportunities as solutions—this is the #1 mistake
- Explore at least 3 solutions per opportunity before committing
- Test assumptions, not entire solutions—find the riskiest assumption and test it first
- The outcome at the root should come from leadership; the opportunity space is where the team has autonomy

**Continuous Discovery Habits**:
- Talk to customers weekly (not quarterly research sprints)
- Automate customer interview recruitment
- Every interview should serve your current opportunity space
- Interview in pairs so you get multiple interpretations

---

## 2. Three Levels of Product Work (Shreyas Doshi)

**Source**: `episodes/shreyas-doshi/transcript.md`

All product work operates at one of three levels:

| Level | Focus | Question |
|-------|-------|----------|
| **Impact** | Outcomes for customers and business | What change are we creating? |
| **Execution** | Getting things done, shipping | How do we deliver this? |
| **Optics** | Creating awareness of work | How do people know about this? |

**Why this matters**:
- Most team conflicts come from people defaulting to different levels
- A PM focused on execution presents to a CEO focused on impact → mismatch → bad review
- Early-stage teams should optimize for execution (assuming a reasonable hypothesis)
- Platform teams with trust issues should invest more in optics (communication)
- Optics is not bad—it creates energy and opportunities for feedback—but it should never become the goal

**Warning signs optics has become the goal**:
- People get promoted for great status updates, not results
- Launches are celebrated regardless of impact
- All-hands presentations highlight activity, not outcomes

---

## 3. LNO Framework for Prioritization (Shreyas Doshi)

**Source**: `episodes/shreyas-doshi/transcript.md`

Classify every task by its leverage ratio:

| Type | Input:Output | How to Handle |
|------|-------------|---------------|
| **L** (Leverage) | 1X → 10-100X | Spend your best hours. Let your perfectionism shine. |
| **N** (Neutral) | 1X → 1.1X | Do adequately. Don't over-invest. |
| **O** (Overhead) | 1X → 0.1X | Minimize time. Just get it done. |

**Critical insight**: The same activity can be L, N, or O depending on context.
- Filing a bug report for a critical customer-facing issue = **L**
- Filing a bug report for a minor internal tool = **O**
- Taking notes after a contentious CEO product review = **L**
- Taking notes after a routine standup = **O**

**Tactics for doing more L tasks**:
1. **Placebo productivity**: Intentionally do N/O tasks for 1-2 days to build momentum, then tackle the L task
2. **Change of location**: Work from a different place on L task days to force focus
3. **Recognize the fear**: We procrastinate on L tasks because we're afraid we won't have anything good to say

---

## 4. Pre-Mortem Framework (Shreyas Doshi)

**Source**: `episodes/shreyas-doshi/transcript.md`

**Prompt**: "Imagine it is 6 months from now. This project has failed miserably. What went wrong?"

Three categories of threats:

| Category | Definition | Example |
|----------|-----------|---------|
| **Tiger** | A real threat that will kill us | "Our API can't handle the load at launch" |
| **Paper Tiger** | A seeming threat that won't matter | "Competitor X will copy us" |
| **Elephant** | The thing nobody is talking about | "We're assuming growth without a distribution plan" |

**Process**:
1. Leader shares the prompt
2. 5-10 minutes of silent brainstorming (people enter threats in a shared doc)
3. Go around the room and share
4. Vote on the scariest tiger that someone ELSE mentioned
5. Leader creates a prioritized action plan

**Outcome**: Shared vocabulary. After a pre-mortem, people start saying "I have a tiger" in regular meetings—it becomes safe to raise concerns.

---

## 5. Product Marketing as Product (Brian Chesky)

**Source**: `episodes/brian-chesky/transcript.md`

Brian Chesky combined inbound product management with outbound product marketing:

**Key principles**:
- You can't build a product unless you know how to talk about it
- If you build a great product and no one knows about it, did you even build a product?
- The story should dictate the product (not the reverse)
- One of the first things to do when starting a project is figure out the story

**Airbnb's approach**:
- Product managers became "product marketers" responsible for both building AND communicating
- UX writing + marketing writing merged into one writing function
- Every release is a "chapter" in an ongoing story
- Two major releases per year (May and November)
- Rolling 2-year roadmap updated monthly

**The "chandelier vs. laser" metaphor** (from Joe Gebbia):
- Performance marketing = laser (lights up a corner)
- Brand marketing = chandelier (lights up the room)
- Don't use lasers to light up an entire room

---

## 6. Product Positioning (April Dunford)

**Source**: `episodes/april-dunford/transcript.md`

**The core problem**: 40-60% of B2B purchases end in "no decision"—not because alternatives are better, but because buyers can't choose confidently.

**Five components of positioning**:
1. **Competitive alternatives**: What would customers do without you?
2. **Differentiated capabilities**: What can you do that alternatives can't?
3. **Value**: What outcomes do those capabilities enable?
4. **Best-fit customers**: Who cares most about that value?
5. **Market category**: What frame of reference helps customers understand you?

**Sales pitch structure**:
1. Define the market shift / key insight
2. Show what's wrong with the status quo
3. Describe the ideal solution approach
4. Demonstrate your differentiated value
5. Prove it with evidence
6. Make the next step easy

---

## 7. Execution Problems Are Strategy Problems (Shreyas Doshi)

**Source**: `episodes/shreyas-doshi/transcript.md`

> "Most execution problems in a high-performing environment are actually strategy problems, interpersonal problems, or cultural problems."

**Diagnostic questions**:
- Is the team working hard but not making progress? → Strategy problem
- Are two smart people in persistent conflict? → Misaligned levels (impact vs execution vs optics)
- Is everyone "too busy" for strategic thinking? → Strategy is the L task being avoided
- Are you firefighting constantly? → The strategy hasn't been set, so everything is urgent

**The uncomfortable truth**: Time is never the real constraint. Saying "I don't have time for strategy" is a convenient excuse for the fear that you might not have a good strategy.

---

## 8. The Single Roadmap (Brian Chesky)

**Source**: `episodes/brian-chesky/transcript.md`

Airbnb's approach to eliminating organizational drift:

- **One roadmap** for the entire company (not per-team roadmaps)
- Rolling 2-year horizon, updated monthly
- Next month doesn't change; 2 years out changes frequently
- You can't ship something unless it's on the roadmap
- CEO reviews all work on a cadence (weekly/biweekly/monthly/quarterly)
- Projects scored green/yellow/red by a head program manager
- Reserve resources for unexpected pivots (e.g., housing 120K refugees during Ukraine crisis)

**Why it works**:
- "We wanted a company where 1,000 people could work, but it'll look like 10 people did it"
- Metrics are subordinate to the calendar (roadmap drives, not metrics)
- No team can go off in its own direction without visibility
- CEO can identify individual bottlenecks because they see the "assembly" every week

---

## 9. The Sean Ellis PMF Test (Sean Ellis)

**Source**: `episodes/sean-ellis/transcript.md`

> "The question is: how would you feel if you could no longer use this product? Once you got a high enough percentage saying 'very disappointed,' most of those products did pretty well."

### The Test
Ask users: **"How would you feel if you could no longer use this product?"**
- Very disappointed
- Somewhat disappointed
- Not disappointed / N/A

**40%+ saying "very disappointed" = leading indicator of product-market fit**

### Why It Works
- A leading indicator—you don't need months of retention data
- Can be run from day one of an MVP
- Acts as a team alignment tool: "we don't aggressively grow until we hit this target"
- Helps resolve the "is it ready?" debate with a shared benchmark
- Retention cohorts are more accurate but take longer to read

### The Real Power: Drilling Into the "Very Disappointed" Cohort
1. **Who are they?** — Define your ICP from actual must-have users
2. **What do they value?** — Find the core benefit driving their attachment
3. **Why does that benefit matter?** — Get the emotional context (e.g., "I'm drowning in email")
4. **What did they use before?** — Understand the real competitive alternatives

### Ignore the "Somewhat Disappointed"
> "They're telling you it's a nice to have. If you start tweaking based on their feedback, you may dilute it for your must-have users."

### The Lookout Case Study: 7% → 40% in Two Weeks
Without changing the product:
1. Found the 7% who loved it cared about antivirus
2. Repositioned the product around antivirus
3. Streamlined onboarding so first experience = antivirus setup + "you're now protected"
4. **"Set the right expectations and then speed to value"**

### Post-40% Next Steps
- Deeply understand why must-have users love it
- Align product roadmap to double down on must-have value
- Ensure onboarding delivers the core value experience
- Target acquisition at people with the same need
- Build engagement loops that reinforce the core benefit

---

## 10. The SaaS Sales Pitch (April Dunford)

**Source**: `episodes/april-dunford/transcript.md`

> "40-60% of B2B purchase processes end in no decision—not because the old thing was better, but because buyers couldn't figure out how to make a choice confidently."

### Why Most SaaS Pitches Fail
- Default pitch = glorified product walkthrough (click every dropdown menu)
- Buyer sits there thinking: "Sounds like the other tool. Why should I switch?"
- Result: customer indecision, not competitor loss
- Buyers are overwhelmed, afraid of recommending the wrong tool to their boss

### The Insight-Led Sales Pitch Structure

**Part 1 — The Setup** (not about you, about the market):
1. **Market insight**: Your point of view on what's changing
   - Help Scout: "Customer service for digital businesses is a growth driver, not a cost center"
   - This should resonate with your ICP. If it doesn't, disqualify the deal.
2. **Alternatives landscape**: Pluses and minuses of each approach (not bashing—teaching)
   - Shared inbox: easy but you'll outgrow it
   - Help desk software: powerful but treats customers as tickets
3. **Perfect world**: "Can we agree a good solution should be easy to use, scalable, AND built for amazing service?"

**Part 2 — The Follow-Through** (about your differentiated value):
4. **Introduction**: "We're X. We do Y specifically for Z."
5. **Differentiated value** (NOT features): "Here's the value → here's how we deliver it" × 3
6. **Proof**: Customer case studies, third-party validation
7. **Objection handling**: Address silent objections (hard to adopt, expensive, security)
8. **The ask**: Whatever the next step is in your sales process

### The Teaching Mindset
- Most B2B buyers have never purchased software like yours before
- They want perspectives on the market and help weighing options
- Research shows this is what buyers value most in a sales interaction
- Yet most vendors just say: "Here's our stuff. You figure it out."

### Discovery Within the Pitch
- The setup section IS discovery—it's a conversation, not a presentation
- By end of setup, either: aligned prospect → proceed, OR mutual disqualification
- "It's part of the discovery that we do in a first substantive sales call"

---

## 11. Growth Anti-Patterns for SaaS (Elena Verna)

**Source**: `episodes/elena-verna/transcript.md`

Elena Verna (Miro, Amplitude, Dropbox, SurveyMonkey, Lovable) on tactics that never work:

### 10 Things That Never Work
1. **Hiring a growth team to find PMF** — "To figure out your product market fit and how to distribute it, it's not something you can outsource to somebody"
2. **Rebranding/redesigning your marketing site for performance** — "Never ever once have I seen a rebrand produce good performance results"
3. **Making everything an experiment** — "If every single initiative is an experiment, that's a paralyzing disease"
4. **Optimizing when you should be innovating** — At Lovable (200M ARR): "95% innovating on growth, 5% optimization"

### The PLG Reality Check
- Product-led growth is not just adding a free tier
- Self-serve must deliver value without human touch
- The product IS the acquisition, conversion, and retention engine
- "Only 30-40% of what I learned in 15-20 years transfers" to AI-era growth
