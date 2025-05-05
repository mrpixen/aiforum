
# Modern Forum

A modern forum application built with React, TypeScript, Express, and TypeORM.

## Features

- User authentication (login/register)
- Thread and post creation
- Categories and tags
- Reactions to posts
- Real-time notifications
- Modern UI with responsive design

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd modern-forum
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
- Create a PostgreSQL database named `modern_forum`
- Update the database configuration in `src/server/config.ts` if needed

4. Start the development servers:
```bash
npm run dev
```
This will start both the backend server (port 3001) and frontend development server (port 3000).

## Project Structure

```
modern-forum/
├── src/
│   ├── client/          # React frontend
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── styles/      # CSS files
│   │   └── types/       # TypeScript types
│   └── server/          # Express backend
│       ├── config/      # Configuration files
│       ├── controllers/ # Route controllers
│       ├── middleware/  # Express middleware
│       ├── models/      # TypeORM entities
│       ├── routes/      # API routes
│       └── services/    # Business logic
├── public/              # Static files
└── package.json         # Project dependencies
```

## Available Scripts

- `npm run dev` - Start both frontend and backend servers
- `npm run server` - Start only the backend server
- `npm start` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 
>>>>>>> 8b9779d (gay)
