const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const catalogLessonId = (
  phaseId: string,
  moduleId: string,
  topic: string,
) => `catalog-${phaseId}-${moduleId}-${slug(topic)}`;
