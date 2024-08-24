import { QueryParams, createClient } from "next-sanity";
import { apiVersion, dataset, projectId, useCdn } from "./config";
import {
  allauthorsquery,
  authorsquery,
  catpathquery,
  catquery,
  configQuery,
  getAll,
  paginatedquery,
  pathquery,
  postquery,
  postsbyauthorquery,
  postsbycatquery,
  singlequery
} from "./groq";

if (!projectId) {
  console.error(
    "The Sanity Project ID is not set. Check your environment variables."
  );
}

/**
 * Checks if it's safe to create a client instance, as `@sanity/client` will throw an error if `projectId` is false
 */
const client = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn })
  : null;
export const fetcher = async ([query, params]) => {
  return client ? client.fetch(query, params) : [];
};

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}) {
  return client
    ? client.fetch<QueryResponse>(query, params, {
        next: {
          revalidate: 30, // for simple, time-based revalidation
          tags // for tag-based revalidation
        }
      })
    : [];
}

(async () => {
  if (client) {
    const data = (await sanityFetch({ query: getAll })) as any[];
    if (!data || !data.length) {
      console.error(
        "Sanity returns empty array. Are you sure the dataset is public?"
      );
    }
  }
})();

export async function getAllPosts() {
  if (client) {
    return (
      (await sanityFetch({
        query: postquery,
        tags: ["post"]
      })) || []
    );
  }
  return [];
}

export async function getSettings() {
  if (client) {
    return (
      (await sanityFetch({
        query: configQuery,
        tags: ["settings"]
      })) || []
    );
  }
  return [];
}

export async function getPostBySlug(slug) {
  if (client) {
    return (
      (await sanityFetch({
        query: singlequery,
        params: { slug },
        tags: ["post"]
      })) || {}
    );
  }
  return {};
}

export async function getAllPostsSlugs() {
  if (client) {
    const slugs: any[] =
      (await sanityFetch({
        query: pathquery,
        tags: ["post"]
      })) || [];
    return slugs.map(slug => ({ slug }));
  }
  return [];
}
// Author
export async function getAllAuthorsSlugs() {
  if (client) {
    const slugs: any[] =
      (await sanityFetch({
        query: authorsquery,
        tags: ["author"]
      })) || [];
    return slugs.map(slug => ({ author: slug }));
  }
  return [];
}

export async function getAuthorPostsBySlug(slug) {
  if (client) {
    return (
      (await sanityFetch({
        query: postsbyauthorquery,
        params: { slug },
        tags: ["post"]
      })) || {}
    );
  }
  return {};
}

export async function getAllAuthors() {
  if (client) {
    return (
      (await sanityFetch({
        query: allauthorsquery,
        tags: ["author"]
      })) || []
    );
  }
  return [];
}

// Category

export async function getAllCategories() {
  if (client) {
    const slugs: any[] =
      (await sanityFetch({
        query: catpathquery,
        tags: ["category"]
      })) || [];
    return slugs.map(slug => ({ category: slug }));
  }
  return [];
}

export async function getPostsByCategory(slug) {
  if (client) {
    return (
      (await sanityFetch({
        query: postsbycatquery,
        params: { slug },
        tags: ["post"]
      })) || {}
    );
  }
  return {};
}

export async function getTopCategories() {
  if (client) {
    return (
      (await sanityFetch({
        query: catquery,
        tags: ["category"]
      })) || []
    );
  }
  return [];
}

export async function getPaginatedPosts({ limit, pageIndex = 0 }) {
  if (client) {
    return (
      (await sanityFetch({
        query: paginatedquery,
        params: { pageIndex: pageIndex, limit: limit },
        tags: ["post"]
      })) || []
    );
  }
  return [];
}
