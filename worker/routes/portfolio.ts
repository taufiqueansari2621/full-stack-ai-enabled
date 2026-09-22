import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";

type PortfolioRow = {
  username: string;
  fullName: string;
  published: number;
  about: string;
  skillsJson: string;
  projectsJson: string;
  caseStudiesJson: string;
  certificatesJson: string;
  updatedAt: string;
};
const select = `SELECT pp.username, p.full_name AS fullName, pp.published, pp.about,
 pp.skills_json AS skillsJson, pp.projects_json AS projectsJson,
 pp.case_studies_json AS caseStudiesJson, pp.certificates_json AS certificatesJson,
 pp.updated_at AS updatedAt FROM public_portfolios pp JOIN profiles p ON p.user_id = pp.user_id`;

function array(value: unknown, max: number, itemMax: number) {
  if (!Array.isArray(value) || value.length > max)
    throw new HttpError(
      400,
      "INVALID_PORTFOLIO",
      "Portfolio collection is invalid.",
    );
  for (const item of value)
    if (
      !item ||
      typeof item !== "object" ||
      JSON.stringify(item).length > itemMax
    )
      throw new HttpError(
        400,
        "INVALID_PORTFOLIO_ITEM",
        "A portfolio item is invalid.",
      );
  return JSON.stringify(value);
}
function response(row: PortfolioRow) {
  return {
    username: row.username,
    fullName: row.fullName,
    published: Boolean(row.published),
    about: row.about,
    skills: JSON.parse(row.skillsJson),
    projects: JSON.parse(row.projectsJson),
    caseStudies: JSON.parse(row.caseStudiesJson),
    certificates: JSON.parse(row.certificatesJson),
    updatedAt: row.updatedAt,
  };
}

export const portfolioRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/portfolio",
    auth: true,
    async handler({ env, user }) {
      const row = await env.DB.prepare(`${select} WHERE pp.user_id = ?`)
        .bind(user!.id)
        .first<PortfolioRow>();
      return json({ portfolio: row ? response(row) : null });
    },
  },
  {
    method: "PUT",
    pattern: "/api/portfolio",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 96_000);
      const about = typeof body.about === "string" ? body.about.trim() : "";
      if (about.length > 1200)
        throw new HttpError(
          400,
          "ABOUT_TOO_LONG",
          "About must be at most 1,200 characters.",
        );
      const skills = array(body.skills, 30, 300),
        projects = array(body.projects, 20, 4000),
        cases = array(body.caseStudies, 20, 6000),
        certificates = array(body.certificates, 20, 1200);
      const profile = await env.DB.prepare(
        "SELECT username FROM profiles WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<{ username: string }>();
      if (!profile)
        throw new HttpError(404, "PROFILE_NOT_FOUND", "Profile not found.");
      const published = body.published === true ? 1 : 0,
        updatedAt = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO public_portfolios (user_id, username, published, about, skills_json, projects_json, case_studies_json, certificates_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET username=excluded.username, published=excluded.published, about=excluded.about, skills_json=excluded.skills_json, projects_json=excluded.projects_json, case_studies_json=excluded.case_studies_json, certificates_json=excluded.certificates_json, updated_at=excluded.updated_at`,
      )
        .bind(
          user!.id,
          profile.username,
          published,
          about,
          skills,
          projects,
          cases,
          certificates,
          updatedAt,
        )
        .run();
      const row = await env.DB.prepare(`${select} WHERE pp.user_id = ?`)
        .bind(user!.id)
        .first<PortfolioRow>();
      return json({ portfolio: response(row!) });
    },
  },
  {
    method: "GET",
    pattern: "/api/public-profile",
    async handler({ env, url }) {
      const username = url.searchParams.get("username") ?? "";
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username))
        throw new HttpError(
          404,
          "PROFILE_NOT_FOUND",
          "Public profile not found.",
        );
      const row = await env.DB.prepare(
        `${select} WHERE pp.username = ? AND pp.published = 1`,
      )
        .bind(username)
        .first<PortfolioRow>();
      if (!row)
        throw new HttpError(
          404,
          "PROFILE_NOT_FOUND",
          "Public profile not found.",
        );
      return json({ portfolio: response(row) }, 200, {
        "cache-control": "public, max-age=60",
      });
    },
  },
];
