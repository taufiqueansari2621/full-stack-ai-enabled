import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  Lightbulb,
  PlayCircle,
  Save,
} from "lucide-react";
import type { TopicExampleCase } from "./topicExampleCases";
import type { ForgeStore } from "./useForgeStore";

type CaseDraft = {
  prediction: string;
  reflection: string;
};

export function InteractiveExampleLab({
  lessonId,
  topic,
  cases,
  store,
}: {
  lessonId: string;
  topic: string;
  cases: TopicExampleCase[];
  store: ForgeStore;
}) {
  const savedRecords = store.state.exampleLabRecords.filter(
    (record) => record.lessonId === lessonId,
  );
  const [activeId, setActiveId] = useState<TopicExampleCase["id"]>(
    savedRecords.length === cases.length
      ? "normal"
      : (cases.find(
          (item) =>
            !savedRecords.some((record) => record.caseId === item.id),
        )?.id ?? "normal"),
  );
  const [drafts, setDrafts] = useState<Record<string, CaseDraft>>(() =>
    Object.fromEntries(
      savedRecords.map((record) => [
        record.caseId,
        {
          prediction: record.prediction,
          reflection: record.reflection,
        },
      ]),
    ),
  );
  const [revealedIds, setRevealedIds] = useState<string[]>(() =>
    savedRecords.map((record) => record.caseId),
  );

  const activeIndex = Math.max(
    0,
    cases.findIndex((item) => item.id === activeId),
  );
  const activeCase = cases[activeIndex];
  const draft = drafts[activeCase.id] ?? {
    prediction: "",
    reflection: "",
  };
  const revealed = revealedIds.includes(activeCase.id);
  const saved = savedRecords.find(
    (record) => record.caseId === activeCase.id,
  );
  const completeCount = cases.filter((item) =>
    savedRecords.some((record) => record.caseId === item.id),
  ).length;

  const updateDraft = (next: Partial<CaseDraft>) =>
    setDrafts((current) => ({
      ...current,
      [activeCase.id]: { ...draft, ...next },
    }));

  const reveal = () => {
    if (draft.prediction.trim().length < 20) return;
    setRevealedIds((current) =>
      current.includes(activeCase.id)
        ? current
        : [...current, activeCase.id],
    );
  };

  const save = () => {
    if (
      !revealed ||
      draft.prediction.trim().length < 20 ||
      draft.reflection.trim().length < 30
    )
      return;
    store.saveExampleLabRecord({
      lessonId,
      caseId: activeCase.id,
      prediction: draft.prediction.trim(),
      reflection: draft.reflection.trim(),
    });
  };

  const openNext = () => {
    const next = cases[(activeIndex + 1) % cases.length];
    setActiveId(next.id);
  };

  return (
    <section className="lesson-section interactive-example-lab panel">
      <header className="example-lab-heading">
        <div>
          <span className="eyebrow teal">INTERACTIVE EXAMPLE LAB</span>
          <h2>See {topic} change in real situations</h2>
          <p>
            Read the situation, predict the result, then reveal the explanation.
            Your prediction matters more than guessing perfectly.
          </p>
        </div>
        <div
          className="example-lab-score"
          aria-label={`${completeCount} of ${cases.length} example cases saved`}
        >
          <b>
            {completeCount}/{cases.length}
          </b>
          <span>cases saved</span>
        </div>
      </header>

      <div className="example-case-tabs" role="tablist" aria-label="Example cases">
        {cases.map((item) => {
          const complete = savedRecords.some(
            (record) => record.caseId === item.id,
          );
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={activeCase.id === item.id}
              className={activeCase.id === item.id ? "active" : ""}
              onClick={() => setActiveId(item.id)}
            >
              <span>
                {complete ? (
                  <Check />
                ) : item.id === "failure" ? (
                  <AlertTriangle />
                ) : (
                  <PlayCircle />
                )}
              </span>
              <span>
                <b>{item.label}</b>
                <small>{item.level}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="example-lab-workspace" role="tabpanel">
        <div className="example-lab-scenario">
          <span className="eyebrow">1 · READ THE SITUATION</span>
          <h3>{activeCase.label}</h3>
          <p>{activeCase.situation}</p>
          <div>
            <b>Action or example</b>
            <pre className="code-block wrap-code">
              <code>{activeCase.action}</code>
            </pre>
          </div>
        </div>

        <div className="example-lab-response">
          <label>
            <span>
              <b>2 · Predict before revealing</b>
              <small>{draft.prediction.trim().length}/20 minimum characters</small>
            </span>
            <textarea
              value={draft.prediction}
              onChange={(event) =>
                updateDraft({ prediction: event.target.value })
              }
              placeholder="I expect this result because…"
            />
          </label>
          <button
            className="secondary-button"
            disabled={draft.prediction.trim().length < 20 || revealed}
            onClick={reveal}
          >
            <Eye /> {revealed ? "Explanation revealed" : "Reveal result"}
          </button>
        </div>

        {revealed && (
          <div className="example-lab-result" aria-live="polite">
            <div>
              <CheckCircle2 />
              <span>
                <b>Expected result</b>
                {activeCase.expected}
              </span>
            </div>
            <div>
              <Lightbulb />
              <span>
                <b>Why this happens</b>
                {activeCase.explanation}
              </span>
            </div>
            <p>
              <b>Think one step further:</b> {activeCase.nextQuestion}
            </p>
          </div>
        )}

        {revealed && (
          <div className="example-lab-reflection">
            <label>
              <span>
                <b>3 · Compare and explain</b>
                <small>{draft.reflection.trim().length}/30 minimum characters</small>
              </span>
              <textarea
                value={draft.reflection}
                onChange={(event) =>
                  updateDraft({ reflection: event.target.value })
                }
                placeholder="My prediction was right or wrong because… Next time I will check…"
              />
            </label>
            <div>
              <button
                className="primary-button"
                disabled={draft.reflection.trim().length < 30}
                onClick={save}
              >
                <Save /> {saved ? "Update my answer" : "Save this case"}
              </button>
              {saved && (
                <button className="secondary-button" onClick={openNext}>
                  Next case <ArrowRight />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
