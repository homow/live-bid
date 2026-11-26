import {Injectable} from "@nestjs/common";
import {AppException} from "@live-bid/services/lib";

@Injectable()
export class WordpressService {
  private readonly url: string = process.env.WORDPRESS_GRAPHQL_URL!;
  private readonly secret: string = process.env.WORDPRESS_GRAPHQL_SECRET!;

  async query<T>(query: string, variables: Record<string, unknown> = {}) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'X-LiveBid-secret': this.secret,
      },
      body: JSON.stringify({query, variables}),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new AppException({
      statusCode: res.status,
      code: 'WORDPRESS_ERROR',
      message: `WordPress responded with ${res.status}`,
    });

    const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (body.errors?.length) {
      throw new AppException({
        statusCode: 500,
        code: 'WORDPRESS_ERROR',
        message: body.errors.map(e => e.message).join('; '),
      });
    }

    return body.data as T;
  }
}
