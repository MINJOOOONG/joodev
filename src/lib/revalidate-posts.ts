import { revalidatePath } from "next/cache";

export function revalidatePostPages(...slugs: (string | undefined)[]) {
  revalidatePath("/home");
  revalidatePath("/blog");
  revalidatePath("/explore");
  revalidatePath("/explore/[category]", "page");
  revalidatePath("/sitemap.xml");

  for (const slug of Array.from(new Set(slugs))) {
    if (slug) revalidatePath(`/blog/${slug}`);
  }
}
