# Configuración de Auryk Control

## 1. Crear Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta `supabase/setup.sql` completo.
3. En **Authentication > URL Configuration**, añade la URL de revisión y luego la URL de producción con `/admin/`.
4. Desactiva el registro público si solo habrá administradores invitados.
5. Copia `config.example.js` como `config.js`.
6. Completa únicamente `supabaseUrl` y la **Publishable Key / anon key**. `config.js` está ignorado por Git.

Nunca uses `service_role` en el navegador.

## 2. Primer administrador

1. En **Authentication > Users**, crea o invita al usuario.
2. Obtén su correo y ejecuta en SQL Editor:

```sql
insert into public.profiles(id,email,full_name,role,is_active)
select id,email,'Administrador Auryk','admin',true
from auth.users where email='correo@ejemplo.com'
on conflict(id) do update set role='admin',is_active=true;
```

Los usuarios autenticados sin perfil activo no pueden escribir. Los editores pueden gestionar contenido; solo administradores pueden gestionar usuarios y Storage.

## 3. Storage

`setup.sql` crea:

- `public-media`: lectura pública, escritura/eliminación administrativa.
- `private-media`: solo personal autorizado; pensado para borradores y material confidencial.

El panel valida JPG/PNG/WebP, corrige orientación mediante decodificación del navegador, limita el lado mayor a 2200 px y genera WebP antes de subir.

## 4. Flujo editorial

1. Crear registro como **Borrador**.
2. Guardar y usar **Vista previa**.
3. Cambiar a **Publicado**.
4. El sitio público consulta solo registros publicados y visibles.
5. Si Supabase falla, `index.html` conserva y presenta todo el contenido existente.

## 5. Variables públicas necesarias

Cuando llegue el momento de conectar, solo se requieren:

- Project URL.
- Publishable Key o anon key.

No se necesitan contraseñas, tokens personales ni Service Role Key.
