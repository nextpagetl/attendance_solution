import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { sn, command } = body;

  if (!sn || !command || !command.cmd) {
    return NextResponse.json({ error: "Invalid request: missing sn or command" }, { status: 400 });
  }

  try {
    // Forward to WebSocket server's HTTP endpoint (adjust URL for production)
    const wsUrl = `http://143.198.94.167:${process.env.WS_PORT || 7792}/send-command`;
    const response = await fetch(wsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sn, command }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: `Failed to send command: ${err.message}` }, { status: 500 });
  }
}