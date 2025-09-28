# FROM node:18 AS build  me permet d'utiliser une immag oficielle de node pour builder; WORKDIR /app definit le dossier de travail
#COPY . . tranfère tt le projet dedans
FROM node:18 AS build 
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# FROM nginx:alpine me permet de d'utiliser une image nginx comme serveur, COPY --from=build /app/dist /usr/share/nginx/html je l'utilise
#pour copie les fichiers générés dans le dossier public de Nginx. 
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]  me permet de demarer nginx et EXPOSE 80
 # me  permet douvrir le port 80(http)

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
