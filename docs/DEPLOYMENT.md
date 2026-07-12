# Despliegue y revisión

La producción actual usa Cloudflare Pages, no GitHub Pages.

- Repositorio: `Araujo003/auryk-web`
- Rama de producción: `main`
- Directorio de salida: `/`
- Build command: ninguno

## Revisión

1. Publica `feature/auryk-control-cms`.
2. Cloudflare Pages debe generar un Preview Deployment para el commit de la rama.
3. Configura temporalmente en Supabase la URL del preview como URL permitida de autenticación.
4. Prueba `/`, `/admin/`, permisos y Storage.
5. Fusiona únicamente después de aprobación explícita.

No modifiques el dominio ni los ajustes del proyecto Cloudflare para obtener un preview.
