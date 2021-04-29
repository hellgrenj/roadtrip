FROM mcr.microsoft.com/dotnet/sdk:5.0.202 AS build-env
WORKDIR /app

# copy csproj and restore as distinct layers
COPY ./location.csproj .
RUN dotnet restore

# copy everything else and build
COPY . .
RUN dotnet publish -c Release -o out

#build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine
# create and use non-root user.. (requires us to use a port number higher than 1024, default 8080. override with Env variable PORT, e.g PORT=8181)
RUN adduser \
  --disabled-password \
  --home /apprunner \
  --gecos '' apprunner \
  && chown -R apprunner /apprunner
USER apprunner

WORKDIR /app
COPY --from=build-env /app/out ./
COPY --from=build-env /app/capitals.json ./

ENTRYPOINT ["dotnet", "./location.dll"]
