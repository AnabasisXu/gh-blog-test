export type Publication = {
  year: string;
  title: string;
  chineseTitle?: string;
  authors: string;
  venue: string;
};

export const publications: Publication[] = [
  {
    year: "2027",
    title: "Frank Ramsey: A Sheer Excess of Powers",
    authors: "Cheryl Misak 著",
    venue: "中文译本，翻译中",
  },
  {
    year: "2023",
    title: "The Murder of Professor Schlick",
    chineseTitle: "进步知识分子的死与生",
    authors: "David Edmonds 著",
    venue: "中译本，2023 年出版",
  },
];
