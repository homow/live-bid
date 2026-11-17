import * as dotenv from "dotenv";
import * as readline from "node:readline/promises";
import {stdin as input, stdout as output} from 'node:process';
import {RegisterUserSchema} from "@live-bid/contracts/schemas";

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

export async function ask<T extends keyof typeof RegisterUserSchema.shape>(
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

    const answer = mask
      ? await askSecret(question)
      : await rl.question(question);

    const validate = RegisterUserSchema.shape[field].safeParse(answer);

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
    const owner = {
      email: await ask(rl, 'Email: ', 'email'),
      password: await ask(rl, 'Password: ', 'password', true),
      display_name: await ask(rl, 'Display Name: ', 'display_name', false, 'owner'),
    };

    console.log("\nOwner data:", {
      ...owner,
      password: '********'
    });

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
