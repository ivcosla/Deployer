FROM component/base
RUN mkdir component
COPY . /component/ 
WORKDIR "/component/code"
RUN  apt-get install -y zip
RUN  npm install tar
CMD ["nodejs","component.js"]