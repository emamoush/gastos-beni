# Gastos de Beni

App simple para que Abigail y Bruno registren qué gasto pagó cada uno para Beni,
y vean en cualquier momento si hay que compensar saldo entre ellos.

No hay usuarios ni login: cualquiera que tenga el link puede entrar, cargar un gasto
y elegir con la pastilla si pagó Abigail o Bruno. El historial queda visible para
los dos, con fecha y quién figura como pagador, para que se puedan fijar ahí ante
cualquier duda.

No necesitás usar la terminal para nada de esto: todo se hace desde el navegador.

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (gratis).
2. Andá a **SQL Editor** (menú izquierdo) → **New query**.
3. Pegá el contenido del archivo `schema.sql` y tocá **Run**. Esto crea la tabla
   `gastos` y deja el acceso abierto (sin necesidad de loguearse).

   > Si ya habías corrido una versión anterior de este `schema.sql` (con la tabla
   > `perfiles` o el login), primero borrá esos objetos viejos desde el SQL Editor:
   > `drop table if exists public.perfiles cascade;` y `drop table if exists public.gastos cascade;`
   > — después corré el `schema.sql` nuevo.

4. Andá a **Project Settings → API**. Vas a necesitar dos valores:
   - **Project URL**
   - **anon public key**
5. Abrí el archivo `config.js` de esta carpeta y pegá esos dos valores donde dice
   `TU-PROYECTO.supabase.co` y `TU_ANON_KEY_ACA`.

## 2. Subir el proyecto a Vercel

**Opción A — arrastrando la carpeta (la más simple, sin GitHub):**

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión.
2. En el dashboard, buscá la opción de subir un proyecto arrastrando una carpeta
   (Add New → Project → "Deploy" con drag & drop, o en la pantalla de importar
   proyecto vas a ver una zona para arrastrar archivos).
3. Arrastrá esta carpeta completa (`gastos-beni`) ahí.
4. Vercel la publica sola, sin configuración adicional (es un sitio estático).

**Opción B — subiendo a GitHub primero (como venís haciendo con otros proyectos):**

1. Subí esta carpeta a un repositorio nuevo en GitHub desde la web (Add file → Upload files).
2. En Vercel: Add New → Project → Import el repositorio.
3. Como es un sitio estático (sin build), dejá los campos de configuración por defecto
   y tocá Deploy.

## 3. Probarla

Entrá a la URL que te da Vercel y cargá un par de gastos de prueba (uno a nombre de
Abigail y otro de Bruno) para ver que el saldo se calcule bien.

## Cómo funciona el cálculo de saldo

Suma todo lo que pagó Abigail y todo lo que pagó Bruno. Si uno pagó más que el otro,
la app calcula la mitad de esa diferencia: es lo que el que pagó de menos le debería
transferir al otro para que los dos hayan puesto lo mismo. Si en algún momento quieren
dividir los gastos en otra proporción (no 50/50), decímelo y lo ajustamos.

## Tené en cuenta

- Como no hay login, el link a la página funciona como la "llave": cualquiera que lo
  tenga puede cargar o borrar gastos. Compartíselo solo a Abigail y Bruno.
- Cualquiera de los dos puede borrar cualquier gasto (no solo los propios). El
  historial con fecha y pagador queda para que puedan revisar entre ellos si hace
  falta. Si más adelante preferís algo más restrictivo, avisame y lo ajustamos.

## Si algo falla

- Si al entrar no pasa nada o tira error: revisá que `config.js` tenga la URL y la key
  correctas, sin espacios de más.
- Si el saldo no calcula bien: confirmá que los gastos se estén guardando con el
  pagador correcto en la tabla `gastos` (lo podés ver desde Supabase → Table Editor).
