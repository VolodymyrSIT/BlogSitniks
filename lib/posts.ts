import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings/lib'
import rehypeHighlight from 'rehype-highlight/lib'
import rehypeSlug from 'rehype-slug'
import Video from '@/app/components/Video'
import CustomImage from '@/app/components/CustomImage'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
const postsDirectory = path.join(process.cwd(), 'blogposts')
type Filetree = {
    "tree": [
        {
            "path": string,
        }
    ]
}

export async function getPostByName(fileName: string): Promise<BlogPost | undefined> {
    const res = await fetch(`https://raw.githubusercontent.com/gitdagray/test-blogposts/main/${fileName}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28',
        }
    })

    if (!res.ok) return undefined

    const rawMDX = await res.text()

    if (rawMDX === '404: Not Found') return undefined

    const { frontmatter, content } = await compileMDX<{ title: string, date: string, tags: string[] }>({
        source: rawMDX,
        components: {
            Video,
            CustomImage,
        },
        options: {
            parseFrontmatter: true,
            mdxOptions: {
                rehypePlugins: [
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, {
                        behavior: 'wrap'
                    }],
                ],
            },
        }
    })

    const id = fileName.replace(/\.mdx$/, '')

    const blogPostObj: BlogPost = { meta: { id, title: frontmatter.title, date: frontmatter.date, tags: frontmatter.tags }, content }

    return blogPostObj
}

export async function getPostsMeta(): Promise<any | undefined> {
    let posts = getSortedPostsData();
    // console.log(posts)
    // const res = await fetch('https://api.github.com/repos/gitdagray/test-blogposts/git/trees/main?recursive=1', {
    //     headers: {
    //         Accept: 'application/vnd.github+json',
    //         Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    //         'X-GitHub-Api-Version': '2022-11-28',
    //     }
    // })
    //
    // if (!res.ok) return undefined
    //
    // const repoFiletree: Filetree = await res.json()
    //
    // const filesArray = repoFiletree.tree.map(obj => obj.path).filter(path => path.endsWith('.mdx'))
    //
    // const posts: Meta[] = []
    //
    // for (const file of filesArray) {
    //     const post = await getPostByName(file)
    //     if (post) {
    //         const { meta } = post
    //         posts.push(meta)
    //     }
    // }

    // return posts.sort((a, b) => a.date < b.date ? 1 : -1)
    return posts;
}

export async function getPostData(id: string) {
    const fullPath = path.join(postsDirectory, `${id}`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    // console.log(fileContents)


    // const rawMDX = await res.text()

    if (fileContents === '404: Not Found') return undefined

    const { frontmatter, content } = await compileMDX<{ title: string, date: string, tags: string[] }>({
        source: fileContents,
        components: {
            Video,
            CustomImage,
        },
        options: {
            parseFrontmatter: true,
            mdxOptions: {
                rehypePlugins: [
                    rehypeHighlight,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, {
                        behavior: 'wrap'
                    }],
                ],
            },
        }
    })

    // const id = fileName.replace(/\.mdx$/, '')

    const blogPostObj: BlogPost = { meta: { id, title: frontmatter.title, date: frontmatter.date, tags: frontmatter.tags }, content }
    // console.log(blogPostObj)
    return blogPostObj





    //
    // // Use gray-matter to parse the post metadata section
    // const matterResult = matter(fileContents);
    // console.log(fileContents)
    // const processedContent = await remark()
    //     .use(html)
    //     .process(matterResult.content);
    //
    // const contentHtml = processedContent.toString();
    //
    //
    // const blogPostWithHTML: { date: any; id: string; title: any; contentHtml: string } = {
    //     id,
    //     title: matterResult.data.title,
    //     date: matterResult.data.date,
    //     contentHtml,
    // }
    //
    // // Combine the data with the id
    // return blogPostWithHTML
}

export function getSortedPostsData() {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        const blogPost: { date: any; id: string; title: any } = {
            id,
            title: matterResult.data.title,
            date: matterResult.data.date,
        }

        // Combine the data with the id
        return blogPost
    });
    // Sort posts by date
    return allPostsData.sort((a, b) => a.date < b.date ? 1 : -1);
}
