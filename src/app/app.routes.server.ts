import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'tickets/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'tickets/:id/assign',
    renderMode: RenderMode.Server
  },
  {
    path: 'tickets/:id/reassign',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/admin',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/team',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
