# 🛡️ BillShield

**BillShield** is a GenAI-powered web application designed to help users identify forgotten or unused subscriptions by analyzing bank or credit card statements. Built for demo-first success, it leverages Google's Gemini-2.0-Flash to turn messy financial data into actionable savings.

## ✨ Features

- **📄 PDF Statement Analysis**: Drag and drop your bank statement PDF directly for instant processing.
- **✍️ Text Paste Fallback**: Copy-paste transaction rows from your bank app or email if you don't have a PDF.
- **🔍 Intelligent Detection**: Automatically identifies recurring charges, grouping similar merchants and detecting billing cycles.
- **💰 Savings Dashboard**: View your total annual spend and potential savings at a glance.
- **⚠️ Waste Identification**: Flags "possibly unused" subscriptions based on billing patterns.
- **🚀 Cancellation Guides**: Get step-by-step AI-generated instructions for canceling detected services.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Engine**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/)).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rznies/billshield-.git
   cd billshield-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173`.

## 📖 How to Use

1. **Input Data**: Choose between "Paste Text" or "Upload PDF".
2. **Analyze**: Click "Analyze Subscriptions". The Gemini-powered pipeline will scan your transactions.
3. **Review**: Check the dashboard for your annual spend and potential savings.
4. **Take Action**: Click on any subscription (especially those flagged in amber) to see the step-by-step cancellation guide.

## 🔒 Privacy & Principles

- **One-time Analysis**: This is a stateless tool. No data is stored in a database or cloud storage.
- **Demo-First**: Optimized for speed, reliability, and clear value demonstration.
- **Deterministic AI**: Configured with temperature `0` and strict JSON output for consistent, accurate financial reporting.

---
Built during a Hackathon to showcase the power of Multimodal GenAI in Personal Finance.
