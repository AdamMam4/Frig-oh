# Frig-oh

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 🐳 Docker Setup (Recommended)

The easiest way to run the entire application stack is using Docker.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed on your system
- Docker Compose (included with Docker Desktop)

### Quick Start with Docker

1. **Create Environment Configuration**

   Create a `.env` file in the `backend` directory with the following variables:

   ```env
   # MongoDB Configuration
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=your_secure_password

   # Backend Configuration
   SECRET_KEY=your_secret_key_here_change_in_production
   GOOGLE_API_KEY=your_google_api_key_here

   # Optional: Frontend Configuration
   REACT_APP_API_URL=http://localhost:8000
   ```

2. **Build and Start All Services**

   ```bash
   docker-compose up --build
   ```

   Or run in detached mode (background):

   ```bash
   docker-compose up -d --build
   ```

3. **Access the Application**
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **MongoDB**: localhost:27017

### Docker Services

The application stack consists of three services:

- **Frontend**: React application served by Nginx (port 80)
- **Backend**: FastAPI Python application (port 8000)
- **MongoDB**: Database server (port 27017)

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs from all services
docker-compose logs

# View logs from specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Rebuild a specific service
docker-compose build backend

# Access backend container shell
docker-compose exec backend bash

# Access MongoDB shell
docker-compose exec mongodb mongosh
```

For more detailed Docker setup information, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

---

## 💻 Local Development (Without Docker)

### Backend Setup

1. **Navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - Windows PowerShell:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - Windows CMD:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**

   Create a `.env` file in the `backend` directory with your configuration:

   ```env
   MONGO_URI=mongodb://localhost:27017/frigoh
   SECRET_KEY=your_secret_key_here
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

   For detailed configuration options, see [backend/SETUP.md](backend/SETUP.md)

6. **Start the backend server**

   ```bash
   python run.py
   ```

   The API will be available at: **http://localhost:8000**

7. **Access API Documentation**
   - **Interactive Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc
   - **Written Documentation**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

### Frontend Setup

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
