import { useEffect, useRef, useState } from "react";
import { forgeApi } from "./services/forgeApi";
import "./cloudRecords.css";
import type {
  RecordPage,
  SavedProject,
  SavedInterviewSession,
  SavedInterviewAnswer,
} from "./domain/learningRecords";

export default function CloudLearningRecords() {
  const [kind, setKind] = useState<"projects" | "interviews">("projects");
  const [records, setRecords] = useState<RecordPage<
    SavedProject | SavedInterviewSession
  > | null>(null);
  const [answers, setAnswers] = useState<{
    id: string;
    page: RecordPage<SavedInterviewAnswer>;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const load = async (after = "", session?: string) => {
    pending.current?.abort();
    const request = new AbortController();
    pending.current = request;
    setBusy(true);
    setError("");
    try {
      if (!navigator.onLine)
        throw new Error(
          "Offline. Your local progress is safe; reconnect to load cloud records.",
        );
      if (session) {
        const page = await forgeApi.interviewAnswers(
          session,
          after,
          request.signal,
        );
        if (pending.current === request) setAnswers({ id: session, page });
      } else {
        const page =
          kind === "projects"
            ? await forgeApi.projectRecords(after, request.signal)
            : await forgeApi.interviewSessions(after, request.signal);
        if (pending.current === request) {
          setRecords(page);
          setAnswers(null);
        }
      }
    } catch (reason) {
      if (!request.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "Cloud records are unavailable. Try again.",
        );
    } finally {
      if (pending.current === request) setBusy(false);
    }
  };
  return (
    <section
      className="page panel cloud-learning-records"
      aria-label="Cloud learning records"
    >
      <h2>Cloud learning records</h2>
      <p>
        Read your saved project milestones and interview sessions independently
        of the full progress snapshot. Wait for cloud saving to finish, then
        refresh. These records do not award extra mastery.
      </p>
      <label>
        Record type{" "}
        <select
          aria-label="Cloud record type"
          disabled={busy}
          value={kind}
          onChange={(event) => {
            setKind(event.target.value as "projects" | "interviews");
            setRecords(null);
            setAnswers(null);
            setError("");
          }}
        >
          <option value="projects">Project milestones</option>
          <option value="interviews">Interview sessions</option>
        </select>
      </label>
      <button disabled={busy} onClick={() => void load()}>
        {busy ? "Loading cloud records…" : "Load cloud records"}
      </button>
      {error && <p role="alert">{error} Use Load cloud records to retry.</p>}
      {records && !records.records.length && (
        <p role="status">No saved {kind} on this page yet.</p>
      )}
      {records?.records.map((item) => (
        <article key={item.id}>
          {"completedTaskIds" in item ? (
            <>
              <h3>Project {item.id}</h3>
              <p>
                {item.completedTaskIds.length} completed milestones:{" "}
                {item.completedTaskIds.join(", ") || "none"}
              </p>
            </>
          ) : (
            <>
              <h3>
                {item.legacy
                  ? "Earlier single-answer practice"
                  : "Interview session"}
              </h3>
              <p>
                {item.answerCount} saved answers ·{" "}
                {item.averageScore.toFixed(1)}% average structure score
                (learner-reported, not verified correctness).
              </p>
              <p>
                First answer: {new Date(item.firstAnswerAt).toLocaleString()} ·
                Last answer: {new Date(item.lastAnswerAt).toLocaleString()}.
                Saved answers do not imply a completed session.
              </p>
              <button disabled={busy} onClick={() => void load("", item.id)}>
                Show saved answers
              </button>
            </>
          )}
        </article>
      ))}
      {records?.next && (
        <button disabled={busy} onClick={() => void load(records.next!)}>
          Next records
        </button>
      )}
      {answers && (
        <div aria-label="Saved interview answers">
          <h3>Saved answers</h3>
          {!answers.page.records.length && (
            <p>No saved answers on this page.</p>
          )}
          {answers.page.records.map((item) => (
            <article key={item.id}>
              <h4>{item.question}</h4>
              <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {item.answer}
              </p>
              <p>{item.score}% structure score</p>
            </article>
          ))}
          {answers.page.next && (
            <button
              disabled={busy}
              onClick={() => void load(answers.page.next!, answers.id)}
            >
              Next answers
            </button>
          )}
        </div>
      )}
    </section>
  );
}
