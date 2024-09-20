# LLM Application Boilerplate

This project provides a boilerplate for quickly setting up an LLM (Language Model) application with a Remix.js frontend and a FastAPI backend. It uses Docker for containerization and includes a Makefile for easy deployment.

## Project Structure

-   `recommender-ui`: Remix.js frontend with Tailwind CSS
-   `recommender-be`: Python FastAPI backend with WebSocket support
-   `docker-compose.yml`: Docker configuration for the entire stack
-   `docker-compose.backend.yml`: Docker configuration for running only the backend
-   `Makefile`: Simplified commands for building and running the project
-   `nginx.conf`: NGINX configuration for reverse proxy

## Architecture Overview

The LLM Application Boilerplate follows a microservices architecture consisting of the following main components:

1. Remix.js Frontend: Handles the user interface and client-side logic.
2. FastAPI Backend: Manages API requests, WebSocket connections, and integrates with the LLM service.
3. NGINX Reverse Proxy: Routes traffic to the appropriate service and handles SSL termination.

The data flow in this system is as follows:
Client -> NGINX -> Remix.js Frontend -> FastAPI Backend -> LLM Service

This architecture ensures scalability and separation of concerns, allowing for easy customization and extension of each component.

## Getting Started

### Prerequisites

-   Git
-   Docker
-   Docker Compose
-   Make (optional, but recommended)
-   Bun (for running the frontend locally)

### Cloning the Repository

To clone this project, run the following command:

```bash
git clone https://github.com/datnguyennnx/llm-app-boilerplate.git
cd llm-app-boilerplate
```

### Running the Project

We use a Makefile to simplify the Docker commands. Here are the available commands:

1. Build and start the entire stack:

    ```
    make up
    ```

2. Stop and remove the containers:

    ```
    make down
    ```

3. Build and start only the backend:

    ```
    make up-backend
    ```

4. Rebuild and start only the backend:

    ```
    make up-backend-rebuild
    ```

5. Stop and remove only the backend container:

    ```
    make down-backend
    ```

If you don't have Make installed, you can use the Docker Compose commands directly:

```bash
# Build and start the entire stack
docker-compose up -d

# Stop and remove the containers
docker-compose down

# Build and start only the backend
docker-compose -f docker-compose.backend.yml up -d

# Stop and remove only the backend container
docker-compose -f docker-compose.backend.yml down
```

## Accessing the Application

Once the containers are up and running:

-   The frontend will be available at: `http://localhost:3000`
-   The backend API will be available at: `http://localhost:8000`

## Development Setup

For development purposes, you might want to run the backend in a container while developing the frontend locally. Here's how to do that:

### Running the Backend Container

1. Use the `make up-backend` command to run only the backend:

    ```bash
    make up-backend
    ```

2. The backend API will be available at: `http://localhost:8000`

### Running the Frontend Locally

1. Navigate to the frontend directory:

    ```bash
    cd recommender-ui
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Start the development server:

    ```bash
    bun run dev
    ```

4. The frontend will be available at: `http://localhost:3000`

This setup allows you to make changes to the frontend code and see the results immediately, while still having the backend running in a container.

## Development Guidelines

1. Frontend Development (recommender-ui):

    - Follow the Remix.js best practices and conventions.
    - Use TypeScript for type-safe code.
    - Utilize Tailwind CSS for styling.
    - Format code using Prettier and lint with ESLint.

2. Backend Development (recommender-be):

    - Follow FastAPI best practices for API development.
    - Use Python type hints for better code clarity.
    - Implement WebSocket support for real-time communication.
    - Format code according to PEP 8 style guide and lint with Flake8.

3. General Guidelines:
    - Write clear, concise, and well-documented code.
    - Use meaningful variable and function names.
    - Implement proper error handling and logging.
    - Write unit tests for critical functionality.

## Customizing the Template

This boilerplate provides a starting point for your LLM application. You can customize the frontend and backend components to fit your specific use case. Some areas you might want to focus on:

1. Modify the frontend UI in the `recommender-ui` directory to match your application's needs.
2. Update the backend API in the `recommender-be` directory to integrate with your chosen LLM and implement your business logic.
3. Adjust the Docker and Makefile configurations if you need to add more services or change the existing setup.
4. Implement authentication and authorization mechanisms suitable for your application.
5. Set up a CI/CD pipeline for automated testing and deployment.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

-   Remix.js team for the excellent React-based web framework
-   FastAPI team for the high-performance Python web framework
-   Docker team for containerization technology
-   All open-source libraries and tools used in this project
