# Lotion
netlify link (DEMO) https://thomas-lotion-2.netlify.app

This repository contains a project example of using AWS API Gateway, Lambda, and DynamoDB to save, delete, and retrieve notes from a front end interface
# Lotion - AWS API Gateway, Lambda, and DynamoDB Example

## Overview

Welcome to the Lotion repository! This project serves as an example of building a Notion-like note-taking app using AWS services, including API Gateway, Lambda, and DynamoDB. The front end of the application is built using React.js.

## Features

- **Serverless Architecture**: The backend of the application is entirely serverless, utilizing AWS Lambda for compute, API Gateway for API management, and DynamoDB for data storage.

- **Note CRUD Operations**: Lotion allows users to perform basic CRUD (Create, Read, Update, Delete) operations on notes.

- **React Front End**: The front end is built with React.js, providing a modern and responsive user interface.

### Configuration

1. Update AWS credentials: Open the `serverless.yml` file and update the `provider` section with your AWS credentials.

2. Configure React app: Open the `src/config.js` file and update the `apiUrl` with the API Gateway endpoint.



## Acknowledgments

Special thanks to the AWS team for providing robust serverless services and to the React.js community for building a fantastic front-end library.
