// src/lib/image-uploader.ts
import cloudinary from "./cloudinary";

export async function uploadImageFromUrl(
  imageUrl: string
): Promise<string | null> {
  try {
    console.log("[image-uploader] fetching:", imageUrl);

    const response = await fetch(imageUrl, { redirect: "follow" });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      throw new Error(`URL is not an image: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "junai", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    console.log("[image-uploader] uploaded:", uploaded?.secure_url ?? null);
    return uploaded?.secure_url ?? null;
  } catch (error) {
    console.error("[image-uploader] failed:", error);
    return null;
  }
}