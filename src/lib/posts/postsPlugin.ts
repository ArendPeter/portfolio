import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Plugin } from 'vite'
import { loadPosts } from './loadPosts'
import type { Post } from './types'

const VIRTUAL_POSTS = 'virtual:posts'
const RESOLVED_VIRTUAL_POSTS = '\0virtual:posts'
const POST_HTML_PREFIX = 'virtual:post-html/'
const RESOLVED_POST_HTML_PREFIX = '\0virtual:post-html/'

interface PluginOptions {
  postsDir: string
}

function escapeForTemplateLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function generatePostHtmlModule(post: Post, postsDir: string): string {
  let htmlTemplate = post.html
  const importLines: string[] = []

  for (let i = 0; i < post.images.length; i++) {
    const img = post.images[i]
    const imgPath = path.join(postsDir, post.slug, img).replace(/\\/g, '/')
    const varName = `_img${i}`
    importLines.push(`import ${varName} from ${JSON.stringify(imgPath)};`)

    // Replace src="<img>" with a placeholder, then swap for template expression
    const escapedImg = img.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const placeholder = `__POST_IMG_${i}__`
    htmlTemplate = htmlTemplate.replace(
      new RegExp(`src="${escapedImg}"`, 'g'),
      `src="${placeholder}"`,
    )
  }

  // Escape for template literal, then restore placeholders as interpolations
  let escaped = escapeForTemplateLiteral(htmlTemplate)
  for (let i = 0; i < post.images.length; i++) {
    const placeholder = `__POST_IMG_${i}__`
    escaped = escaped.replace(new RegExp(placeholder, 'g'), `\${_img${i}}`)
  }

  return `${importLines.join('\n')}\nexport default \`${escaped}\`;`
}

export function postsPlugin(options: PluginOptions): Plugin {
  let posts: Post[] = []
  const { postsDir } = options

  return {
    name: 'vite-plugin-posts',

    async buildStart() {
      posts = await loadPosts(postsDir)
    },

    resolveId(id) {
      if (id === VIRTUAL_POSTS) return RESOLVED_VIRTUAL_POSTS
      if (id.startsWith(POST_HTML_PREFIX))
        return RESOLVED_POST_HTML_PREFIX + id.slice(POST_HTML_PREFIX.length)
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_POSTS) {
        const summaries = posts.map(({ slug, meta, readingTime, shareImage, images }) => ({
          slug,
          meta,
          readingTime,
          shareImage,
          images,
        }))

        const loaderEntries = posts
          .map(
            (p) =>
              `${JSON.stringify(p.slug)}: () => import(${JSON.stringify(POST_HTML_PREFIX + p.slug)})`,
          )
          .join(',\n  ')

        return [
          `export const posts = ${JSON.stringify(summaries, null, 2)};`,
          `const _loaders = { ${loaderEntries} };`,
          `export async function getPostHtml(slug) {`,
          `  const loader = _loaders[slug];`,
          `  if (!loader) return null;`,
          `  const m = await loader();`,
          `  return m.default;`,
          `}`,
        ].join('\n')
      }

      if (id.startsWith(RESOLVED_POST_HTML_PREFIX)) {
        const slug = id.slice(RESOLVED_POST_HTML_PREFIX.length)
        const post = posts.find((p) => p.slug === slug)
        if (!post) return 'export default "";'
        return generatePostHtmlModule(post, postsDir)
      }
    },

    configureServer(server) {
      // Invalidate virtual module on posts changes during dev
      server.watcher.add(postsDir)
      server.watcher.on('all', (_event, filePath) => {
        if (filePath.startsWith(postsDir)) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_POSTS)
          if (mod) server.moduleGraph.invalidateModule(mod)
        }
      })
    },
  }
}

// Re-export for dev-server use if postsDir doesn't exist yet
export function safePostsPlugin(options: PluginOptions): Plugin {
  if (!fs.existsSync(options.postsDir)) {
    fs.mkdirSync(options.postsDir, { recursive: true })
  }
  return postsPlugin(options)
}
