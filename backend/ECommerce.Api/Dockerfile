FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ECommerce.Api.csproj", "./"]
RUN dotnet restore "ECommerce.Api.csproj"
COPY . .
RUN dotnet build "ECommerce.Api.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "ECommerce.Api.dll"]