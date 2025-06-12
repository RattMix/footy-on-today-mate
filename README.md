
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d236e76d-fd95-411f-9d2f-bba3c084d79b

## API Setup

This project uses live football data from Football-Data.org API. To get the site working with real match data:

### 1. Get your API Key

1. Visit [Football-Data.org](https://www.football-data.org/)
2. Create a free account
3. Go to your account dashboard and copy your API token
4. The free tier allows 10 requests per minute and covers major competitions

### 2. Set up Environment Variables

Create a `.env.local` file in your project root and add your API key:

```
VITE_FOOTBALL_API_KEY=your_api_key_here
```

**Important:** 
- Never commit your API key to version control
- The `.env.local` file should be in your `.gitignore`
- In production, set this environment variable in your hosting platform

### 3. Supported Competitions

The app currently fetches data from these major competitions:
- Premier League (England)
- Champions League (UEFA)
- Bundesliga (Germany)
- La Liga (Spain)
- Serie A (Italy)
- Ligue 1 (France)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d236e76d-fd95-411f-9d2f-bba3c084d79b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create your environment file with API key
cp .env.example .env.local
# Edit .env.local and add your VITE_FOOTBALL_API_KEY

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- TanStack Query (for API data fetching)
- Football-Data.org API (for live match data)

## New Dependencies

This update adds the following dependencies:
- `@tanstack/react-query` - For efficient API data fetching and caching

## API Features

- **Live Data**: Real match fixtures, teams, and kick-off times
- **Caching**: Smart caching to minimize API requests
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Loading States**: Professional loading indicators
- **Date Range**: Fetches matches for a week around selected date
- **Auto-refresh**: Data refreshes automatically to stay current

## Troubleshooting

If you're having issues:

1. **No matches showing**: Check your API key is correctly set in `.env.local`
2. **API errors**: Ensure you haven't exceeded your rate limit (10 requests/minute for free tier)
3. **Network errors**: Check your internet connection
4. **Old data**: The app caches data for 5 minutes - wait or refresh to see updates

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d236e76d-fd95-411f-9d2f-bba3c084d79b) and click on Share -> Publish.

**Important for deployment**: Make sure to set the `VITE_FOOTBALL_API_KEY` environment variable in your hosting platform (Vercel, Netlify, etc.).

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
