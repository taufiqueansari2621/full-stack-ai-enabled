import { HttpError, json, type Route } from "../http";
import { LearningRecordsRepository } from "../repositories/learningRecords";

function cursor(url: URL): string {
  const value = url.searchParams.get("after") ?? "";
  if (value.length > 1000)
    throw new HttpError(400, "INVALID_CURSOR", "Record cursor is too long.");
  return value;
}
export const learningRecordRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/learning-records",
    auth: true,
    async handler({ env, user, url }) {
      const repository = new LearningRecordsRepository(env.DB, user!.id);
      const kind = url.searchParams.get("kind");
      if (kind === "projects")
        return json(await repository.projects(cursor(url)));
      if (kind === "interviews")
        return json(await repository.interviews(cursor(url)));
      throw new HttpError(
        400,
        "INVALID_RECORD_KIND",
        "Choose projects or interviews.",
      );
    },
  },
  {
    method: "GET",
    pattern: "/api/learning-records/interview",
    auth: true,
    async handler({ env, user, url }) {
      const id = url.searchParams.get("id") ?? "";
      if (!id || id.length > 400)
        throw new HttpError(
          400,
          "INVALID_SESSION_ID",
          "Choose an interview session.",
        );
      return json(
        await new LearningRecordsRepository(env.DB, user!.id).answers(
          id,
          cursor(url),
        ),
      );
    },
  },
];
