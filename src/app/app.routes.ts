import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-user/dashboard-user.component').then(
            (m) => m.DashboardUserComponent
          )
      },
      {
        path: 'dashboard/admin',
        loadComponent: () =>
          import('./features/dashboard/dashboard-admin/dashboard-admin.component').then(
            (m) => m.DashboardAdminComponent
          )
      },
      {
        path: 'dashboard/team',
        loadComponent: () =>
          import('./features/dashboard/dashboard-team/dashboard-team.component').then(
            (m) => m.DashboardTeamComponent
          )
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/list/ticket-list.component').then(
            (m) => m.TicketListComponent
          )
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/detail/ticket-detail.component').then(
            (m) => m.DetailComponent
          )
      },
      {
        path: 'tickets/:id/assign',
        loadComponent: () =>
          import('./features/tickets/assign/ticket-assign.component').then(
            (m) => m.AssignComponent
          )
      },
      {
        path: 'tickets/:id/reassign',
        loadComponent: () =>
          import('./features/tickets/reassign/reassign.component').then(
            (m) => m.ReassignComponent
          )
      },
      {
        path: 'create-incident',
        loadComponent: () =>
          import('./features/tickets/create-incident/create-incident.component').then(
            (m) => m.CreateIncidentComponent
          )
      },
      {
        path: 'create-requirement',
        loadComponent: () =>
          import('./features/tickets/create-requeriment/create-requeriment.component').then(
            (m) => m.CreateRequerimentComponent
          )
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./features/areas/area-list/area-list.component').then(
            (m) => m.AreaListComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list.component').then(
            (m) => m.UserListComponent
          )
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/team/team-list/team-list.component').then(
            (m) => m.TeamListComponent
          )
      },
      {
        path: 'team/workload',
        loadComponent: () =>
          import('./features/team/team-workload/team-workload.component').then(
            (m) => m.TeamWorkloadComponent
          )
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
