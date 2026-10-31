import {Injectable} from "@nestjs/common";
import {MailService} from "@live-bid/services/modules";

@Injectable()
export class AuthMailService {
  constructor(private readonly mail: MailService) {}

}
