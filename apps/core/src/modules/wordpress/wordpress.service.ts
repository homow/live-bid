import {Injectable} from "@nestjs/common";

@Injectable()
export class WordpressService {
  private readonly url: string = process.env.WORDPRESS_GRAPHQL_URL!;
  private readonly secret: string = process.env.WORDPRESS_GRAPHQL_SECRET!;

  constructor() {
    console.log(this.url, this.secret);
  }
}
