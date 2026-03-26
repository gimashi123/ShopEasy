# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy parent POM
COPY pom.xml .

# Copy ALL module POMs
COPY auth-service/pom.xml    auth-service/pom.xml
COPY common/pom.xml          common/pom.xml
COPY gateway/pom.xml         gateway/pom.xml
COPY delivery-service/pom.xml delivery-service/pom.xml

# Copy source and dependencies
COPY delivery-service/src delivery-service/src
COPY common/src common/src

# Install parent POM
RUN mvn install -N -DskipTests --no-transfer-progress

# Build delivery-service and common
RUN mvn package -pl delivery-service -am -DskipTests --no-transfer-progress

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/delivery-service/target/delivery-service-*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
