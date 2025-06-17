# Housing Project - MCR Form

Application for managing Manual Check Request (MCR) forms for Housing.


## Tech Stack

- React
- TypeScript
- Material-UI
- SQL Server
- SMTP for email notifications

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQL Server
- SMTP Server access
- VPN access (for production)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Jaeger-JG/Housing.git
cd Housing
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_SQL_SERVER=your_sql_server
REACT_APP_SQL_DATABASE=your_database
REACT_APP_SQL_USER=your_username
REACT_APP_SQL_PASSWORD=your_password
REACT_APP_SMTP_SERVER=your_smtp_server
REACT_APP_SMTP_PORT=your_smtp_port
REACT_APP_SMTP_USER=your_smtp_username
REACT_APP_SMTP_PASSWORD=your_smtp_password
```

4. Start the development server:
```bash
npm start
```

## Development

- The application will be available at `http://localhost:3000`
- Changes will automatically reload in the browser

## Production

- Build the application:
```bash
npm run build
```
- Deploy the contents of the `build` directory to your web server

## Security

- The application requires VPN access in production
- All sensitive data is stored in environment variables
- SQL Server connections are encrypted
- SMTP connections use SSL/TLS

## License

This project is proprietary and confidential. 
