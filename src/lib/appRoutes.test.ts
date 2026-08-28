import { describe, expect, test } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import {
  GUIDE_SLUG_BY_ID,
  getAppRouteFromPath,
  getAppRoutePath,
  getParentAppRoute,
  getGuideSlug,
  isPublicAppRoute,
  shouldRequireAuthentication,
} from "./appRoutes";

describe("application routes", () => {
  test("assigns one stable, human-readable slug to every guide", () => {
    expect(Object.keys(GUIDE_SLUG_BY_ID).sort()).toEqual(
      BLOG_ARTICLES.map((article) => article.id).sort(),
    );
    expect(new Set(Object.values(GUIDE_SLUG_BY_ID)).size).toBe(BLOG_ARTICLES.length);
    expect(getGuideSlug("guide-real-id-documents")).toBe("california-real-id-documents");
  });

  test("parses public guide routes and normalizes trailing slashes", () => {
    expect(getAppRouteFromPath("/")).toEqual({ page: "home" });
    expect(getAppRouteFromPath("/guides/")).toEqual({ page: "recommended" });
    expect(getAppRouteFromPath("/guides/california-real-id-documents")).toEqual({
      page: "blog",
      articleId: "guide-real-id-documents",
    });
    expect(getAppRouteFromPath("/guides/not-a-real-guide")).toEqual({ page: "recommended" });
  });

  test("parses private application routes", () => {
    expect(getAppRouteFromPath("/forum")).toEqual({ page: "forum" });
    expect(getAppRouteFromPath("/forum/7c91af10-5af9-4b70-8b12-47bca05a9712")).toEqual({
      page: "forumDetail",
      discussionId: "7c91af10-5af9-4b70-8b12-47bca05a9712",
    });
    expect(getAppRouteFromPath("/chatbot")).toEqual({ page: "chatbot" });
    expect(getAppRouteFromPath("/profile")).toEqual({ page: "profile" });
  });

  test("generates paths for every route", () => {
    expect(getAppRoutePath({ page: "home" })).toBe("/");
    expect(getAppRoutePath({ page: "recommended" })).toBe("/guides");
    expect(getAppRoutePath({ page: "blog", articleId: "guide-real-id-documents" })).toBe(
      "/guides/california-real-id-documents",
    );
    expect(getAppRoutePath({ page: "forum" })).toBe("/forum");
    expect(getAppRoutePath({ page: "forumDetail", discussionId: "post-1" })).toBe("/forum/post-1");
    expect(getAppRoutePath({ page: "chatbot" })).toBe("/chatbot");
    expect(getAppRoutePath({ page: "profile" })).toBe("/profile");
  });

  test("keeps reading routes public and actions private", () => {
    expect(isPublicAppRoute({ page: "home" })).toBe(true);
    expect(isPublicAppRoute({ page: "recommended" })).toBe(true);
    expect(isPublicAppRoute({ page: "blog", articleId: "category-dmv" })).toBe(true);
    expect(isPublicAppRoute({ page: "forum" })).toBe(false);
    expect(isPublicAppRoute({ page: "chatbot" })).toBe(false);
    expect(isPublicAppRoute({ page: "profile" })).toBe(false);
  });

  test("requires authentication only for private routes or explicit account actions", () => {
    expect(shouldRequireAuthentication({ page: "home" }, false)).toBe(false);
    expect(shouldRequireAuthentication({ page: "blog", articleId: "category-dmv" }, false)).toBe(
      false,
    );
    expect(shouldRequireAuthentication({ page: "blog", articleId: "category-dmv" }, true)).toBe(
      true,
    );
    expect(shouldRequireAuthentication({ page: "forum" }, false)).toBe(true);
  });

  test("returns a stable parent when browser history is unavailable", () => {
    expect(getParentAppRoute({ page: "blog", articleId: "category-dmv" })).toEqual({
      page: "recommended",
    });
    expect(getParentAppRoute({ page: "recommended" })).toEqual({ page: "home" });
    expect(getParentAppRoute({ page: "forumDetail", discussionId: "post-1" })).toEqual({
      page: "forum",
    });
    expect(getParentAppRoute({ page: "profile" })).toEqual({ page: "home" });
  });

  test("returns null for paths owned by legal routes or unknown features", () => {
    expect(getAppRouteFromPath("/privacy")).toBeNull();
    expect(getAppRouteFromPath("/unknown")).toBeNull();
  });
});
