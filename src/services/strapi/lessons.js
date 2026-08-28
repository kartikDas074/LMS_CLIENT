import { request } from "@/services/strapi/courses";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";

export async function createLesson({ title, description, lessonOrder, duration, courseId, videoFile, videoUrl }) {
  let videoIds = [];
  if (videoFile) {
    const uploaded = await uploadVideoToCloudinary(videoFile);
    const asset = await request("/course-assets/cloudinary", {
      method: "POST",
      body: JSON.stringify({ ...uploaded, name: videoFile.name }),
    });
    videoIds = [asset.id];
  } else if (videoUrl) {
    const parsedUrl = new URL(videoUrl);
    if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("Video URL must use http or https.");
    const asset = await request("/course-assets/cloudinary", {
      method: "POST",
      body: JSON.stringify({
        url: parsedUrl.toString(),
        publicId: `external-${Date.now().toString(36)}`,
        format: "mp4",
        resourceType: "video",
        name: "External lesson video",
      }),
    });
    videoIds = [asset.id];
  }

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lesson";
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 6) : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
  return request("/lessons", {
    method: "POST",
    body: JSON.stringify({
      data: {
        title: title.trim(),
        description: description.trim(),
        courseId,
        lessonNo: `${slug}-${suffix}`,
        lessonOrder: Number(lessonOrder),
        duration: Number(duration),
        videourl: videoIds,
      },
    }),
  });
}
