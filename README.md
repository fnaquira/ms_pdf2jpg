# Convertir PDFs a imágenes con Express

Este proyecto de Express es una aplicación web que permite convertir archivos PDF a imágenes en formato JPG. La aplicación utiliza la librería pdf2pic para realizar la conversión y guarda las imágenes generadas en una carpeta temporal.

## Instalación

Este proyecto necesita las siguientes librerías instaladas en el servidor de ejecución:

-   node >= 12.x
-   graphicsmagick
-   ghostscript

En caso de no contar con graphismagick o ghostscript, utiliza [la siguiente guía](https://github.com/yakovmeister/pdf2image/blob/master/docs/gm-installation.md)

Para instalar las dependencias del proyecto, primero asegúrate de tener Node.js y npm instalados en tu sistema. Luego, clona el repositorio y ejecuta el siguiente comando desde la raíz del proyecto:

```
npm install
```

## Uso

Para iniciar la aplicación, ejecuta el siguiente comando desde la raíz del proyecto:

```
npm start
```

Esto iniciará el servidor en el puerto 3000. Puedes acceder a la página principal de la aplicación en tu navegador web ingresando la siguiente dirección:

```javascript
http://localhost:3000
```

En esta página, puedes seleccionar un archivo PDF y subirlo para que la aplicación lo convierta en imágenes. Las imágenes resultantes se mostrarán debajo del formulario de carga.
Rutas

La aplicación tiene las siguientes rutas:

-   /: La página principal de la aplicación, que muestra el formulario de carga de archivos.
-   /convertir: La ruta donde se realiza la conversión de PDF a imágenes. Esta ruta acepta una solicitud POST con un archivo PDF en el cuerpo de la solicitud. La respuesta es un objeto JSON que contiene los nombres de los archivos de imagen generados.
-   /imagenes/:nombre: La ruta que devuelve la imagen con el nombre especificado en la URL. Si el archivo de imagen existe en la carpeta temporal, se devuelve el archivo. De lo contrario, se devuelve un error 404.

## Dependencias

El proyecto utiliza las siguientes dependencias de npm:

-   express: Un framework de servidor web para Node.js.
-   pdf2pic: Una librería para convertir archivos PDF a imágenes.
-   cors: Un middleware para Express que agrega encabezados CORS necesarios para permitir el acceso desde cualquier origen.
-   multer: Un middleware para Express que permite procesar datos de formularios enviados como archivos.

## Contribución

Si deseas contribuir a este proyecto, por favor realiza un fork y envía un pull request. También puedes informar errores o solicitar nuevas características a través de las issues.
