import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  Lightbulb,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import type { ForgeStore } from "./useForgeStore";

type DeepDiveLabProps = {
  topic: string;
  phaseTitle: string;
  lessonId: string;
  mentalModel: string;
  qualityRule: string;
  productionRule: string;
  example: string;
  store: ForgeStore;
};

const stages = [
  { label: "Make a guess", icon: BrainCircuit },
  { label: "Compare", icon: Eye },
  { label: "Try a new case", icon: Sparkles },
  { label: "Explain it", icon: MessageSquareText },
] as const;

export function DeepDiveLab({
  topic,
  phaseTitle,
  lessonId,
  mentalModel,
  qualityRule,
  productionRule,
  example,
  store,
}: DeepDiveLabProps) {
  const previouslySaved = store.state.practiceAttempts.some(
    (attempt) => attempt.challengeId === `${lessonId}-deep-dive`,
  );
  const [stage, setStage] = useState(0);
  const [furthestStage, setFurthestStage] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [transfer, setTransfer] = useState("");
  const [teachBack, setTeachBack] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [confidence, setConfidence] = useState<"review" | "ready" | "">("");
  const [saved, setSaved] = useState(previouslySaved);

  const canContinue =
    (stage === 0 && prediction.trim().length >= 20) ||
    stage === 1 ||
    (stage === 2 && transfer.trim().length >= 30);

  const continueForward = () => {
    const next = Math.min(stage + 1, stages.length - 1);
    setStage(next);
    setFurthestStage((current) => Math.max(current, next));
  };

  const saveEvidence = () => {
    if (teachBack.trim().length < 40 || !confidence || saved) return;
    const body = [
      `Prediction: ${prediction.trim()}`,
      `Transfer: ${transfer.trim()}`,
      `Teach-back: ${teachBack.trim()}`,
      `Confidence: ${confidence === "ready" ? "Ready to apply" : "Needs review"}`,
    ].join("\n\n");
    store.saveAttempt({
      challengeId: `${lessonId}-deep-dive`,
      answer: body,
      correct: confidence === "ready",
    });
    store.addKnowledge({
      kind: "note",
      title: `${topic} · Deep dive`,
      body,
      topic: phaseTitle,
    });
    setSaved(true);
  };

  return (
    <section className="lesson-section deep-dive-lab panel">
      <div className="deep-dive-heading">
        <div>
          <span className="eyebrow teal">DEEPER PRACTICE</span>
          <h2>Check your understanding of {topic}</h2>
          <p>
            Make a guess first. Compare it with the example. Try a different
            situation, then explain the idea in your own words.
          </p>
        </div>
        <span className="deep-dive-time">≈ 8 min</span>
      </div>

      <div className="deep-dive-progress" aria-label="Deep dive progress">
        {stages.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            className={index === stage ? "active" : index < stage ? "done" : ""}
            disabled={index > furthestStage}
            onClick={() => setStage(index)}
            aria-current={index === stage ? "step" : undefined}
          >
            <span>{index < furthestStage ? <Check /> : <Icon />}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="deep-dive-stage">
        {stage === 0 && (
          <>
            <span className="eyebrow">01 · THINK BEFORE READING</span>
            <h3>What do you think happens?</h3>
            <p>
              Without looking back, say what goes in, what changes, what comes
              out, and one thing that may go wrong with {topic}.
            </p>
            <textarea
              value={prediction}
              onChange={(event) => setPrediction(event.target.value)}
              placeholder="I think this will happen because…"
              aria-label={`Your prediction about ${topic}`}
            />
            <small>{prediction.trim().length}/20 characters · write at least 20</small>
          </>
        )}

        {stage === 1 && (
          <>
            <span className="eyebrow">02 · COMPARE WITH THE EXAMPLE</span>
            <h3>What did you get right or miss?</h3>
            <p>{mentalModel}</p>
            <pre className="code-block"><code>{example}</code></pre>
            <div className="deep-dive-rule">
              <Lightbulb />
              <div><b>Good habit</b><p>{qualityRule}</p></div>
            </div>
            <p className="deep-dive-reflect">
              Name one part you got right and one part you would change. Your
              first answer does not need to be perfect.
            </p>
          </>
        )}

        {stage === 2 && (
          <>
            <span className="eyebrow">03 · TRY A NEW SITUATION</span>
            <h3>Change one condition</h3>
            <p>
              Imagine {topic} is used in a real {phaseTitle} product and the
              normal input becomes empty, late, repeated, or invalid. Pick one
              change. Say what should happen and how you would check it.
            </p>
            <textarea
              value={transfer}
              onChange={(event) => setTransfer(event.target.value)}
              placeholder="If this input changes, I expect…"
              aria-label={`Transfer challenge for ${topic}`}
            />
            <small>{transfer.trim().length}/30 characters · write at least 30</small>
            <button
              className="hint-button deep-dive-hint"
              onClick={() => setHintLevel((value) => Math.min(value + 1, 2))}
              disabled={hintLevel === 2}
            >
              <Lightbulb />
              {hintLevel === 0 ? "Give me a small hint" : hintLevel === 1 ? "One more hint" : "All hints shown"}
            </button>
            {hintLevel >= 1 && <p className="hint-copy">Start with: “The changed input enters this part of the system…”</p>}
            {hintLevel >= 2 && <p className="hint-copy">Then name the result you can see, the sign of an error, and one small test that could show your guess is wrong.</p>}
          </>
        )}

        {stage === 3 && (
          <>
            <span className="eyebrow">04 · EXPLAIN IT YOURSELF</span>
            <h3>Use clear, everyday English</h3>
            <p>
              In four or five sentences, explain {topic}, give one concrete
              example, name one cost or limitation, and say how you would check it.
            </p>
            <textarea
              value={teachBack}
              onChange={(event) => setTeachBack(event.target.value)}
              placeholder="I would explain it like this…"
              aria-label={`Teach-back explanation for ${topic}`}
            />
            <small>{teachBack.trim().length}/40 characters · write at least 40</small>
            <div className="deep-dive-rule">
              <Lightbulb />
              <div><b>In a real app</b><p>{productionRule}</p></div>
            </div>
            <fieldset className="confidence-check">
              <legend>How confident do you feel?</legend>
              <label><input type="radio" name={`${lessonId}-confidence`} checked={confidence === "review"} onChange={() => setConfidence("review")} /> I need another example</label>
              <label><input type="radio" name={`${lessonId}-confidence`} checked={confidence === "ready"} onChange={() => setConfidence("ready")} /> I can use this without help</label>
            </fieldset>
          </>
        )}
      </div>

      <div className="deep-dive-actions">
        <button disabled={stage === 0} onClick={() => setStage((value) => value - 1)}>
          <ArrowLeft /> Back
        </button>
        {stage < stages.length - 1 ? (
          <button className="primary-button" disabled={!canContinue} onClick={continueForward}>
            Continue <ArrowRight />
          </button>
        ) : (
          <button className="primary-button" disabled={teachBack.trim().length < 40 || !confidence || saved} onClick={saveEvidence}>
            <Check /> {saved ? "Work saved" : "Save my work"}
          </button>
        )}
      </div>
    </section>
  );
}
