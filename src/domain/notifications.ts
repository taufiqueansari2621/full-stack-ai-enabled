import { Bell, CheckCircle2, Clock3, FolderKanban } from "lucide-react";
import type { NavId } from "../data";
import type { ForgeStore } from "../useForgeStore";

export type LearningNotification = {
  id: string;
  title: string;
  detail: string;
  page: NavId;
  icon: typeof Bell;
};

export function buildNotifications(
  store: ForgeStore,
  now: number,
): LearningNotification[] {
  const due = store.state.reviewSchedule.filter(
    (item) => new Date(item.nextReviewAt).getTime() <= now,
  ).length;
  const projectMilestones = Object.values(store.state.projectTasks).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  const sql = [...store.state.labArtifacts]
    .reverse()
    .find((item) => item.lab === "sql");
  const currentAge =
    now - new Date(store.state.currentPosition.updatedAt).getTime();
  return [
    ...(due
      ? [
          {
            id: "reviews",
            title: `${due} review${due === 1 ? " is" : "s are"} due`,
            detail: "Recall these before adding new material.",
            page: "reviews" as NavId,
            icon: Clock3,
          },
        ]
      : []),
    ...(projectMilestones > 0
      ? [
          {
            id: "project",
            title: "Continue your active project",
            detail: `${projectMilestones} milestones are saved; choose the next unfinished step.`,
            page: "projects" as NavId,
            icon: FolderKanban,
          },
        ]
      : []),
    ...(!sql || now - new Date(sql.updatedAt).getTime() > 14 * 86_400_000
      ? [
          {
            id: "sql",
            title: "SQL has no recent evidence",
            detail: "Use the SQL lab when it supports your current goal.",
            page: "labs" as NavId,
            icon: Bell,
          },
        ]
      : []),
    ...(currentAge > 86_400_000
      ? [
          {
            id: "continue",
            title: `Continue ${store.state.currentPosition.lesson}`,
            detail: `Return to ${store.state.currentPosition.section}.`,
            page: "learn" as NavId,
            icon: CheckCircle2,
          },
        ]
      : []),
  ];
}
