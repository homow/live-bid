import * as dotenv from "dotenv";
import {seedPool, seedDb} from './seed-client';
import * as readline from "node:readline/promises";
import {stdin as input, stdout as output} from 'node:process';
import {RegisterUserSchema, UsernameSchema} from "@live-bid/contracts/schemas";
import {user} from "../schema";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {hashSecret} from "../../lib";
import {eq} from "drizzle-orm";

dotenv.config();

function askSecret(q: string): Promise<string> {
  if (!input.isTTY) {
    return Promise.reject(
      new Error("Secret input requires an interactive terminal."),
    );
  }

  return new Promise((resolve, reject) => {
    output.write(q);

    const wasRaw = input.isRaw;
    let answer = "";

    input.setRawMode(true);
    input.resume();

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(wasRaw ?? false);
      output.write("\n");
    };

    const onData = (key: Buffer) => {
      const char = key.toString("utf8");

      if (char === "\u0003") {
        cleanup();
        reject(new Error("Input interrupted."));
        return;
      }

      if (char === "\r" || char === "\n") {
        cleanup();
        resolve(answer);
        return;
      }

      if (char === "\u007f" || char === "\b") {
        const chars = Array.from(answer);
        chars.pop();
        answer = chars.join("");
        return;
      }

      if (char >= " ") {
        answer += char;
      }
    };

    input.on("data", onData);
  });
}

const CreateOwnerSchema = RegisterUserSchema.extend({
  username: UsernameSchema
});

export async function ask<T extends keyof typeof CreateOwnerSchema.shape>(
  rl: readline.Interface,
  q: string,
  field: T,
  mask = false,
  def = ''
) {
  while (true) {
    const question = def
      ? `${q} (default: "${def}")`
      : q;

    const answer = (mask
        ? await askSecret(question)
        : await rl.question(question)
    ) || def;

    const validate = CreateOwnerSchema.shape[field].safeParse(answer);

    if (!validate.success) {
      console.log(`The ${field} isn't valid`, validate.error.issues[0].message);
      continue;
    }

    return answer;
  }
}

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  try {
    const ownerData = {
      email: await ask(rl, 'Email: ', 'email'),
      username: await ask(rl, 'Username: ', 'username'),
      password: await ask(rl, 'Password: ', 'password', true),
      display_name: await ask(rl, 'Display Name: ', 'display_name', false, 'owner'),
    };

    console.log("\nOwner data:", {
      ...ownerData,
      password: '********'
    });

    const hashedPassword = await hashSecret(ownerData.password);

    const [existOwner] = await seedDb
      .select({email: user.email})
      .from(user)
      .where(eq(user.role, UserRoleEnum.OWNER));

    if (existOwner?.email) {
      console.log(`Owner account already exists: ${existOwner.email}`);
      console.log("Skipping owner seeding.");
      process.exitCode = 0;
      return;
    }

    const owner = await seedDb
      .insert(user)
      .values({
        ...ownerData,
        is_active: true,
        password: hashedPassword,
        role: UserRoleEnum.OWNER,
      })
      .returning({
        role: user.role,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
      });

    console.log("Owner account created successfully.");

    console.table(owner);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main()
  .catch(() => console.log('Owner seeder finished.'))
  .catch(err => console.error(err));
