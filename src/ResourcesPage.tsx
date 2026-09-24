import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Filter,
  GraduationCap,
  LibraryBig,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  academyStages,
  learningResources,
  resourceKinds,
  resourceTechnologies,
  roleRoadmaps,
} from "./learningResourceCatalog";

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [technology, setTechnology] = useState("All technologies");
  const [kind, setKind] = useState("All resources");
  const [role, setRole] = useState(roleRoadmaps[0].id);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return learningResources.filter((item) => {
      const matchesQuery =
        !normalized ||
        [item.title, item.provider, item.technology, item.description]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesTechnology =
        technology === "All technologies" || item.technology === technology;
      const matchesKind = kind === "All resources" || item.kind === kind;
      return matchesQuery && matchesTechnology && matchesKind;
    });
  }, [kind, query, technology]);

  const selectedRole =
    roleRoadmaps.find((item) => item.id === role) ?? roleRoadmaps[0];
  const officialCount = learningResources.filter((item) => item.official).length;
  const freeCount = learningResources.filter((item) => item.free).length;

  return (
    <div className="page resources-page">
      <section className="page-title resources-hero">
        <div>
          <span className="eyebrow teal">LEARNING RESOURCES</span>
          <h1>
            Learn from trusted guides. <span className="gradient-text">Practice here.</span>
          </h1>
          <p>
            Find official guides, trusted courses, coding practice, real
            projects, and interview help for each part of your course.
          </p>
        </div>
        <div className="resource-hero-stats panel" aria-label="Resource catalog summary">
          <div><LibraryBig /><b>{learningResources.length}</b><span>hand-picked resources</span></div>
          <div><ShieldCheck /><b>{officialCount}</b><span>official sources</span></div>
          <div><CheckCircle2 /><b>{freeCount}</b><span>free to access</span></div>
        </div>
      </section>

      <section className="academy-model panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HOW LEARNING WORKS</span>
            <h2>Four levels, each ending with work you can show</h2>
          </div>
          <p>Read to learn. Practice and build to show what you can do.</p>
        </div>
        <div className="academy-stage-grid">
          {academyStages.map((stage, index) => (
            <article key={stage.level}>
              <span className="stage-number">0{index + 1}</span>
              <h3>{stage.level}</h3>
              <p>{stage.objective}</p>
              <dl>
                <div><dt>Learn</dt><dd>{stage.learning}</dd></div>
                <div><dt>Practice</dt><dd>{stage.practice}</dd></div>
                <div><dt>Show your skill</dt><dd>{stage.evidence}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="role-roadmaps panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START AT ZERO. BECOME JOB-READY.</span>
            <h2>Choose a job goal after learning the shared basics</h2>
          </div>
          <GraduationCap />
        </div>
        <div className="role-tabs" role="tablist" aria-label="Career role roadmap">
          {roleRoadmaps.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={role === item.id}
              className={role === item.id ? "active" : ""}
              onClick={() => setRole(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="role-roadmap-content">
          <div className="role-sequence">
            <span className="eyebrow teal">YOUR GOAL</span>
            <h3>{selectedRole.title}</h3>
            <p>{selectedRole.outcome}</p>
            <ol>
              {selectedRole.sequence.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="role-evidence">
            <article>
              <Target />
              <div><h3>Projects to build</h3>{selectedRole.portfolio.map((item) => <span key={item}>{item}</span>)}</div>
            </article>
            <article>
              <Code2 />
              <div><h3>Interview topics</h3>{selectedRole.interview.map((item) => <span key={item}>{item}</span>)}</div>
            </article>
          </div>
        </div>
      </section>

      <section className="resource-library" aria-labelledby="resource-library-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RESOURCE LIBRARY</span>
            <h2 id="resource-library-title">Official guides and practice</h2>
          </div>
          <span>{filtered.length} matching resources</span>
        </div>
        <div className="resource-filters panel">
          <label className="resource-search">
            <Search />
            <span className="sr-only">Search resources</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search JavaScript, Angular, RAG, interviews..." />
          </label>
          <label>
            <Filter />
            <span className="sr-only">Filter by technology</span>
            <select value={technology} onChange={(event) => setTechnology(event.target.value)}>
              {resourceTechnologies.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <BookOpen />
            <span className="sr-only">Filter by resource type</span>
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              {resourceKinds.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {filtered.length ? (
          <div className="resource-card-grid">
            {filtered.map((item) => (
              <article className="resource-card panel" key={item.id}>
                <div className="resource-card-meta">
                  <span>{item.technology}</span>
                  <div>
                    {item.official && <small>Official</small>}
                    {item.free && <small>Free</small>}
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="resource-card-footer">
                  <span>
                    {item.provider} · {item.resourceType} · {item.difficulty} · {item.duration} · Reviewed {item.lastReviewedAt}
                  </span>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Open <ArrowUpRight />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="resource-empty panel">
            <Search />
            <h3>No resources match those filters</h3>
            <p>Clear the search or select a broader technology and resource type.</p>
            <button className="secondary-button" onClick={() => { setQuery(""); setTechnology("All technologies"); setKind("All resources"); }}>Clear filters</button>
          </div>
        )}
      </section>

      <aside className="resource-integrity panel">
        <ShieldCheck />
        <div>
          <b>How resources affect your progress</b>
          <p>Outside reading helps you learn, but it does not complete a Forge lesson. Return here, practice from memory, build the project, and pass the test.</p>
        </div>
      </aside>
    </div>
  );
}
