import type {
  GetPostResponseWP,
  GetPostVariablesWP,
  GetPostsResponseWP,
  GetPostsVariablesWP,
  GetCommentsResponseWP,
  GetCommentsVariablesWP,
  CreateCommentResponseWP,
  GetCategoriesResponseWP,
  CreateCommentVariablesWP,
} from "@live-bid/services/types";

import {PinoLogger} from "nestjs-pino";
import {AppException} from "@live-bid/services/lib";
import {Injectable, OnModuleInit} from "@nestjs/common";
import {CREATE_COMMENT, GET_CATEGORIES, GET_COMMENTS, GET_POST, GET_POSTS} from "./wordpress.document";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

const pageSize = (n?: number) =>
  Number.isSafeInteger(n) && n! > 0
    ? Math.min(n!, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

@Injectable()
export class WordpressService implements OnModuleInit {
  private readonly url = process.env.WORDPRESS_GRAPHQL_URL ?? '';
  private readonly secret = process.env.WORDPRESS_GRAPHQL_SECRET ?? '';

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(WordpressService.name);
  }

  onModuleInit() {
    // Better to crash at boot than to send every request to "".
    if (!this.url || !this.secret) {
      throw new Error("WORDPRESS_GRAPHQL_URL and WORDPRESS_GRAPHQL_SECRET must be set");
    }
  }

  /**
   * The one place that talks to WordPress. Every public method below goes
   * through here, so timeouts, logging and error mapping live in one spot.
   * Details of what went wrong are logged, never sent to the client.
   */
  private async request<TData>(
    operation: string,
    query: string,
    variables: object = {},
    extraHeaders: Record<string, string> = {},
  ): Promise<TData> {
    let res: Response;

    try {
      res = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LiveBid-Secret": this.secret,
          ...extraHeaders,
        },
        body: JSON.stringify({operationName: operation, query, variables}),
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      // Network failure or timeout: WordPress is down or slow, not the caller's fault.
      const timedOut = (error as Error).name === "TimeoutError";
      this.logger.error(`${operation} failed: ${(error as Error).message}`);
      throw new AppException({
        statusCode: timedOut ? 504 : 502,
        code: "WORDPRESS_UNAVAILABLE",
        message: "Content service is unavailable",
      });
    }

    if (!res.ok) {
      // We don't pass WordPress's status through: a 403 from its gate would
      // look like an auth problem to our own clients.
      this.logger.error(`${operation} got HTTP ${res.status} from WordPress`);
      throw new AppException({
        statusCode: 502,
        code: "WORDPRESS_ERROR",
        message: "Content service returned an error",
      });
    }

    let body: { data?: TData; errors?: { message: string }[] };

    try {
      body = await res.json() as {
        data?: TData;
        errors?: { message: string }[]
      };
    } catch {
      this.logger.error(`${operation} returned a non-JSON body`);
      throw new AppException({
        statusCode: 502,
        code: "WORDPRESS_ERROR",
        message: "Content service returned an invalid response",
      });
    }

    // GraphQL reports failures with HTTP 200 plus an `errors` array.
    if (body.errors?.length || !body.data) {
      this.logger.error(
        `${operation} GraphQL errors: ${body.errors?.map((e) => e.message).join("; ") ?? "no data"}`,
      );
      throw new AppException({
        statusCode: 502,
        code: "WORDPRESS_ERROR",
        message: "Content service returned an error",
      });
    }

    return body.data;
  }

  getPosts(variables: GetPostsVariablesWP = {}) {
    return this.request<GetPostsResponseWP['data']>("GetPosts", GET_POSTS, {
      ...variables,
      first: pageSize(variables.first ?? undefined),
      where: {orderby: [{field: "DATE", order: "DESC"}], ...variables.where},
    });
  }

  async getPost(variables: GetPostVariablesWP) {
    const data = await this.request<GetPostResponseWP['data']>("GetPost", GET_POST, variables);
    // A missing post is a normal case (null), not an error.
    return data?.post ?? null;
  }

  getCategories() {
    return this.request<GetCategoriesResponseWP['data']>("GetCategories", GET_CATEGORIES);
  }

  getComments(variables: GetCommentsVariablesWP) {
    return this.request<GetCommentsResponseWP['data']>("GetComments", GET_COMMENTS, {
      ...variables,
      first: pageSize(variables.first ?? undefined),
      where: {parent: 0, orderby: "COMMENT_DATE", ...variables.where},
    });
  }

  async createComment(variables: CreateCommentVariablesWP, client?: { ip?: string; userAgent?: string }) {
    // Without these, WordPress would see our own IP as the author of every comment.
    const headers: Record<string, string> = {};
    if (client?.ip) headers["X-LiveBid-Client-IP"] = client.ip;
    if (client?.userAgent) headers["X-LiveBid-Client-User-Agent"] = client.userAgent;

    const data = await this.request<CreateCommentResponseWP['data']>(
      "CreateComment", CREATE_COMMENT, variables, headers,
    );
    return data?.createComment;
  }
}
