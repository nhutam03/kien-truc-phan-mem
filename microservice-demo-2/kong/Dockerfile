FROM curlimages/curl:latest

USER root
RUN apk add --no-cache bash

WORKDIR /app
COPY kong-setup.sh /app/kong-setup.sh
RUN chmod +x /app/kong-setup.sh

CMD ["bash", "/app/kong-setup.sh"]
