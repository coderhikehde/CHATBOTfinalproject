FROM maven:3.9.6-eclipse-temurin-17
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests
EXPOSE 8080
CMD ["mvn", "exec:java", "-Dexec.mainClass=com.chatbot.Main"]
