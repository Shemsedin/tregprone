SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help install up down logs ps reset dev build test lint typecheck \
        db-migrate db-deploy db-seed db-reset db-studio i18n-lint clean

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm ci

up: ## Start docker services (postgres, mailhog, minio)
	docker compose up -d

down: ## Stop docker services
	docker compose down

logs: ## Tail docker logs
	docker compose logs -f --tail=100

ps: ## List docker services
	docker compose ps

reset: down ## Reset docker volumes (destroys data!)
	docker compose down -v
	docker compose up -d

dev: ## Run web + api in parallel
	npm run dev

build: ## Build everything
	npm run build

test: ## Run unit + integration tests
	npm test

lint: ## Lint everything
	npm run lint

typecheck: ## Typecheck all workspaces
	npm run typecheck

db-migrate: ## Apply Prisma dev migrations
	npm run db:migrate

db-deploy: ## Apply Prisma migrations (CI/prod style)
	npm run db:deploy

db-seed: ## Seed the database
	npm run db:seed

db-reset: ## Drop, migrate, and seed
	npm run db:reset

db-studio: ## Open Prisma Studio
	npm run db:studio

i18n-lint: ## Verify i18n key parity across locales
	npm run i18n:lint

clean: ## Remove build artifacts and node_modules
	npm exec --workspaces -- rimraf dist build .turbo coverage || true
	rimraf node_modules || true
