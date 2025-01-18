import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import OnThisPage from "@/components/onthispage";

// Generate dynamic paths
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "content");
  const filenames = fs.readdirSync(contentDir);

  return filenames.map((filename) => ({
    slug: filename.replace(".md", ""),
  }));
}

// Dynamic route page
export default async function Page({ params }) {
  const { slug } = params;

  const filepath = path.join(process.cwd(), `content/${slug}.md`);
  if (!fs.existsSync(filepath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filepath, "utf-8");
  const { content, data } = matter(fileContent);

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypePrettyCode, { theme: "github-dark" })
    .use(rehypeStringify);

  const htmlContent = (await processor.process(content)).toString();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
      <p className="text-base mb-2 border-l-4 border-gray-500 pl-4 italic">
        &quot;{data.description}&quot;
      </p>
      <div className="flex gap-2">
        <p className="text-sm text-gray-500 mb-4 italic">By {data.author}</p>
        <p className="text-sm text-gray-500 mb-4">{data.date}</p>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="prose dark:prose-invert"
      ></div>
      <OnThisPage htmlContent={htmlContent} />
    </div>
  );
}
