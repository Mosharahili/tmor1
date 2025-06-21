import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "OWNER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name}`;
      const path = join(uploadsDir, filename);

      try {
        // Save the file
        await writeFile(path, buffer);
        // Add the URL to the response
        urls.push(`/uploads/${filename}`);
      } catch (error) {
        console.error(`Error saving file ${filename}:`, error);
        return NextResponse.json(
          { error: `Error saving file ${filename}` },
          { status: 500 }
        );
      }
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "No files were successfully uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Error uploading files" },
      { status: 500 }
    );
  }
} 