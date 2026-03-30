# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml .
COPY common/pom.xml common/pom.xml
COPY product-service/pom.xml product-service/pom.xml

COPY common/src common/src
COPY product-service/src product-service/src

RUN mvn install -N -DskipTests --no-transfer-progress
RUN mvn package -pl product-service -am -DskipTests --no-transfer-progress

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/product-service/target/product-service-*.jar app.jar

EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
