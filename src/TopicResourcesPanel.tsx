import { BookOpen, ExternalLink } from "lucide-react";
import type { FrameworkTrack } from "./curriculumCatalog";
import { getTopicResources } from "./topicResources";

export default function TopicResourcesPanel({
  phaseId,
  moduleTrack,
  topic,
}: {
  phaseId: string;
  moduleTrack?: FrameworkTrack;
  topic?: string;
}) {
  const recommendedResources = getTopicResources(phaseId, moduleTrack, topic);
  return (
    <section className="lesson-resources panel">
      <div className="lesson-resources-heading">
        <div>
          <span className="eyebrow">OFFICIAL AND TRUSTED RESOURCES</span>
          <h2>Read the guide, then practice from memory</h2>
        </div>
        <BookOpen />
      </div>
      <p>
        Use these guides to check details and learn more. Opening a link does
        not complete the lesson.
      </p>
      <div className="lesson-resource-grid">
        {recommendedResources.map((item) => (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            key={item.id}
          >
            <div>
              <span>
                {item.provider}
                {item.official ? " · Official" : ""}
              </span>
              <b>{item.title}</b>
              <small>{item.description}</small>
            </div>
            <ExternalLink />
          </a>
        ))}
      </div>
    </section>
  );
}
