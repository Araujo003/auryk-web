# Respaldo y restauración

## Código

El punto anterior al CMS está preservado en la referencia `backup/pre-auryk-control-6c0bac8`, que apunta a `6c0bac8dc8d400faf0782e06cc5b9e87fff1c221`.

Para restaurar sin reescribir historia, crea una rama nueva desde esa referencia y abre un Pull Request. Nunca uses `reset --hard` sobre producción.

## Base de datos

1. Genera copias desde Supabase o mediante `pg_dump` con una credencial segura fuera del repositorio.
2. Conserva por separado los objetos de `public-media` y `private-media`.
3. Prueba periódicamente la restauración en un proyecto de ensayo.
4. Vuelve a ejecutar `supabase/setup.sql` para recrear estructura y políticas; después restaura datos y Storage.

## Contenido de emergencia

Si Supabase no responde, el sitio utiliza automáticamente el HTML existente. No elimines ese contenido estático al editar futuras versiones.
