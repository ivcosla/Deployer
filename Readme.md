# CCTAS Deployer

### Prerrequisitos
#### Dependencias adicionales
* [dockerode](https://www.npmjs.com/package/dockerode)
* [tar.gz](https://www.npmjs.com/package/tar.gz)

#### Imágenes
* component/base -> construida con el Dockerfile del directorio raíz.
* channel/lb -> construida con el Dockerfile del directorio deployment/router/

### Uso

#### Directorios
Los directorios para deployment y service deben de tener siempre esos nombres, mientras que los de cada componente pueden variar, pero
todos ellos deben de tener un archivo "package.json" en su raíz.

Debe de haber en el directorio deployment un uriDictionary.json que contenga las reglas para, a partir del
uri del servicio (especificado en el package.json de deployment) localizar el servicio, comprimido en tgz.


A su vez debe de haber otro uriDictionary.json en el directorio del servicio (que se encuentra comprimido), con las reglas para,
a partir del uri de cada componente (especificados en el package.json del servicio) localizar cada componente, también comprimido en tgz.
En esta versión del deployer sólo se admite que los tgz estén en rutas locales, en versiones futuras se permitirá obtenerlos de recursos remotos.

Los tgz encontrados mediante la resolución de uris se traen a una "caché" (deployment/cache/) local para evitar tener que traerlos de nuevo
en otras instancias de servicios. Esta funcionalidad tendrá mayor sentido cuando se permita obtener los tgz de recursos remotos.

En el directorio del proyecto hay ejemplos de directorio de servicio y de componentes.

##### Requisito para directorios de componentes
Deben de contener los ejecutables en una subcarpeta llamada "code", y el programa principal debe de llamarse "componente.js", ya que será
invocado por un runtime.

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

La función y posibles valores de los distintos atributos especificados en los package.json: