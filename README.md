<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
  </a>
</p>

<!-- <p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p> -->

# Getaway Plan API

## Description

This travel plan app API is a backend service for a travel planning application. It provides endpoints for user authentication, user management, and travel planning.<br />
The API is built using the NestJS framework, which provides a scalable and modular architecture, as well as a range of features for security, validation, and performance.<br />
The API uses JSON Web Tokens (JWT) for authentication and authorization, and includes a local strategy for validating user credentials.<br />
The API is also designed with security in mind, including rate limiting, CORS support, and request validation with the class-validator library and the ValidationPipe middleware.<br />
With this API, users can create and manage travel plans, view and edit their user profiles, and authenticate securely.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# User Authentication

The API supports user authentication using JSON Web Tokens (JWT) and local strategy.

## Local Strategy, JWT Authentication

To authenticate a user, send a POST request to /auth/login with the following body:

```
{
  "email": "user@example.com",
  "password": "password"
}
```

If the email and password match a user in the database, the server will respond with a JWT token in the following format:

```
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
}
```

Include the JWT token in the Authorization header of subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

# Security Measures

The API includes the following security measures:

## Rate Limiting

Requests to the API are rate limited to prevent abuse. If a client exceeds the rate limit, the server will respond with a `429 Too Many Requests` status code.

## CORS

The API is configured to only allow requests from specified domains. Requests from other domains will be blocked.

## Request Validation

All requests are validated using NestJS' ValidationPipe. Requests with invalid data will be rejected with a `400 Bad Request` status code.

## License
