import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  hashInviteCode,
  memberAuthEmail,
  normalizeInviteCode,
} from "@/lib/invite-code";
import { checkRateLimit } from "@/lib/rate-limit";

interface JoinRequestBody {
  code?: string;
  displayName?: string;
}

function generatePassword(): string {
  return `${randomUUID()}${randomUUID()}`;
}

async function createSessionResponse(
  email: string,
  password: string
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json(
      { error: "セッションの作成に失敗しました" },
      { status: 500 }
    );
  }

  return response;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`join:${ip}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらく待ってから再試行してください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 60000) / 1000)),
        },
      }
    );
  }

  let body: JoinRequestBody;
  try {
    body = (await request.json()) as JoinRequestBody;
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const code = body.code ? normalizeInviteCode(body.code) : "";
  const displayName = body.displayName?.trim() ?? "";

  if (!code) {
    return NextResponse.json({ error: "招待コードを入力してください" }, { status: 400 });
  }

  const admin = createAdminClient();
  const codeHash = hashInviteCode(code);

  const { data: inviteCode, error: inviteError } = await admin
    .from("invite_codes")
    .select("id, member_id, intended_role, is_active")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (inviteError || !inviteCode) {
    return NextResponse.json({ error: "招待コードが無効です" }, { status: 401 });
  }

  if (!inviteCode.is_active) {
    return NextResponse.json({ error: "この招待コードは無効化されています" }, { status: 401 });
  }

  // 再ログイン
  if (inviteCode.member_id) {
    const { data: member, error: memberError } = await admin
      .from("members")
      .select("id, auth_user_id")
      .eq("id", inviteCode.member_id)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: "メンバー情報が見つかりません" }, { status: 500 });
    }

    const { data: credentials, error: credError } = await admin
      .from("member_credentials")
      .select("auth_password")
      .eq("member_id", member.id)
      .maybeSingle();

    if (credError || !credentials) {
      return NextResponse.json({ error: "認証情報が見つかりません" }, { status: 500 });
    }

    return createSessionResponse(
      memberAuthEmail(member.id),
      credentials.auth_password
    );
  }

  // 初回登録
  if (!displayName || displayName.length < 1 || displayName.length > 32) {
    return NextResponse.json(
      { error: "表示名を1〜32文字で入力してください", needsDisplayName: true },
      { status: 400 }
    );
  }

  const memberId = randomUUID();
  const authEmail = memberAuthEmail(memberId);
  const authPassword = generatePassword();
  const role = inviteCode.intended_role === "admin" ? "admin" : "member";

  const { data: authUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email: authEmail,
      password: authPassword,
      email_confirm: true,
    });

  if (createUserError || !authUser.user) {
    return NextResponse.json(
      { error: "ユーザーの作成に失敗しました" },
      { status: 500 }
    );
  }

  const { error: memberInsertError } = await admin.from("members").insert({
    id: memberId,
    auth_user_id: authUser.user.id,
    display_name: displayName,
    role,
  });

  if (memberInsertError) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: "メンバー登録に失敗しました" },
      { status: 500 }
    );
  }

  const { error: credInsertError } = await admin.from("member_credentials").insert({
    member_id: memberId,
    auth_password: authPassword,
  });

  if (credInsertError) {
    await admin.from("members").delete().eq("id", memberId);
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json(
      { error: "認証情報の保存に失敗しました" },
      { status: 500 }
    );
  }

  const { error: inviteUpdateError } = await admin
    .from("invite_codes")
    .update({ member_id: memberId })
    .eq("id", inviteCode.id);

  if (inviteUpdateError) {
    return NextResponse.json(
      { error: "招待コードの更新に失敗しました" },
      { status: 500 }
    );
  }

  return createSessionResponse(authEmail, authPassword);
}
