# Environment Setup Checklist

## Database Secrets to Add
- **DATABASE_URL**: Add the URL to your database.
- **DATABASE_USERNAME**: Add your database username.
- **DATABASE_PASSWORD**: Add your database password.

## Firebase/GCP Secrets to Remove
- **FIREBASE_API_KEY**: Remove this key if no longer needed.
- **GCP_PROJECT_ID**: Remove this if it’s not in use.

## Local Development Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/logiccamila-wq/optilog.app.git
   cd optilog.app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the root of the project.
   - Add the required database secrets and remove any Firebase/GCP secrets that are no longer needed.

4. **Run the Application**
   ```bash
   npm start
   ```

5. **Access the Application**
   - Open your browser and go to `http://localhost:3000` (or the specified port).
