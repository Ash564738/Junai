// src/lib/sheet-mapping.ts
export const SHEET_NAMES = [
  "Truyện chữ",
  "Manga",
  "Manhwa",
  "Manhua",
  "Truyện tranh BL",
  "Phim/Anime",
  "Doujinshi",
  "Fanfic",
] as const;

export type SheetName = (typeof SHEET_NAMES)[number];

export type ContentType =
  | "TRUYEN_CHU"
  | "MANGA"
  | "MANHWA"
  | "MANHUA"
  | "BL_COMIC"
  | "PHIM_ANIME"
  | "DOUJINSHI"
  | "FANFIC";

type SheetMapping = {
  type: ContentType;
  titleCols: string[];
  imageCols: string[];
  genreCols: string[];
  accessCols: string[];
  specialCols: Record<string, string[]>;
};

export const SHEET_MAPPING: Record<SheetName, SheetMapping> = {
  "Truyện chữ": {
    type: "TRUYEN_CHU",
    titleCols: ["Tên truyện"],
    imageCols: ["Ảnh bìa", "Ảnh Bìa"],
    genreCols: ["Thể Loại Truyện", "Thể loại truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      author: ["Tác giả"],
      xuatBan: ["Xuất bản"],
    },
  },
  Manga: {
    type: "MANGA",
    titleCols: ["Tên truyện"],
    imageCols: ["Ảnh bìa", "Ảnh Bìa"],
    genreCols: ["Thể loại truyện", "Thể Loại Truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      author: ["Tác giả"],
      xuatBan: ["Xuất bản"],
    },
  },
  Manhwa: {
    type: "MANHWA",
    titleCols: ["Tên truyện"],
    imageCols: ["Ảnh bìa", "Ảnh Bìa"],
    genreCols: ["Thể loại truyện", "Thể Loại Truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      author: ["Tác giả"],
      xuatBan: ["Xuất bản"],
    },
  },
  Manhua: {
    type: "MANHUA",
    titleCols: ["Tên Truyện", "Tên truyện"],
    imageCols: ["Ảnh bìa", "Ảnh Bìa"],
    genreCols: ["Thể Loại Truyện", "Thể loại truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      author: ["Tác Giả", "Tác giả"],
      xuatBan: ["Xuất bản"],
    },
  },
  "Truyện tranh BL": {
    type: "BL_COMIC",
    titleCols: ["Tên truyện"],
    imageCols: ["Ảnh Bìa", "Ảnh bìa"],
    genreCols: ["Thể loại truyện", "Thể Loại Truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      author: ["Tác giả"],
      xuatBan: ["Xuất bản"],
    },
  },
  "Phim/Anime": {
    type: "PHIM_ANIME",
    titleCols: ["Tên Phim"],
    imageCols: ["Ảnh Bìa", "Ảnh bìa"],
    genreCols: ["Thể Loại Phim", "Thể loại phim", "Thể loại"],
    accessCols: ["Nơi xem"],
    specialCols: {
      xuatBan: ["Xuất bản"],
    },
  },
  "Doujinshi": {
    type: "DOUJINSHI",
    titleCols: ["Tên doujinshi"],
    imageCols: ["Ảnh Bìa", "Ảnh bìa"],
    genreCols: ["Thể loại", "Thể Loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      cp: ["Tên cp/ tên tp gốc"],
      originalWork: ["Tên cp/ tên tp gốc"],
      doujinka: [
        "Doujinka",
        "Tên người làm doujinshi",
        "Doujinka\nTên người làm doujinshi",
      ],
    },
  },
  Fanfic: {
    type: "FANFIC",
    titleCols: ["Tên fanfic"],
    imageCols: ["Ảnh Bìa", "Ảnh bìa"],
    genreCols: ["Thể loại truyện", "Thể Loại Truyện", "Thể loại"],
    accessCols: ["Nơi đọc"],
    specialCols: {
      cp: ["Tên cp"],
      fanficTitle: ["Tên fanfic"],
      author: ["Tác giả fanfic"],
    },
  },
};

export const COMMON_COLS = {
  purityTags: ["Độ Khiết"],
  status: ["Tình trạng"],
  noteTags: ["NOTE: Bằng chứng khiết/KK"],
  warningTags: ["LÔI/BOM MÌN"],
  summary: ["Tóm tắt/Review/Spoil"],
};