from sqlalchemy import select

from app.database import async_session
from app.models.agent import Agent
from app.models.template import Template


async def seed_default_data():
    """Seed global agents and templates on startup if they don't exist."""
    async with async_session() as db:
        # Check if already seeded
        existing = await db.execute(select(Agent).where(Agent.is_global.is_(True)).limit(1))
        if existing.scalar_one_or_none():
            return

        # --- Default Agents ---
        agents = [
            Agent(
                name="Research Assistant",
                slug="research-assistant",
                description="Search across all podcast transcripts to find expert advice on any topic",
                agent_type="research",
                system_prompt=(
                    "You are a research assistant with access to 269 episodes of Lenny's Podcast. "
                    "Search the transcripts to find relevant expert advice. Always cite the guest name "
                    "and episode title. Provide direct quotes when possible. Note where experts agree "
                    "or disagree."
                ),
                tools={"semantic_search": True, "keyword_search": True},
                is_global=True,
            ),
            Agent(
                name="Product Advisor",
                slug="product-advisor",
                description="Get product management advice grounded in frameworks from Shreyas Doshi, Teresa Torres, and others",
                agent_type="advisor",
                system_prompt=(
                    "You are a senior product advisor drawing on wisdom from Lenny's Podcast guests. "
                    "Apply frameworks like the LNO framework (Shreyas Doshi), Opportunity Solution Trees "
                    "(Teresa Torres), Three Levels of Product Work, and Pre-Mortems. Always ground advice "
                    "in specific guest insights with attribution."
                ),
                tools={"semantic_search": True, "keyword_search": True},
                is_global=True,
            ),
            Agent(
                name="Growth Analyst",
                slug="growth-analyst",
                description="Analyze growth strategy using Sarah Tavel's Hierarchy of Engagement, Casey Winters' frameworks, and more",
                agent_type="analyst",
                system_prompt=(
                    "You are a growth analyst powered by insights from Lenny's Podcast. Apply frameworks "
                    "like the Hierarchy of Engagement (Sarah Tavel), Kindle vs Fire strategies (Casey Winters), "
                    "Sean Ellis PMF test, and pricing strategy (Patrick Campbell). Analyze the user's "
                    "situation and provide specific, actionable growth recommendations."
                ),
                tools={"semantic_search": True, "keyword_search": True},
                is_global=True,
            ),
            Agent(
                name="Quote Finder",
                slug="quote-finder",
                description="Find specific quotes and memorable insights from podcast guests on any topic",
                agent_type="research",
                system_prompt=(
                    "You are a quote extraction specialist. When the user asks about a topic, search the "
                    "transcripts and return the most memorable, quotable, and actionable quotes from guests. "
                    "Format each quote with: the exact quote in quotation marks, the guest name, their "
                    "credentials, and the episode title. Prioritize contrarian or surprising insights."
                ),
                tools={"semantic_search": True, "keyword_search": True},
                max_context_chunks=15,
                is_global=True,
            ),
        ]

        # --- Default Templates ---
        templates = [
            Template(
                name="Product Pre-Mortem",
                slug="pre-mortem",
                description="Run Shreyas Doshi's pre-mortem framework on your project",
                category="product_review",
                system_prompt=(
                    "You are facilitating a pre-mortem using Shreyas Doshi's framework from Lenny's Podcast. "
                    "Help the user identify Tigers (real threats), Paper Tigers (seeming threats), and "
                    "Elephants (things nobody is talking about)."
                ),
                user_prompt_template=(
                    "Run a pre-mortem on this project:\n\n"
                    "Project: {{project_name}}\n"
                    "Description: {{project_description}}\n"
                    "Timeline: {{timeline}}\n\n"
                    "Identify potential Tigers, Paper Tigers, and Elephants. "
                    "For each, explain why it's classified that way and suggest mitigation strategies."
                ),
                variables={
                    "project_name": {"type": "string", "required": True, "label": "Project Name"},
                    "project_description": {"type": "text", "required": True, "label": "What are you building?"},
                    "timeline": {"type": "string", "required": False, "label": "Launch Timeline"},
                },
                is_global=True,
            ),
            Template(
                name="Positioning Workshop",
                slug="positioning-workshop",
                description="Apply April Dunford's positioning framework to your product",
                category="positioning",
                system_prompt=(
                    "You are a positioning consultant using April Dunford's framework from Lenny's Podcast. "
                    "Walk through: competitive alternatives, differentiated capabilities, value themes, "
                    "best-fit customers, and market category."
                ),
                user_prompt_template=(
                    "Help me position this product:\n\n"
                    "Product: {{product_name}}\n"
                    "What it does: {{what_it_does}}\n"
                    "Current customers: {{current_customers}}\n"
                    "Known competitors: {{competitors}}\n\n"
                    "Walk me through April Dunford's 5-step positioning framework and then "
                    "draft an insight-led sales pitch structure."
                ),
                variables={
                    "product_name": {"type": "string", "required": True, "label": "Product Name"},
                    "what_it_does": {"type": "text", "required": True, "label": "What does your product do?"},
                    "current_customers": {"type": "text", "required": False, "label": "Who are your current customers?"},
                    "competitors": {"type": "text", "required": False, "label": "Known competitors or alternatives"},
                },
                is_global=True,
            ),
            Template(
                name="Growth Diagnostic",
                slug="growth-diagnostic",
                description="Diagnose your growth challenges using multiple podcast frameworks",
                category="growth_analysis",
                system_prompt=(
                    "You are a growth diagnostician using frameworks from Lenny's Podcast: "
                    "Sarah Tavel's Hierarchy of Engagement, Sean Ellis PMF test, Casey Winters' "
                    "kindle/fire framework, and Patrick Campbell's pricing strategy."
                ),
                user_prompt_template=(
                    "Diagnose the growth situation for:\n\n"
                    "Product: {{product_name}}\n"
                    "Stage: {{stage}}\n"
                    "Current metrics: {{metrics}}\n"
                    "Main challenge: {{challenge}}\n\n"
                    "Apply the relevant frameworks and provide specific recommendations."
                ),
                variables={
                    "product_name": {"type": "string", "required": True, "label": "Product Name"},
                    "stage": {"type": "select", "required": True, "label": "Stage", "options": ["Pre-PMF", "Post-PMF", "Growth", "Scale"]},
                    "metrics": {"type": "text", "required": False, "label": "Current key metrics"},
                    "challenge": {"type": "text", "required": True, "label": "What's your main growth challenge?"},
                },
                is_global=True,
            ),
            Template(
                name="Strategy Check",
                slug="strategy-check",
                description="Evaluate your strategy using Rumelt, Chesky, Lutke, and Doshi frameworks",
                category="strategy",
                system_prompt=(
                    "You are a strategy advisor using frameworks from Lenny's Podcast: "
                    "Richard Rumelt's good strategy/bad strategy diagnosis, Brian Chesky's "
                    "single roadmap and Add a Zero, Tobi Lutke's first principles, and "
                    "Shreyas Doshi's 'execution problems are strategy problems'."
                ),
                user_prompt_template=(
                    "Evaluate this strategy:\n\n"
                    "Company/Product: {{company}}\n"
                    "Current strategy: {{strategy}}\n"
                    "Context: {{context}}\n\n"
                    "Apply the Rumelt good strategy test, check for first-principles thinking, "
                    "and identify if any execution problems are actually strategy problems."
                ),
                variables={
                    "company": {"type": "string", "required": True, "label": "Company or Product"},
                    "strategy": {"type": "text", "required": True, "label": "Describe your current strategy"},
                    "context": {"type": "text", "required": False, "label": "Additional context"},
                },
                is_global=True,
            ),
            Template(
                name="Expert Comparison",
                slug="expert-comparison",
                description="Compare what different podcast guests say about a specific topic",
                category="research",
                system_prompt=(
                    "You are a research analyst comparing perspectives from different Lenny's Podcast guests. "
                    "Find what multiple guests have said about the topic, highlight agreements and "
                    "disagreements, and synthesize the collective wisdom."
                ),
                user_prompt_template=(
                    "Compare what Lenny's Podcast guests have said about: {{topic}}\n\n"
                    "Find insights from at least 3-5 different guests. For each:\n"
                    "- Direct quote with attribution\n"
                    "- Their key argument or framework\n"
                    "- Where they agree/disagree with others\n\n"
                    "End with a synthesis of the collective wisdom."
                ),
                variables={
                    "topic": {"type": "string", "required": True, "label": "Topic to research"},
                },
                is_global=True,
            ),
        ]

        for agent in agents:
            db.add(agent)
        for template in templates:
            db.add(template)

        await db.commit()
