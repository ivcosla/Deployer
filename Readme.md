# CCTAS Deployer

### Prerrequisitos
#### Dependencias adicionales
* [dockerode](https://www.npmjs.com/package/dockerode)
* [tar.gz](https://www.npmjs.com/package/tar.gz)

#### Imágenes
* component/base -> construida con el Dockerfile del directorio raíz.
* channel/lb -> construida con el Dockerfile del directorio deployment/router/

### Uso

El programa principal del Deployer es deployment/code/deployer.js.
Recibe dos argumentos como entrada:
* Argumento 1: Una cadena a añadir