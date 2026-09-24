import { NextResponse } from "next/server";
import { getApiKeys, createApiKey } from "@/lib/localDb";
import { getConsistentMachineId } from "@/shared/utils/machineId";
import { parseTokenLimit } from "@/lib/apiKeyLimits";
import { parseDailyResetTime, parseHourlyResetMinute } from "@/lib/apiKeyTimeLimits";

export const dynamic = "force-dynamic";

// GET /api/keys - List API keys
export async function GET() {
  try {
    const keys = await getApiKeys();
    return NextResponse.json({ keys });
  } catch (error) {
    console.log("Error fetching keys:", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

// POST /api/keys - Create new API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let tokenLimit;
    let dailyTokenLimit;
    let dailyResetTime;
    let hourlyTokenLimit;
    let hourlyResetMinute;
    try {
      tokenLimit = parseTokenLimit(body.tokenLimit) ?? null;
      dailyTokenLimit = parseTokenLimit(body.dailyTokenLimit) ?? null;
      dailyResetTime = parseDailyResetTime(body.dailyResetTime);
      hourlyTokenLimit = parseTokenLimit(body.hourlyTokenLimit) ?? null;
      hourlyResetMinute = parseHourlyResetMinute(body.hourlyResetMinute);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const allowedModels = body.allowedModels || null;

    // Always get machineId from server
    const machineId = await getConsistentMachineId();
    const apiKey = await createApiKey(
      name,
      machineId,
      tokenLimit,
      allowedModels,
      dailyTokenLimit,
      dailyResetTime,
      hourlyTokenLimit,
      hourlyResetMinute
    );

    return NextResponse.json({
      key: apiKey.key,
      name: apiKey.name,
      id: apiKey.id,
      machineId: apiKey.machineId,
      tokenLimit: apiKey.tokenLimit,
      usedTokens: apiKey.usedTokens,
      allowedModels: apiKey.allowedModels,
      dailyTokenLimit: apiKey.dailyTokenLimit,
      dailyResetTime: apiKey.dailyResetTime,
      hourlyTokenLimit: apiKey.hourlyTokenLimit,
      hourlyResetMinute: apiKey.hourlyResetMinute,
    }, { status: 201 });
  } catch (error) {
    console.log("Error creating key:", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
