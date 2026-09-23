import { useMemo, useState } from "react";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { curriculumLessons } from "./curriculum";
import { curriculumPhases, getPhaseModules } from "./curriculumCatalog";
import { projectCards, type NavId } from "./data";
import { interviewTopics } from "./interviewQuestionBank";
import { learningResources } from "./learningResourceCatalog";
import type { ForgeStore } from "./useForgeStore";

type SearchItem = {
  id: string;
  title: string;
  detail: string;
  kind: string;
  page: NavId;
  keywords: string;
};

export default function SearchOverlay({
  close,
  navigate,
  store,
}: {
  close: () => void;
  navigate: (id: NavId) => void;
  store: ForgeStore;
}) {
  const [query, setQuery] = useState("");
  const commands: SearchItem[] = [
    {
      id: "continue",
      title: "Continue learning",
      detail: store.state.currentPosition.lesson,
      kind: "Command",
      page: "learn",
      keywords: "continue lesson",
    },
    {
      id: "workspace",
      title: "Open workspace",
      detail: "Code, run, debug, and test",
      kind: "Command",
      page: "workspace",
      keywords: "code editor",
    },
    {
      id: "review",
      title: "Start review",
      detail: "Recall what is due",
      kind: "Command",
      page: "reviews",
      keywords: "flashcards recall",
    },
    {
      id: "ai",
      title: "Ask Forge AI",
      detail: "Open the contextual tutor",
      kind: "Command",
      page: "mentor",
      keywords: "ai help tutor",
    },
    {
      id: "project",
      title: "New project",
      detail: "Open the project workshop",
      kind: "Command",
      page: "projects",
      keywords: "create build",
    },
    {
      id: "notes",
      title: "Open notes",
      detail: "Search and edit saved knowledge",
      kind: "Command",
      page: "knowledge",
      keywords: "notes mistakes",
    },
    {
      id: "weak",
      title: "Practice weak skills",
      detail: "Use evidence to choose practice",
      kind: "Command",
      page: "progress",
      keywords: "weak skill practice",
    },
    {
      id: "interview",
      title: "Start interview",
      detail: "Begin guided interview practice",
      kind: "Command",
      page: "interview",
      keywords: "question mock",
    },
  ];
  const index = useMemo<SearchItem[]>(() => {
    const topics = curriculumPhases.flatMap((phase) =>
      getPhaseModules(phase, "both").flatMap((module) =>
        module.topics.map((topic) => ({
          id: `topic:${phase.id}:${module.id}:${topic}`,
          title: topic,
          detail: `${phase.title} · ${module.title}`,
          kind: "Topic",
          page: "roadmap" as NavId,
          keywords: `${phase.title} ${module.title} ${topic}`,
        })),
      ),
    );
    return [
      ...curriculumLessons.map((item) => ({
        id: `lesson:${item.id}`,
        title: item.title,
        detail: `${item.minutes} min · lesson`,
        kind: "Lesson",
        page: "learn" as NavId,
        keywords: `${item.title} ${item.goal} ${item.concepts.join(" ")}`,
      })),
      ...topics,
      ...projectCards.map((item) => ({
        id: `project:${item.id}`,
        title: item.title,
        detail: `${item.type} · ${item.level}`,
        kind: "Project",
        page: "projects" as NavId,
        keywords: `${item.title} ${item.description} ${item.type}`,
      })),
      ...interviewTopics.map((item) => ({
        id: `interview:${item.phaseId}:${item.moduleId}:${item.topicIndex}`,
        title: `${item.topic} interview questions`,
        detail: `${item.phase} · interview`,
        kind: "Interview",
        page: "interview" as NavId,
        keywords: `${item.topic} ${item.phase} ${item.module}`,
      })),
      ...learningResources.map((item) => ({
        id: `resource:${item.id}`,
        title: item.title,
        detail: `${item.provider} · ${item.kind}`,
        kind: "Resource",
        page: "resources" as NavId,
        keywords: `${item.title} ${item.provider} ${item.technology} ${item.description}`,
      })),
      ...store.state.knowledge.map((item) => ({
        id: `note:${item.id}`,
        title: item.title,
        detail: `${item.topic} · ${item.kind === "note" ? "note" : "mistake"}`,
        kind: item.body.includes("```") ? "Code snippet" : "Note",
        page: "knowledge" as NavId,
        keywords: `${item.title} ${item.topic} ${item.body}`,
      })),
      ...store.state.labArtifacts.map((item) => ({
        id: `lab:${item.id}`,
        title: `${item.lab.toUpperCase()} lab evidence`,
        detail: item.exerciseId,
        kind: "Code & lab",
        page: "labs" as NavId,
        keywords: `${item.lab} ${item.exerciseId} ${item.evidence}`,
      })),
    ];
  }, [store.state.knowledge, store.state.labArtifacts]);
  const normalized = query.trim().toLowerCase();
  const results = (
    normalized
      ? [...commands, ...index].filter((item) =>
          `${item.title} ${item.detail} ${item.keywords}`
            .toLowerCase()
            .includes(normalized),
        )
      : commands
  ).slice(0, 40);
  const open = (page: NavId) => {
    navigate(page);
    close();
  };
  return (
    <div className="modal-backdrop search-backdrop" onMouseDown={close}>
      <div
        className="search-modal panel command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search Forge"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="global-search">
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons, topics, projects, interviews, resources, notes…"
          />
          <button onClick={close} aria-label="Close search">
            <X />
          </button>
        </div>
        <span className="eyebrow">
          {normalized ? `${results.length} RESULTS` : "COMMANDS"}
        </span>
        <div className="search-results">
          {results.map((item) => (
            <button key={item.id} onClick={() => open(item.page)}>
              <span className="search-kind">
                {item.kind === "Command" ? <Command /> : item.kind}
              </span>
              <div>
                <b>{item.title}</b>
                <span>{item.detail}</span>
              </div>
              <ArrowRight />
            </button>
          ))}
          {!results.length && (
            <div className="no-results">
              <Search />
              <b>Nothing found</b>
              <span>
                Try a technology, lesson, project, interview topic, note, or
                resource.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
