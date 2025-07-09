import { Routes } from '@angular/router';

// Feature components
import {
  UserListComponent,
  UserCreateComponent,
  UserEditComponent,
  UserDetailComponent,
} from '../features/user-management';

// Guards
import { AuthGuard } from '../shared';

export const routes: Routes = [
  // Default route
  {
    path: '',
    redirectTo: '/users',
    pathMatch: 'full',
  },

  // User management routes
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: UserListComponent,
        title: 'Users',
      },
      {
        path: 'create',
        component: UserCreateComponent,
        title: 'Create User',
      },
      {
        path: ':id',
        component: UserDetailComponent,
        title: 'User Details',
      },
      {
        path: ':id/edit',
        component: UserEditComponent,
        title: 'Edit User',
      },
    ],
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/users',
  },
];
