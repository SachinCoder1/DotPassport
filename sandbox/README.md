<div align="center">

<img src="https://i.ibb.co/sdxrkW6F/dotpassport-logo.png" alt="DotPassport Logo" width="100" />

# DotPassport Sandbox

**Developer Testing Environment for DotPassport API & SDK**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

A local development environment for testing DotPassport API endpoints, SDK widgets, and monitoring request logs.

</div>

---

## Screenshots

### Dashboard
Overview of your sandbox environment with quick access to all testing tools.

<div align="center">
  <img src="https://i.ibb.co/wZc8GRWG/dotpassport-sandbox-dashboard.png" alt="DotPassport Sandbox Dashboard" width="800" />
</div>

---

### API Testing
Test all DotPassport API endpoints with an interactive interface. Enter addresses, select endpoints, and see real-time responses.

<div align="center">
  <img src="https://i.ibb.co/N61MmCDY/dotpassport-sandbox-api-testing-page.png" alt="API Testing Page" width="800" />
</div>

#### Documentation Tab
View detailed API documentation for each endpoint.

<div align="center">
  <img src="https://i.ibb.co/wZ35995Q/dotpassport-sandbox-api-testing-page-documentation-tab.png" alt="API Testing Documentation Tab" width="800" />
</div>

#### Response Tab
See API responses in a clean, formatted view.

<div align="center">
  <img src="https://i.ibb.co/GfRRGWGD/dotpassport-sandbox-api-testing-page-empty-response-tab.png" alt="API Testing Response Tab" width="800" />
</div>

---

### Widget Testing
Preview and customize DotPassport SDK widgets in real-time. Test different configurations, themes, and addresses.

<div align="center">
  <img src="https://i.ibb.co/B5PHBQfq/dotpassport-widget-testing-page.png" alt="Widget Testing Page" width="800" />
</div>

---

### Request Logs
Monitor all API requests made from the sandbox. View request details, timing, and responses.

<div align="center">
  <img src="https://i.ibb.co/rKmZM7Y8/dotpassport-sandbox-request-logs-page.png" alt="Request Logs Page" width="800" />
</div>

---

## Features

### API Testing
- Test all DotPassport API endpoints
- Interactive request builder
- Real-time response viewer
- Request/response history
- Documentation for each endpoint

### Widget Testing
- Preview all 4 widget types (Reputation, Badge, Profile, Category)
- Live configuration updates
- Theme switching (light/dark/auto)
- Custom address input
- Code snippet generator

### Request Logs
- Real-time request monitoring
- Request timing and status
- Response body inspection
- Filter by endpoint/status
- Export logs

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- DotPassport API running locally (default: `http://localhost:4000`)

### Installation

```bash
# Clone the repository
git clone https://github.com/SachinCoder1/dotpassport.git
cd dotpassport/sandbox

# Install dependencies
npm install

# Start the development server
npm run dev
```

The sandbox will be available at `http://localhost:5173`

### Environment Configuration

Create a `.env` file in the sandbox directory:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_API_KEY=your_sandbox_api_key
```

---

## Project Structure

```
sandbox/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── ApiTestingPage.tsx
│   │   ├── WidgetTestingPage.tsx
│   │   └── RequestLogsPage.tsx
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layer
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   └── App.tsx           # Main application
├── public/               # Static assets
└── index.html            # Entry HTML
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **@dotpassport/sdk** - DotPassport SDK integration

---

## Related Resources

- [DotPassport SDK](../sdk/README.md) - Official SDK documentation
- [DotPassport API](../api/README.md) - API documentation
- [Widget Guide](../sdk/docs/widgets.md) - Widget customization guide

---

## Author

<div align="center">
  <img src="https://github.com/SachinCoder1.png" width="80" style="border-radius: 50%;" alt="Sachin" />

  **Sachin**

  [![GitHub](https://img.shields.io/badge/GitHub-SachinCoder1-181717?style=flat-square&logo=github)](https://github.com/SachinCoder1)
</div>

---

## License

MIT License - See [LICENSE](../LICENSE) for details.
