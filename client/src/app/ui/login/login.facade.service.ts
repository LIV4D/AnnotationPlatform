import { Injectable} from '@angular/core';
import { LoginService } from '../../shared/services/auth/login.service';

@Injectable()
export class LoginFacadeService {

  constructor(private loginService: LoginService) {  }

  /// Login function wrapper
  isAuthenticated() {
    return this.loginService.isAuthenticated();
  }

  loginAppService(email: string, password: string) {
    this.loginService.loginAppService(email, password);
  }

}
