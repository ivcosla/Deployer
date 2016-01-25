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



* ##### Requisito para directorios de componentes
Deben de contener los ejecutables en una subcarpeta llamada "code", y el programa principal debe de llamarse "componente.js", ya que será
invocado por un runtime.



* ##### Espacio de trabajo empleado por el Deployer
El deployer descomprimirá los tgz en el directorio raíz del proyecto. Por ejemplo:
    ```
    Directorio del proyecto al inicio, alojando los .tgz en el:
    proyecto/
    ├── component.tgz
    ├── component2.tgz
    ├── deployment
    └── service.tgz
    
    Directorio del proyecto tras ejecutar deployment/code/deployer.js:
    proyecto/
    ├── comp1
    ├── comp2
    ├── component.tgz
    ├── component2.tgz
    ├── deployment
    ├── service
    └── service.tgz
    
    ```
    
    
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

* ##### package.json del directorio deployment

    * **url:** La url del despliegue, hace referencia a la localización del servicio. A partir de él se forman las
    uris del servicio y los componentes.
    
    * **servicio:** uri del servicio. Mediante el uriDictionary.json proporcionado por el cliente se obtendrá la localización del service.tgz.
    En versiones futuras se pretende distinguir si es un recurso remoto en base a la cabecera (https:// o file://), ahora el desplegador
    omitirá la cabecera
    
    * **cardinality:** Diccionario cuyas claves serán el tipo de componente y valor número de instancias de dicho componente
    
    * **params:** En la versión actual no se ha implementado el manejo de parámetros del despliegue, servicio y componentes. En versiones
    futuras se pretende que los parámetros del despliegue indiquen parámetros a pasar como argumentos al desplegar cada servicio, en los del servicio
    los que se pasarán como argumentos al desplegar cada componente, y en los del componente los que se pasarán a dicho tipo de componente.
    Tomarán preferencia en orden inverso (componente, servicio y despliegue) pudiendo sobreescribirse parámetros.
    
* ##### package.json del directorio service

    * **uri:** Uri del servicio, en la versión actual no se emplea por estar también en el package.json del deployer.
    
    * **components:** Diccionario clave-valor cuyas claves serán nombres de los tipos de componente del servicio y cuyo valor serán
    las uris de dichos componentes. El nombre se empleará para nominar las distintas instancias de los contenedores de dichos componentes.
    La uri se empleará para localizar el .tgz de dicho componente.
    
    * **graph:** El grafo contiene la descripción de los distintos canales de comunicación entre los componentes, será un diccionario cuyas
    claves serán los nombres del canal y los valores serán a su vez diccionarios describiendo el canal. Los valores que describen el canal son:
    
        * **type:** El tipo del canal, actualmente se soportan dos tipos:
        
            1. "point-to-point". Canal direccionado del componente A al componente B. A y B pueden tener cualquier cardinalidad, pero todas
            las instancias de A se conectarán únicamente a la primera instancia de B.
            
            2. "lb". Canal direccionado de balanceo de carga (de A a B, ambas con cualquier cardinalidad), este tipo de 
            canales se han implementado como contenedores a parte, que redirigirán el tráfico de todas las instancias de A
            a una instancia de B escogida dependiendo del parámetro "sub-type".
            
        * **sub-type:** Sólo disponible para canales tipo lb, puede tomar los valores "rand" o "round-robin". En el primer caso
        el destino se escogerá de manera aleatoria cada vez, en el segundo caso se escogerá cada vez una instancia de B de manera
        consecutiva y circular.
        
        * **source:** Un diccionario que describe el tipo de componente que actuará como fuente de este canal, sus posibles valores
        se detallan a continuación:
            
            * **comp:** Tipo del componente del que parte el canal.
            
            * **endpoint:** Endpoint del componente desde donde se enviarán datos por el canal.
            
        * **destination:** Un diccionario que describe el tipo de componente que actuará como destino de este canal, sus posibles valores
        se detallan a continuación:
        
            * **comp:** Tipo del componente destino del canal.
            
            * **endpoint:** Endpoint del componente que escucha en el canal.
            
    * **entrypoint:** Diccionario que contiene los datos del componente y endpoint que serán el entrypoint del servicio. El puerto de dicho
    entrypoint se mapeará al puerto del host recibido como segundo argumento por el deployment.
    
        * **comp:** Componente donde se encuentra el entrypoint.
        * **endpoint:** Endpoint que escucha las posibles comunicaciones recibidas desde el puerto mapeado en el host.
        
    * **params:** Ídem que params en el package.json de deployment.
    
    * **dependencies:** Diccionario que contendrá como claves el nombre simbólico de las dependencias a instalar y como valor
    la dependencia a instalar. Deployer.js creará un Dockerfile para cada componente, en él se incluirá la instalación de estas
    dependencias. Los posibles valores se detallan a continuación.
    
        1. "system:nombre_paquete" se instalará el paquete empleando el comando apt-get install -y nombre_paquete
        2. "node:nombre_paquete" se instalará el paquete empleando el comando npm install nombre_paquete
        
* ##### package.json del directorio de cada componente
        