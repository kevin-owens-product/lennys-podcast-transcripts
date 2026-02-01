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
