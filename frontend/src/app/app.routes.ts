import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { FriendrequestsComponent } from './layout/pages/friendrequests/friendrequests.component';
import { ChatComponent } from './layout/pages/chat/chat.component';
import { UsersearchComponent } from './layout/pages/usersearch/usersearch.component';

export const routes: Routes = [
  {
    path: 'login', component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'register', component: RegisterComponent,
    canActivate: [loginGuard]
  },
  {
    path: '', component: LayoutComponent,
    children: [
      { path: 'friendrequest', component: FriendrequestsComponent },
      { path: 'chat/:friendid', component: ChatComponent },
      { path: 'usersearch', component: UsersearchComponent },
    ],
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' }
];
