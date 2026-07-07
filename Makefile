dev:
	docker compose up --build

prod:
	docker compose -f docker-compose.prod.yml up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec backend-api alembic upgrade head

build-backend:
	docker build -t nexx-backend:latest ./backend

build-frontend:
	docker build -t nexx-frontend:latest ./frontend
