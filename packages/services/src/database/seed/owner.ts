import {eq} from "drizzle-orm";
import {user, wallet} from "../schema";
import * as dotenv from "dotenv";

dotenv.config();

import {hashSecret} from "../../lib";
import {seedDb, seedPool} from './seed-client';
import * as readline from "node:readline/promises";
import {UserRoleEnum} from "@live-bid/contracts/enums";
import {stdin as input, stdout as output} from 'node:process';
import {RegisterUserSchema, UsernameSchema} from "@live-bid/contracts/schemas";

import {Writable} from "node:stream";

// While true, anything readline tries to echo gets swallowed
let muted = false;

const mutedOutput = new Writable({
  write(chunk, encoding, cb) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!muted) output.write(chunk, encoding);
    cb();
  },
});

async function askSecret(rl: readline.Interface, q: string): Promise<string> {
  output.write(q);
  muted = true;

  try {
    return await rl.question("");
  } finally {
    muted = false;
    output.write("\n");
  }
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
      ? `${q} (default: "${def}"): `
      : q;

    const answer = (mask
        ? await askSecret(rl, question)
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
    output: mutedOutput,
    terminal: true
  });

  try {
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

    const ownerData = {
      email: await ask(rl, 'Email: ', 'email'),
      username: await ask(rl, 'Username: ', 'username'),
      password: await ask(rl, 'Password: ', 'password', true),
      display_name: await ask(rl, 'Display Name', 'display_name', false, 'owner'),
    };

    console.log("\nOwner data:", {
      ...ownerData,
      password: '********'
    });

    const hashedPassword = await hashSecret(ownerData.password);

    const owner = await seedDb.transaction(async (tx) => {
      const [newOwner] = await tx
        .insert(user)
        .values({
          ...ownerData,
          is_active: true,
          password: hashedPassword,
          role: UserRoleEnum.OWNER,
        })
        .returning({
          id: user.id,
          role: user.role,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
        });

      console.log("\nOwner account created successfully.");

      await tx
        .insert(wallet)
        .values({user_id: newOwner.id});

      console.log("Owner wallet created successfully.\n");

      return ownerData;
    });

    console.table(owner);
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  } finally {
    await seedPool.end();
    rl.close();
  }
}

main()
  .catch(() => console.log('Owner seeder finished.'))
  .catch(err => console.error(err));
