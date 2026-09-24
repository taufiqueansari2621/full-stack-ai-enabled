import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  LoaderCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { projectCards } from "./data";
import {
  ForgeApiError,
  forgeApi,
  type PublicPortfolio,
} from "./services/forgeApi";
import type { ForgeStore } from "./useForgeStore";
import "./portfolio.css";

export function Portfolio({
  store,
  cloudEnabled,
  notify,
}: {
  store: ForgeStore;
  cloudEnabled: boolean;
  notify: (text: string) => void;
}) {
  const [about, setAbout] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const projects = useMemo(
    () =>
      projectCards
        .filter(
          (project) => (store.state.projectTasks[project.id]?.length ?? 0) > 0,
        )
        .map((project) => ({
          id: project.id,
          title: project.title,
          progress: Math.round(
            ((store.state.projectTasks[project.id]?.length ?? 0) / 10) * 100,
          ),
          stack: [project.type],
        })),
    [store.state.projectTasks],
  );
  const skills = useMemo(
    () =>
      [
        {
          name: "Learning evidence",
          evidence: `${store.state.masteryArtifacts.length} saved explanations`,
        },
        {
          name: "Engineering labs",
          evidence: `${store.state.labArtifacts.length} verified lab records`,
        },
        {
          name: "Practice",
          evidence: `${store.metrics.uniqueCorrect} challenges solved`,
        },
        {
          name: "Projects",
          evidence: `${store.metrics.completedTasks} milestones completed`,
        },
      ].filter((item) => !item.evidence.startsWith("0")),
    [store],
  );
  const caseStudies = store.state.labArtifacts.map((item) => ({
    title: `${item.lab.toUpperCase()} lab`,
    summary: item.exerciseId,
    evidence: item.evidence,
  }));
  useEffect(() => {
    if (!cloudEnabled) return;
    forgeApi
      .portfolio()
      .then(({ portfolio }) => {
        if (portfolio) {
          setAbout(portfolio.about);
          setPublished(portfolio.published);
          setUsername(portfolio.username);
        }
      })
      .catch(() => undefined);
  }, [cloudEnabled]);
  const save = async (nextPublished = published) => {
    if (!cloudEnabled) return;
    setSaving(true);
    try {
      const { portfolio } = await forgeApi.savePortfolio({
        published: nextPublished,
        about,
        skills,
        projects,
        caseStudies,
        certificates: store.state.certificates,
      });
      setPublished(portfolio.published);
      setUsername(portfolio.username);
      notify(
        portfolio.published
          ? "Public portfolio published"
          : "Private portfolio draft saved",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="page portfolio-page">
      <section className="page-title">
        <div>
          <span className="eyebrow">YOUR DEVELOPER STORY</span>
          <h1>
            Evidence-backed <span className="gradient-text">portfolio</span>
          </h1>
          <p>
            Choose exactly what becomes public. Private notes, code, progress
            details, and AI conversations are never included.
          </p>
        </div>
        {published && username && (
          <a
            className="primary-button"
            href={`/u/${username}`}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink /> View public profile
          </a>
        )}
      </section>
      {!cloudEnabled && (
        <div className="portfolio-privacy panel">
          <ShieldCheck />
          <div>
            <b>Sign in before publishing</b>
            <p>
              You can review the portfolio locally, but public profiles require
              an authenticated account.
            </p>
          </div>
        </div>
      )}
      <div className="portfolio-layout">
        <section className="portfolio-editor panel">
          <label>
            About
            <textarea
              maxLength={1200}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe what you build, how you work, and the roles you are targeting."
            />
          </label>
          <h2>Automatically collected evidence</h2>
          <div className="portfolio-counts">
            <span>
              <FolderKanban /> {projects.length} active projects
            </span>
            <span>
              <CheckCircle2 /> {skills.length} skill signals
            </span>
            <span>
              <Award /> {store.state.certificates.length} certificates
            </span>
          </div>
          <div className="portfolio-actions">
            <button
              className="secondary-button"
              disabled={!cloudEnabled || saving}
              onClick={() => void save(false)}
            >
              <Save /> Save private draft
            </button>
            <button
              className="primary-button"
              disabled={!cloudEnabled || saving || about.trim().length < 40}
              onClick={() => void save(!published)}
            >
              {published ? <EyeOff /> : <Eye />}
              {published ? "Unpublish profile" : "Publish profile"}
            </button>
          </div>
        </section>
        <PortfolioPreview
          portfolio={{
            username: username || "your_username",
            fullName: "Your profile",
            published,
            about,
            skills,
            projects,
            caseStudies,
            certificates: store.state.certificates,
            updatedAt: new Date().toISOString(),
          }}
        />
      </div>
    </div>
  );
}

export function PortfolioPreview({
  portfolio,
}: {
  portfolio: PublicPortfolio;
}) {
  return (
    <article className="portfolio-preview panel">
      <span className="eyebrow">PUBLIC PREVIEW</span>
      <h1>{portfolio.fullName}</h1>
      <p>{portfolio.about || "Your About section will appear here."}</p>
      <h2>Skills with evidence</h2>
      <div className="portfolio-skills">
        {portfolio.skills.map((skill) => (
          <span key={skill.name}>
            <b>{skill.name}</b>
            <small>{skill.evidence}</small>
          </span>
        ))}
      </div>
      <h2>Projects</h2>
      {portfolio.projects.length ? (
        portfolio.projects.map((project) => (
          <div className="portfolio-project" key={project.id}>
            <b>{project.title}</b>
            <span>
              {project.progress}% milestones · {project.stack.join(", ")}
            </span>
          </div>
        ))
      ) : (
        <p>No project evidence selected yet.</p>
      )}
      <h2>Case studies</h2>
      {portfolio.caseStudies.map((item) => (
        <div
          className="portfolio-project"
          key={`${item.title}-${item.summary}`}
        >
          <b>{item.title}</b>
          <span>{item.evidence}</span>
        </div>
      ))}
      <h2>Certificates</h2>
      {portfolio.certificates.map((item) => (
        <div className="portfolio-project" key={item.credentialId}>
          <b>{item.certificateId}</b>
          <span>
            {item.credentialId} · {item.score}%
          </span>
        </div>
      ))}
    </article>
  );
}

export function PublicProfile({ username }: { username: string }) {
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "empty" | "offline" | "error"
  >("loading");
  const handleFailure = useCallback((reason: unknown) => {
    setPortfolio(null);
    if (reason instanceof ForgeApiError && reason.status === 404)
      setStatus("empty");
    else if (!navigator.onLine) setStatus("offline");
    else setStatus("error");
  }, []);
  const retry = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await forgeApi.publicPortfolio(username);
      setPortfolio(result.portfolio);
      setStatus("ready");
    } catch (reason) {
      handleFailure(reason);
    }
  }, [handleFailure, username]);
  useEffect(() => {
    let active = true;
    forgeApi
      .publicPortfolio(username)
      .then((result) => {
        if (!active) return;
        setPortfolio(result.portfolio);
        setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (active) handleFailure(reason);
      });
    return () => {
      active = false;
    };
  }, [handleFailure, username]);
  return (
    <main className="public-profile-shell">
      <a className="public-brand" href="/">
        FORGE
      </a>
      {status === "ready" && portfolio ? (
        <PortfolioPreview portfolio={portfolio} />
      ) : (
        <div
          className="panel public-profile-state"
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {status === "loading" ? (
            <>
              <LoaderCircle className="state-spinner" aria-hidden="true" />
              <h1>Loading public profile…</h1>
              <p>Checking the latest published portfolio.</p>
            </>
          ) : status === "empty" ? (
            <>
              <EyeOff aria-hidden="true" />
              <h1>Portfolio not available</h1>
              <p>This profile is private or does not exist.</p>
            </>
          ) : status === "offline" ? (
            <>
              <WifiOff aria-hidden="true" />
              <h1>You are offline</h1>
              <p>Reconnect to load this public portfolio.</p>
              <button className="secondary-button" onClick={() => void retry()}>
                <RotateCcw aria-hidden="true" /> Retry
              </button>
            </>
          ) : (
            <>
              <ShieldCheck aria-hidden="true" />
              <h1>Could not load this portfolio</h1>
              <p>The service did not respond. Your device data was not changed.</p>
              <button className="secondary-button" onClick={() => void retry()}>
                <RotateCcw aria-hidden="true" /> Try again
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
