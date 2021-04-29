FROM golang:1.16-alpine3.13 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN go build -o main ./main.go
FROM alpine:3.13 as runtime
COPY --from=builder ./app/main main
CMD ["./main"]