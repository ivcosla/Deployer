FROM component/base

# Bundle app source
# COPY . /src
RUN mkdir component
COPY . /component/
#RUN cd /component/code
WORKDIR "/component/code" 

# Install app dependencies. Package.json de deployer no es para npm
# RUN npm install

#Backend por defecto con deployer.js
EXPOSE 8000

CMD ["nodejs", "component.js"]




