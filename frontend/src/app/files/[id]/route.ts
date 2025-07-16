import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: fileId } = await params;

    const response = await fetch(`${BACKEND_URL}/v1/resources/${fileId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "File not found" },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");
    const contentDisposition = response.headers.get("content-disposition");

    const responseHeaders = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    if (contentDisposition) {
      responseHeaders.set("Content-Disposition", contentDisposition);
    }

    // Return the file stream
    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error proxying file request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
