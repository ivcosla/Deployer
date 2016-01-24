# CCTAS Deployer

### Prerrequisitos
#### Dependencias adicionales
* [dockerode](https://www.npmjs.com/package/dockerode)
* [tar.gz](https://www.npmjs.com/package/tar.gz)

#### Imágenes
* component/base -> construida con el Dockerfile del directorio raíz.
* channel/lb -> construida con el Dockerfile del directorio deployment/router/

### Uso

#### Argumentos
El programa principal del Deployer es deployment/code/deployer.js.

Recibe dos argumentos como entrada:
* Argumento 1: Una cadena a añadir al nombre de los contenedores y red del servicio. Este deployer da a cada instancia (contenedor)
de cada componente del servicio el nombre que aparece en el package.json para designar al componente más un número entre 0 y su cardinalidad.
P.ej:

```
El primer contenedor del componente 1 se llamará: comp1-0, a parte se añade la cadena recibida como argumento: comp1-0-servicio1. La red se designará como deployernet-servicio1, etc.
Por tanto la colisión de nombres depende de la cadena introducida por el usuario.
```

Se ha tomado esta decisión para dar control al usuario sobre los nombres que tendrán contenedores, etc, de manera que le resulte fácil identificar
que componentes forman parte de que servicio lanzado.

* Argumento 2: Puerto para mapear el entrypoint del servicio con un puerto del host. Diferentes puertos evitarán colisión de puertos.

#### JSON