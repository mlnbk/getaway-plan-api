<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/mlnbk/getaway-plan-api/blob/main/GP-logo-transparent-green.png">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/mlnbk/getaway-plan-api/blob/main/GP-logo-transparent-brown.png">
    <img alt="GetawayPlan Logo" src="https://github.com/mlnbk/getaway-plan-api/blob/main/GP-logo-transparent-green.png">
  </picture>
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

## Environmental variables

The neccessary environmental variables and their short description is available in `.env.template`.

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

# Caching

The backend utilizes Redis for caching responses to improve performance and reduce load on the database.

## Flow

When a request comes in, the server checks if there is data in the Redis cache for the requested key. If there is, it returns the cached data. If not, it generates the new data, stores it in the Redis cache under the requested key, and returns it.

## Configuration

To use the Redis caching functionality, you will need to set the following environment variables:

`REDIS_URL`: the Redis connection URL
`CACHE_EXPIRATION`: the cache expiration time in seconds

## Methods

The cacheService provides the following methods:

* `getAllKeys()`: retrieves all the keys stored in Redis
* `getItem(key: string)`: retrieves the cached data for the specified key, or undefined if the key doesn't exist
* `setItem(key: string, value: any, expiration?: number)`: stores the specified data under the given key in Redis, with an optional expiration time which overrides the expiration time set in the corresponding environmental variable
* `invalidateKeys(pattern: string)`: deletes all keys matching the specified pattern
* `flushAll()`: deletes all keys in Redis

Please note that the cacheService uses JSON.stringify and JSON.parse to serialize and deserialize the cached data, so the data should be JSON-serializable.

# Image storing

This application uses AWS S3 to store trip pictures. The S3Util class provides a simple way to upload a file to an S3 bucket and get the URL for the uploaded file.

## Environment Variables

The S3Util requires the following environment variables to be set:

* `AWS_S3_ACCESS_KEY`: The access key for the AWS S3 account.
* `AWS_S3_SECRET_KEY`: The secret access key for the AWS S3 account.
* `AWS_S3_REGION`: The AWS region where the S3 bucket is located.
* `S3_PICTURES_BUCKET`: The name of the S3 bucket where trip pictures will be stored.

## Usage

To use the S3Util to upload a file to an S3 bucket, create an instance of the S3Util class and call its upload method, passing in the S3 bucket name and the file to upload as arguments.

The upload method returns the URL of the uploaded file, which can be stored in the pictures array of the trip object.

## License
