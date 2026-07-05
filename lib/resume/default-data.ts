import { resumeSchema } from "./schema";

// Sample seed for the builder — a fictional person so the public route ships no
// real personal data. Fills every section (incl. a multi-role employer) so the
// preview and all form branches are exercised. Emails use example.com and phone
// numbers use the 555-01xx fiction range. To load a real résumé, use the
// "Import .tex" action in the builder rather than editing this file.
const RAW_RESUME = {
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  phone: "+1 (555) 018-2470",
  location: "Austin, Texas, USA",
  summary:
    "Full-stack software engineer with 7+ years building and scaling web applications end-to-end — from data model and API design through accessible, performant front ends. Comfortable owning features from spec to production: shipping incrementally, writing thorough tests, and instrumenting what I ship. Strong collaborator across product and design, with a track record of mentoring engineers and cutting delivery time through pragmatic tooling and clear documentation.",
  competencies: [
    "Full-Stack Web Development",
    "API & Systems Design",
    "TypeScript & React",
    "Distributed Systems",
    "Cloud Architecture (AWS)",
    "CI/CD & Release Automation",
    "Observability & Performance",
    "Accessibility (WCAG)",
    "Technical Mentorship",
    "Agile Delivery",
  ],
  experience: [
    {
      firm: "Northwind Labs",
      location: "Austin, Texas, USA",
      roles: [
        {
          title: "Senior Software Engineer",
          period: "Jan 2023 – Present",
          bullets: [
            "Lead a squad of five engineers delivering the customer analytics platform, owning architecture, code review, and quarterly roadmap.",
            "Cut p95 API latency by 62% by introducing read replicas, query-level caching, and a background job pipeline for expensive aggregations.",
            "Drove adoption of a typed end-to-end contract (OpenAPI → generated clients), eliminating a recurring class of integration bugs.",
            "Mentored three mid-level engineers, two of whom were promoted within the year.",
          ],
        },
        {
          title: "Software Engineer",
          period: "Jun 2020 – Dec 2022",
          bullets: [
            "Built the multi-tenant billing service (Stripe) handling recurring invoicing, proration, and dunning for 4,000+ accounts.",
            "Migrated the monolith's authentication to OIDC with short-lived tokens, closing several long-standing security findings.",
          ],
        },
      ],
    },
    {
      firm: "Brightwave Studio",
      location: "Remote",
      roles: [
        {
          title: "Full-Stack Developer",
          period: "Aug 2018 – May 2020",
          bullets: [
            "Delivered client web applications on React and Node.js, from discovery through launch and post-launch support.",
            "Introduced a shared component library and design tokens, halving the time to spin up a new client project.",
            "Set up CI/CD on GitHub Actions with preview deployments, giving stakeholders per-PR review environments.",
          ],
        },
      ],
    },
    {
      firm: "Cedar & Finch (Freelance)",
      location: "Austin, Texas, USA",
      roles: [
        {
          title: "Web Developer",
          period: "Jan 2017 – Jul 2018",
          bullets: [
            "Designed and shipped marketing sites and e-commerce storefronts for small businesses.",
            "Improved Core Web Vitals across client sites through image optimisation, code-splitting, and caching.",
          ],
        },
      ],
    },
  ],
  education: [
    {
      degree: "B.Sc. in Computer Science",
      period: "2013 – 2017",
      institution: "University of Texas at Austin",
      location: "Austin, Texas",
    },
    {
      degree: "Full-Stack Web Development Certificate",
      period: "2016",
      institution: "Rebound Coding Bootcamp",
      location: "",
    },
  ],
  systems: [
    { label: "Languages", value: "TypeScript, JavaScript, Python, Go, SQL" },
    { label: "Frameworks", value: "React, Next.js, Node.js, FastAPI, Express" },
    { label: "Cloud & DevOps", value: "AWS (ECS, Lambda, RDS), Docker, Terraform, GitHub Actions" },
    { label: "Databases", value: "PostgreSQL, Redis, MongoDB, DynamoDB" },
    { label: "Tooling & Observability", value: "Git, Linux, Datadog, Sentry, Figma" },
  ],
  references: [
    {
      name: "Dr. Priya Nair",
      role: "Engineering Manager, Northwind Labs",
      phone: "+1 (555) 018-3391",
      email: "priya.nair@example.com",
    },
    {
      name: "Marcus Bell",
      role: "Principal Engineer, Northwind Labs",
      phone: "+1 (555) 018-7742",
      email: "marcus.bell@example.com",
    },
    {
      name: "Sofia Alvarez",
      role: "Founder, Brightwave Studio",
      phone: "+1 (555) 018-5580",
      email: "sofia@example.com",
    },
    {
      name: "James Okoro",
      role: "Product Lead, Northwind Labs",
      phone: "+1 (555) 018-2214",
      email: "james.okoro@example.com",
    },
  ],
};

// Validate the seed against the schema at load — a cheap guard that the seed
// stays in sync with the model, and the same entry point the .tex importer and a
// future "import résumé JSON" feature reuse.
export const DEFAULT_RESUME = resumeSchema.parse(RAW_RESUME);
