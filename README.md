
# DayFlow - Intelligent Day Planner

DayFlow is a Next.js application designed to help you plan your day effectively with the assistance of AI-powered features. It includes components for daily overview, time blocking, to-do lists, goal tracking, meal planning, note-taking, reflection, a Pomodoro timer, and AI-driven task suggestions and scheduling.

## Features

*   **Daily Overview**: See the current date, day, and manage your top 3 priorities.
*   **Time Blocking**: Plan your day hour-by-hour from 6 AM to 10 PM.
*   **To-Do Lists**: Organize tasks by categories (Work, Personal, Health/Fitness, Errands).
*   **AI Assistant**:
    *   Suggest tasks for your priorities.
    *   Schedule single locked time slots.
    *   Generate a smart, comprehensive daily schedule based on your goals and tasks.
*   **Pomodoro Timer**: Focus using the Pomodoro technique with configurable work and break intervals.
*   **Goals & Habits**: Track daily habits and micro-goals.
*   **Meal Planner**: Plan your meals for the day and track water intake/supplements.
*   **Notes & Ideas**: A space for quick notes and brain dumps.
*   **Reflection & Review**: Reflect on your day and track your mood.
*   **Theming**: Supports Light, Dark, Premium, and Royal themes.
*   **Collapsible Sections**: Most cards can be collapsed to save space.
*   **Local Data Storage**: All your data is saved in your browser's `localStorage`.

## Tech Stack

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript for type safety.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **ShadCN UI**: Re-usable UI components.
*   **Genkit (with Google AI - Gemini)**: For AI-powered features.
*   **Lucide React**: For icons.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

## Getting Started

Follow these steps to set up and run the project locally:

**1. Clone the Repository**

If you haven't already, clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>
```

**2. Install Dependencies**

Install the project dependencies using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

**3. Set Up Environment Variables**

The AI features in this application use Genkit with Google AI (Gemini). You'll need a Google AI API key.

*   Create a `.env` file in the root of your project by copying the example:
    ```bash
    cp .env.example .env
    ```
    (If `.env.example` doesn't exist, create a new file named `.env`)

*   Open the `.env` file and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```
    You can obtain a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

**4. Run the Development Servers**

This project requires two development servers to run concurrently:
*   The Next.js app server.
*   The Genkit development server for AI flows.

Open two terminal windows/tabs in your project directory.

*   **In the first terminal, start the Next.js development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9002`.

*   **In the second terminal, start the Genkit development server:**
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit flows. You might see output indicating that flows are available. If you want Genkit to automatically restart when you make changes to your flow files, you can use:
    ```bash
    npm run genkit:watch
    ```

**5. Access the Application**

Open your web browser and navigate to `http://localhost:9002` (or the port indicated in your terminal if different).

You should now be able to use the DayFlow application, including its AI-powered features.

## Local Storage

All user-generated data (tasks, priorities, notes, etc.) is stored in your browser's `localStorage`. This means:
*   Data is specific to the browser and device you are using.
*   Data will persist even if you close the tab or browser.
*   Clearing your browser's cache/storage for this site will delete your local data.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (with Turbopack).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with hot-reloading for flow changes.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server (after running `build`).
*   `npm run lint`: Lints the codebase.
*   `npm run typecheck`: Runs TypeScript type checking.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open-source and available under the [MIT License](LICENSE.md) (assuming one, if not, specify or remove).
