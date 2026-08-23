import {ConfigService} from "@nestjs/config";
import {Controller, Get, VERSION_NEUTRAL} from "@nestjs/common";

@Controller({
  version: VERSION_NEUTRAL
})
export class AppController {
  appName: string;

  constructor(private readonly config: ConfigService) {
    this.appName = this.config.get<string>("APPLICATION_NAME") || "Live Bid";
  }

  @Get()
  getRoot() {
    return {
      ok: true,
      ping: "pong",
      message: `Welcome to ${this.appName} API`,
    };
  }

  @Get('health')
  getHealth() {
    return {
      ok: true,
      ping: "pong",
      message: `${this.appName} API is ok`,
    };
  }
}
