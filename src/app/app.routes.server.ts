import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/create',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
