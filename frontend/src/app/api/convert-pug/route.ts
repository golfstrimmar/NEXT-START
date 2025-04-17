import { NextRequest, NextResponse } from "next/server";
import pug from "pug";

export async function POST(request: NextRequest) {
  try {
    const { pugCode } = await request.json();
    if (!pugCode || typeof pugCode !== "string") {
      return NextResponse.json(
        { error: "Pug code is required and must be a string" },
        { status: 400 }
      );
    }
    const html = pug.render(pugCode, { pretty: true });
    return NextResponse.json({ html }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
