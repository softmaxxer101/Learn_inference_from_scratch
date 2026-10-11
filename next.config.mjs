import createMDX from "@next/mdx";

/**
 * Static export: the whole core path must work with no backend, deployable to
 * Vercel / Netlify / GitHub Pages. See docs/DECISIONS.md (D-002).
 *
 * `basePath` is read from `NEXT_PUBLIC_BASE_PATH` because a GitHub Pages
 * *project* site is served from `/<repo>/`, not from the domain root: without it
 * every `/_next/…` asset is requested from the wrong place and the page arrives
 * unstyled and inert. It defaults to empty, so local dev, `npm run build` on its
 * own, and the root-deployed hosts are unchanged. The deploy workflow sets it
 * from the repository name; see docs/GITHUB.md.
 *
 * Next rewrites `_next` assets, `<Link>` and the router for this. It cannot
 * rewrite a plain `fetch("/artifacts/…")` or `new Worker("/labs/…")`, so runtime
 * paths go through `withBasePath()` in `lib/base-path.ts`.
 *
 * @type {import('next').NextConfig}
 */
const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");

// A base path is one root-relative segment. Anything else is a mistake worth
// stopping the build for: Git Bash on Windows rewrites an environment value
// that looks like a path, so `NEXT_PUBLIC_BASE_PATH=/my-repo ... npm run build`
// arrives here as `C:/Program Files/Git/my-repo`, which Next would accept and
// bake into every asset URL. See docs/GITHUB.md.
if (rawBasePath && !/^\/[A-Za-z0-9._~-]+$/.test(rawBasePath)) {
  throw new Error(
    `NEXT_PUBLIC_BASE_PATH must be a single path segment such as "/my-repo"; got ${JSON.stringify(
      rawBasePath,
    )}. In Git Bash on Windows, prefix the command with ` +
      "MSYS2_ENV_CONV_EXCL='*' MSYS_NO_PATHCONV=1 to stop MSYS rewriting the value.",
  );
}

const basePath = rawBasePath;

const nextConfig = {
  output: "export",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  images: { unoptimized: true },
  transpilePackages: ["three"],
  ...(basePath && basePath !== "/" ? { basePath } : {}),
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [["remark-math"], ["remark-gfm"]],
    rehypePlugins: [
      ["rehype-slug"],
      ["rehype-katex", { strict: false, throwOnError: false }],
    ],
  },
});

export default withMDX(nextConfig);
