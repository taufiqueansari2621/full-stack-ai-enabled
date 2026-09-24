import {
  BookOpen,
  CalendarCheck,
  Clock3,
  ExternalLink,
  Play,
} from "lucide-react";
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
  const featuredVideo = recommendedResources.find(
    (item) => item.kind === "Video tutorial" && item.youtubeVideoId,
  );
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
      {featuredVideo && (
        <article className="lesson-video-resource">
          <div className="lesson-video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${featuredVideo.youtubeVideoId}`}
              title={featuredVideo.title}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="lesson-video-details">
            <span className="eyebrow">
              <Play /> VIDEO LESSON
            </span>
            <h3>{featuredVideo.title}</h3>
            <p>{featuredVideo.description}</p>
            <div
              className="lesson-video-metadata"
              aria-label="Video resource details"
            >
              <span>
                <b>{featuredVideo.provider}</b>
              </span>
              <span>
                <Clock3 /> {featuredVideo.duration}
              </span>
              <span>{featuredVideo.difficulty}</span>
              <span>
                <CalendarCheck /> Reviewed {featuredVideo.lastReviewedAt}
              </span>
              <span>{featuredVideo.qualityStatus}</span>
            </div>
            <a href={featuredVideo.url} target="_blank" rel="noreferrer">
              Watch on YouTube <ExternalLink />
            </a>
          </div>
        </article>
      )}
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
                {item.provider} · {item.resourceType} · {item.duration}
                {item.official ? " · Official" : ""}
              </span>
              <b>{item.title}</b>
              <small>{item.description}</small>
              <small>
                Reviewed {item.lastReviewedAt} · {item.qualityStatus}
              </small>
            </div>
            <ExternalLink />
          </a>
        ))}
      </div>
    </section>
  );
}
