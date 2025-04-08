FROM openjdk:11-jre-slim

WORKDIR /app

COPY Worker.java .
RUN javac Worker.java

CMD ["java", "Worker"]