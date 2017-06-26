# EBAY_SHOPPING_CHATBOT #
-------------------------

## Descripción ##
Chatbot desarrollado para la materia de Administración de proyectos de Ingeniería de software.
Utiliza API's externas para proveer un bot que tenga Procesamiento del Lenguaje Natural (con Wit) para poder responder a los
usuarios con los que hable por messenger. Este bot proporciona una busqueda en ebay apartir de botones guia tales como 
cantidad de resultados, filtos de ebay y producto a buscar. Al igual proporciona una busqueda a partir de el analisis que
proporciona google vision y trae productos similares de ebay.
El Bot entiende 4 tipos de intenciones, Hola, Adios, ejecutar busqueda, cambiar parametros de busqueda.

## Usage ##
- Editar .env file for API keys.
- turn ngrok on .env port
- start node

## Chating ##
- Try: "Change parameters": This allow the user to change query parameters
- Try: "Search for an PRODUCT": This will execute the search in ebay with parameters selected
- Try: Sending a Photo: This will search similar products in ebay
- Try: "Whats up": For executing a greeting
- Try: "Bye!": For executing a Bye.
## API's ##
- Facebook messenger
- Ebay
- Wit
- Google Vision

## Packages ##
- facebook-messenger-bot: https://github.com/bluejamesbond/FacebookMessengerBot.js
- google Vision: https://cloud.google.com/vision/
- Ebay: https://github.com/thehuey/nodejs-ebay-api
- Wit.ai : https://github.com/wit-ai/node-wit

## Colaboradores ##
- Toatzin Padilla Arias
- Kimberly Luna
- Miguel Basilio
- Juan Andrés Rocha

## Repositorio Original ##
- https://github.com/Kimbuca/shopping_chatbot
- Este repositorio es para mantener el código funcional final. Toda la administración se llevo en el repo posterior.



