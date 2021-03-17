FROM node:14-alpine As base

RUN apk add --update sudo dumb-init shadow python3

WORKDIR /tmp/build

ENV NODE_ENV development

ADD package.json package-lock.json /tmp/build/

RUN npm install



FROM node:14-alpine

EXPOSE 6001 9001

RUN apk add --update sudo dumb-init shadow python3

RUN groupadd -g 117 hero && \
    useradd -u 117 -g 117 --create-home --shell /bin/bash hero

RUN echo 'hero ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER hero

ENV HOME="/home/hero"

WORKDIR /home/hero/eventsArchive

ENV NODE_ENV development

ADD . /home/hero/eventsArchive

COPY --from=base /tmp/build/node_modules /home/hero/eventsArchive/node_modules

RUN sudo chown -R 117:117 /home/hero

CMD ["npm", "run", "grpcServerDev"]
