import bcrypt from 'bcryptjs';
import { prisma } from './client.js';

export async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('demopassword123', salt);

  const user = await prisma.user.upsert({
    where: { email: 'demo@sift.internal' },
    update: {},
    create: {
      email: 'demo@sift.internal',
      name: 'Demo Founder',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  // 2. Create Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Sift Alpha Studio',
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });
  }

  // 3. Create Subscription (FREE tier with 2 free analyses)
  await prisma.subscription.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      provider: 'placeholder',
      plan: 'FREE',
      status: 'ACTIVE',
    },
  });

  // 4. Create Project 1: AI Job Application Agent (PRD §83 killer demo)
  const existingProject = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: 'AI Recruiting Agent' },
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'AI Recruiting Agent',
        description: 'Autonomous job search and application engine for software engineers',
      },
    });

    const idea = await prisma.idea.create({
      data: {
        projectId: project.id,
      },
    });

    const ideaVersion = await prisma.ideaVersion.create({
      data: {
        ideaId: idea.id,
        versionNumber: 1,
        rawInput:
          'I want to build an AI recruiting agent that automatically applies to jobs for users.',
        inputType: 'TEXT',
        normalizedCustomer: 'Mid-to-senior software engineers actively seeking tech employment',
        normalizedProblem:
          'Job seekers spend 15-25 hours per week manually searching job boards, tailoring resumes, and filling repetitive application forms.',
        normalizedSolution:
          'Autonomous agent that matches candidate profile to open listings, adapts resumes, and applies on their behalf.',
        industry: 'HR Tech / Recruiting',
        geography: 'United States & Remote',
        businessModel: 'B2C Subscription ($39/month)',
        pricing: '$39/month flat or $99 for 3-month cycle',
        distribution: 'Organic viral (LinkedIn, TikTok), Reddit (r/cscareerquestions), Product Hunt',
        technology: 'Browser automation, resume parser, vector similarity embeddings, LLM customizer',
        assumptionsJson: JSON.stringify([
          'Job seekers will trust an autonomous agent to submit applications without manual approval.',
          'Automated applications will pass ATS screens at comparable rates to manual applications.',
          'Willingness to pay exists at $39/mo among job hunters with high burnout.',
        ]),
        constraintsJson: JSON.stringify(['CAPTCHA on Greenhouse and Lever', 'LinkedIn rate limits']),
      },
    });

    await prisma.idea.update({
      where: { id: idea.id },
      data: { currentVersionId: ideaVersion.id },
    });

    const analysis = await prisma.analysis.create({
      data: {
        ideaVersionId: ideaVersion.id,
        workspaceId: workspace.id,
        status: 'COMPLETE',
        requestedDepth: 'STANDARD',
        qualityStatus: 'PASSED',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3000000),
      },
    });

    // Assumptions
    const a1 = await prisma.assumption.create({
      data: {
        analysisId: analysis.id,
        category: 'PROBLEM',
        statement: 'Job seekers experience application fatigue and spend over 10 hours/week searching.',
        criticality: 'HIGH',
        confidence: 'HIGH',
        status: 'OPEN',
        evidenceState: 'SUPPORTED',
        unknowns: 'Exact time spent varies by seniority; junior applicants spend more hours with lower yield.',
        requiredExperiment: 'Survey 50 active job seekers regarding weekly application hours.',
      },
    });

    const a2 = await prisma.assumption.create({
      data: {
        analysisId: analysis.id,
        category: 'CUSTOMER',
        statement: 'Users will delegate the full application submission process to an autonomous agent.',
        criticality: 'CRITICAL',
        confidence: 'LOW',
        status: 'OPEN',
        evidenceState: 'CONTRADICTED',
        unknowns: 'Threshold of control: do candidates require human-in-the-loop review before submit?',
        requiredExperiment: 'Offer a semi-autonomous vs fully autonomous workflow to 20 candidates.',
      },
    });

    const a3 = await prisma.assumption.create({
      data: {
        analysisId: analysis.id,
        category: 'PRICING',
        statement: 'Job seekers will pay $39/month while actively searching for work.',
        criticality: 'CRITICAL',
        confidence: 'UNKNOWN',
        status: 'OPEN',
        evidenceState: 'UNKNOWN',
        unknowns: 'Willingness to pay during periods of unemployment or budget restriction.',
        requiredExperiment: 'Pre-sell 30-day access on a landing page with $39 checkout button.',
      },
    });

    const a4 = await prisma.assumption.create({
      data: {
        analysisId: analysis.id,
        category: 'COMPETITION',
        statement: 'Existing AI job application tools produce poor quality applications and spam recruiters.',
        criticality: 'HIGH',
        confidence: 'HIGH',
        status: 'OPEN',
        evidenceState: 'SUPPORTED',
        unknowns: 'How recruiters will defend against AI floods (e.g. proof of human effort).',
      },
    });

    // Sources
    const s1 = await prisma.source.create({
      data: {
        canonicalUrl: 'https://reddit.com/r/recruitinghell/comments/ai_job_apps',
        title: 'Recruiters are rejecting AI mass applications instantly',
        publisher: 'Reddit',
        sourceType: 'COMMUNITY',
        tier: 'TIER_3_COMMUNITY',
        geography: 'US',
        population: 'Job seekers & recruiters',
      },
    });

    const s2 = await prisma.source.create({
      data: {
        canonicalUrl: 'https://techcrunch.com/lazyapply-funding-ai-jobs',
        title: 'The rise of AI job application tools and the recruiter backlash',
        publisher: 'TechCrunch',
        sourceType: 'SECONDARY',
        tier: 'TIER_2_SECONDARY',
        geography: 'Global',
        population: 'HR & Tech industry',
      },
    });

    const s3 = await prisma.source.create({
      data: {
        canonicalUrl: 'https://bls.gov/news.release/jolts.htm',
        title: 'Job Openings and Labor Turnover Summary',
        publisher: 'U.S. Bureau of Labor Statistics',
        sourceType: 'PRIMARY',
        tier: 'TIER_1_PRIMARY',
        geography: 'United States',
        population: 'US Workforce',
      },
    });

    // Claims & Evidence
    const c1 = await prisma.claim.create({
      data: {
        analysisId: analysis.id,
        assumptionId: a2.id,
        section: 'COUNTER_EVIDENCE',
        statement: 'Job seekers express severe anxiety over AI submitting hallucinated experiences or spamming companies they admire.',
        claimType: 'COUNTER_EVIDENCE',
        confidence: 'HIGH',
      },
    });

    await prisma.evidence.create({
      data: {
        claimId: c1.id,
        sourceId: s1.id,
        evidenceType: 'COUNTER',
        excerpt: 'I used an auto-applier and it applied to jobs I was completely unqualified for and altered my resume with fabricated bullet points. Two companies blacklisted me.',
        relevance: 'HIGH',
        confidence: 'HIGH',
        notes: 'Critical counter-evidence demonstrating risk of autonomous delegation.',
      },
    });

    const c2 = await prisma.claim.create({
      data: {
        analysisId: analysis.id,
        assumptionId: a4.id,
        section: 'COMPETITION',
        statement: 'Several AI job application bots have gained initial traction but suffer from low recruiter response rates and high churn.',
        claimType: 'FACT',
        confidence: 'HIGH',
      },
    });

    await prisma.evidence.create({
      data: {
        claimId: c2.id,
        sourceId: s2.id,
        evidenceType: 'SUPPORTING',
        excerpt: 'Platforms like LazyApply and Simplify have seen millions of applications submitted, but response rates have dropped to under 1.5% as ATS systems install anti-bot heuristics.',
        relevance: 'HIGH',
        confidence: 'HIGH',
      },
    });

    // Competitors
    await prisma.competitor.createMany({
      data: [
        {
          analysisId: analysis.id,
          company: 'LazyApply',
          product: 'Automated job application chrome extension',
          classification: 'DIRECT',
          pricing: '$99 lifetime or $49/mo',
          targetCustomer: 'Active job seekers',
          strengths: 'First mover, high volume capability (100+ apps/day)',
          weaknesses: 'Spammy reputation, ATS detection, poor customization',
          complaints: 'Banned accounts on LinkedIn, irrelevant applications',
          differentiation: 'Sift thesis recommends semi-autonomous approval with high-quality curation rather than mass blasting.',
        },
        {
          analysisId: analysis.id,
          company: 'Simplify Jobs',
          product: 'Autofill extension for job applications',
          classification: 'INDIRECT',
          pricing: 'Free with premium tiers',
          targetCustomer: 'College grads and tech candidates',
          strengths: 'Clean UI, high trust, user controls submission click',
          weaknesses: 'Still requires manual navigation to each job page',
          differentiation: 'Simplify focuses on autofill; Sift thesis focuses on job discovery matching plus curated application draft.',
        },
        {
          analysisId: analysis.id,
          company: 'Manual Job Search / Non-consumption',
          product: 'Manual spreadsheets + LinkedIn search',
          classification: 'SUBSTITUTE',
          pricing: 'Free ($0, but 15+ hours/week)',
          targetCustomer: 'All candidates',
          strengths: '100% human oversight, zero reputational risk',
          weaknesses: 'Exhausting, slow, low throughput',
        },
      ],
    });

    // Experiments
    await prisma.experiment.createMany({
      data: [
        {
          analysisId: analysis.id,
          assumptionId: a2.id,
          name: 'Semi-Autonomous Delegation Test',
          hypothesis: 'Users will accept an agent that prepares custom applications but pauses for 1-click WhatsApp/SMS approval before submitting.',
          method: 'Concierge MVP: Manually curate 10 jobs for 15 beta users and send preview cards for 1-tap approval.',
          targetParticipants: '15 mid-level software developers currently applying to jobs',
          successCriterion: '>= 80% approval rate of drafted applications with < 2 edits per application.',
          failureCriterion: 'Users reject drafts or demand to write applications manually.',
          priority: 'CRITICAL',
          status: 'PROPOSED',
        },
        {
          analysisId: analysis.id,
          assumptionId: a3.id,
          name: 'Paid Pilot Smoke Test',
          hypothesis: 'At least 5 out of 25 interviewed job seekers will prepay $39 for a 14-day assisted search.',
          method: 'Run 25 discovery calls; offer guaranteed curated submission of 20 verified roles.',
          targetParticipants: '25 software engineers with active job hunt status',
          successCriterion: '>= 5 paid commitments before product build.',
          failureCriterion: '< 2 commitments.',
          priority: 'HIGH',
          status: 'PROPOSED',
        },
      ],
    });

    // Report
    await prisma.report.create({
      data: {
        analysisId: analysis.id,
        version: 1,
        thesisJson: JSON.stringify({
          opportunity: 'Semi-autonomous, high-fidelity job application assistant for engineers that replaces mass-spam auto-appliers with curated human-approved submissions.',
          customer: 'Mid-to-senior software engineers who want to avoid application fatigue without risking their professional reputation.',
          problem: 'Applying to jobs takes 15+ hours/week, but automated bot tools trigger recruiter blacklists and destroy interview conversion.',
          existingBehavior: 'Manual tailoring on LinkedIn/Google Sheets or using blunt bot tools that result in spam complaints.',
          proposedSolution: 'Agent discovers matching roles, generates bespoke resumes/cover letters, and requests 1-tap approval before submitting.',
          evidenceSummary: 'Problem is strongly validated; market demand signals are high. However, full autonomous delegation is contradicted by candidate trust issues.',
          criticalAssumptions: [
            'Candidates will delegate with 1-click verification.',
            'Quality-adjusted applications beat mass-blasting in recruiter yield.',
            'Pricing at $39/mo is sustainable during career transitions.',
          ],
          contradictoryEvidence: [
            'Candidates express strong fear of being blacklisted by recruiters.',
            'ATS platforms are aggressively filtering automated submissions.',
          ],
          criticalUnknowns: [
            'Will candidates pay upfront before seeing interview invitations?',
            'What is the threshold of manual review required to maintain user peace of mind?',
          ],
          validationPlan: 'Run Concierge MVP with 15 candidates and test paid pre-orders.',
          decisionOutput: 'EVIDENCE_STATE: MIXED. Demand is strong but full autonomy is a fatal trap. Pivot to Human-in-the-Loop Curator before building automation.',
        }),
        qualityStatus: 'PASSED',
      },
    });

    // Record Usage Event
    await prisma.usageEvent.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        analysisId: analysis.id,
        eventType: 'ANALYSIS_COMPLETED',
        quantity: 1,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('Credentials: demo@sift.internal / demopassword123');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
