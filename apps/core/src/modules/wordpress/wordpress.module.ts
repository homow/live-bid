import {Module} from "@nestjs/common";
import {WordpressService} from "./wordpress.service";
import {WordpressController} from "./wordpress.controller";

@Module({
  providers: [WordpressService],
  controllers: [WordpressController],
})
export class WordpressModule {}
