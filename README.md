# Moca Pulse

**Verifiable Feedback & Reputation on Moca Network**

A decentralized application built for the Moca Network that enables users to participate in polls, build reputation, and create verifiable credentials through the Moca AIR Kit integration.

## 🚀 Features

- **🔐 Moca AIR Kit Integration**: Secure decentralized identity management
- **📊 Poll System**: Create and participate in community polls
- **🏆 Reputation System**: Build verifiable reputation through participation
- **📜 Verifiable Credentials**: On-chain proof of poll participation and achievements
- **🌐 Decentralized Identity**: Self-sovereign identity powered by Moca Network

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Moca Developer Account** (for AIR Kit credentials)

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mocapulse-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Moca AIR Kit Credentials

1. Visit the [Moca Developer Dashboard](https://developers.sandbox.air3.com/)
2. Create a new project or select an existing one
3. Obtain the following credentials:
   - **Partner ID**
   - **Issuer DID**
   - **Verifier DID**

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Moca AIR Kit Configuration
NEXT_PUBLIC_MOCA_PARTNER_ID=your_partner_id_here
NEXT_PUBLIC_MOCA_BUILD_ENV=sandbox
NEXT_PUBLIC_MOCA_ISSUER_DID=your_issuer_did_here
NEXT_PUBLIC_MOCA_VERIFIER_DID=your_verifier_did_here
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_MOCA_PARTNER_ID` | Your Moca AIR Kit Partner ID | ✅ | `moca_partner_id` |
| `NEXT_PUBLIC_MOCA_BUILD_ENV` | Build environment (sandbox/production) | ✅ | `sandbox` |
| `NEXT_PUBLIC_MOCA_ISSUER_DID` | DID for credential issuance | ✅ | `did:air:id:test:...` |
| `NEXT_PUBLIC_MOCA_VERIFIER_DID` | DID for credential verification | ✅ | `did:key:...` |

## 📁 Project Structure

```
mocapulse-app/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # User dashboard
│   ├── polls/              # Poll-related pages
│   │   ├── create/         # Create new polls
│   │   └── [id]/          # Dynamic poll pages
│   │       ├── participate/ # Poll participation
│   │       └── results/    # Poll results
│   ├── profile/           # User profile management
│   ├── reputation/        # Reputation tracking
│   ├── layout.tsx         # Root layout with AIR Kit provider
│   └── page.tsx          # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── connect-button.tsx # Moca ID connection button
├── contexts/             # React contexts
│   └── airkit-context.tsx # AIR Kit authentication context
├── lib/                  # Utility libraries
│   ├── airkit.ts        # AIR Kit service initialization
│   └── credentials.ts   # Credential management
└── .env.local           # Environment variables
```

## 🌐 Available Pages

| Page | URL | Description |
|------|-----|-------------|
| **Landing** | `/` | App overview and introduction |
| **Profile** | `/profile` | User identity and Moca ID management |
| **Dashboard** | `/dashboard` | User activity overview |
| **Reputation** | `/reputation` | Reputation tracking and badges |
| **Create Poll** | `/polls/create` | Create new community polls |
| **Poll Participation** | `/polls/[id]/participate` | Participate in specific polls |
| **Poll Results** | `/polls/[id]/results` | View poll results and analytics |

## 🔄 User Flow

1. **Connect Identity**: Visit any page and click "Connect Moca ID"
2. **Setup Profile**: Complete your profile at `/profile`
3. **Explore Dashboard**: Access your main hub at `/dashboard`
4. **Participate**: Join polls and build reputation
5. **Track Progress**: Monitor your achievements at `/reputation`

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔧 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Moca AIR Kit
- **Blockchain**: Moca Network
- **Language**: TypeScript

## 🔐 Security Notes

- **Environment Variables**: Never commit `.env.local` to version control
- **Credentials**: Keep your Moca AIR Kit credentials secure
- **Production**: Update `NEXT_PUBLIC_MOCA_BUILD_ENV=production` for production deployments

## 🆘 Troubleshooting

### Common Issues

**1. AIR Kit Connection Issues**
- Verify your Partner ID and DIDs are correct
- Check that you're using the sandbox environment for development
- Ensure all environment variables are properly set

**2. Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Clear Next.js cache: `rm -rf .next`
- Restart the development server

**3. Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check that all UI components are imported correctly

### Getting Help

- **Moca Network Documentation**: [https://docs.moca.network/](https://docs.moca.network/)
- **AIR Kit Developer Dashboard**: [https://developers.sandbox.air3.com/](https://developers.sandbox.air3.com/)

## 🎯 Next Steps

1. **Configure Production Environment**: Set up production AIR Kit credentials
2. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform
3. **Customize**: Modify the UI and functionality to match your needs
4. **Extend**: Add additional features like advanced poll types or social features

## 📜 License

This project is built for the Moca Network Buildathon.

---

**Built with ❤️ for the Moca Network ecosystem**