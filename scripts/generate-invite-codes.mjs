/**
 * 招待コード生成スクリプト
 *
 * 使い方:
 *   node scripts/generate-invite-codes.mjs --count 5
 *   node scripts/generate-invite-codes.mjs --count 1 --role admin
 *
 * 必要な環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash, randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode() {
  const segments = [4, 4, 4].map((length) => {
    const bytes = randomBytes(length);
    let segment = "";
    for (let i = 0; i < length; i++) {
      segment += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    return segment;
  });
  return `DOJO-${segments.join("-")}`;
}

function hashInviteCode(code) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function parseArgs(argv) {
  let count = 1;
  let role = "member";

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--count" && argv[i + 1]) {
      count = Number.parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === "--role" && argv[i + 1]) {
      role = argv[i + 1];
      i++;
    }
  }

  if (!Number.isFinite(count) || count < 1) {
    throw new Error("--count には 1 以上の整数を指定してください");
  }
  if (role !== "member" && role !== "admin") {
    throw new Error("--role には member または admin を指定してください");
  }

  return { count, role };
}

async function main() {
  const { count, role } = parseArgs(process.argv);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("環境変数 NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const generated = [];

  for (let i = 0; i < count; i++) {
    const code = generateInviteCode();
    const codeHash = hashInviteCode(code);

    const { error } = await supabase.from("invite_codes").insert({
      code_hash: codeHash,
      intended_role: role,
    });

    if (error) {
      console.error("登録に失敗しました:", error.message);
      process.exit(1);
    }

    generated.push(code);
  }

  console.log(`\n${count} 件の招待コードを登録しました（role: ${role}）\n`);
  console.log("以下を安全な経路でメンバーに配布してください。DB にはハッシュのみ保存されています。\n");
  for (const code of generated) {
    console.log(`  ${code}`);
  }
  console.log("");
}

main();
