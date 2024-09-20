up:
	docker compose up --build -d 

up-rebuild:
	docker compose up --build --force-recreate --no-deps

down:
	docker compose down

down-prune:
	docker compose down --volumes

up-backend:
	docker compose -f docker-compose.backend.yml up -d

up-backend-rebuild:
	docker compose -f docker-compose.backend.yml up --build --force-recreate --no-deps

down-backend:
	docker compose -f docker-compose.backend.yml down

.PHONY: up up-rebuild down down-prune up-backend up-backend-rebuild down-backend
