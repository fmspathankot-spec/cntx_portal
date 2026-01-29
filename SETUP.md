# CNTX Portal - Setup Guide (Hindi)

## 🚀 Installation Steps (इंस्टॉलेशन स्टेप्स)

### 1. Repository Clone करें
```bash
git clone https://github.com/fmspathankot-spec/cntx_portal.git
cd cntx_portal
```

### 2. Dependencies Install करें
```bash
npm install
# या
yarn install
# या
pnpm install
```

### 3. Environment Variables Setup करें
```bash
# .env.example को copy करके .env.local बनाएं
cp .env.example .env.local

# अब .env.local file को edit करें और अपनी values डालें
```

### 4. Development Server Start करें
```bash
npm run dev
# या
yarn dev
# या
pnpm dev
```

अब browser में खोलें: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure (प्रोजेक्ट स्ट्रक्चर)

```
cntx_portal/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable components
│   │   ├── Sidebar.js          # Sidebar navigation
│   │   ├── DashboardCard.js    # Dashboard card component
│   │   └── StatsCard.js        # Statistics card component
│   ├── dashboard/              # Dashboard page
│   │   └── page.js
│   ├── configuration/          # Configuration page
│   │   └── page.js
│   ├── contact/                # Contact page
│   │   └── page.js
│   ├── services/               # Services page
│   │   └── page.js
│   ├── layout.js               # Root layout
│   ├── page.js                 # Home page
│   └── globals.css             # Global styles
├── public/                      # Static files
├── .env.example                # Environment variables example
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── next.config.js              # Next.js configuration
└── README.md                   # Project documentation
```

---

## 🎨 Features (फीचर्स)

### ✅ Implemented (लागू किए गए)
- 🏠 **Home Page** - Beautiful landing page with hero section
- 📊 **Dashboard** - Stats cards और quick actions
- ⚙️ **Configuration** - Complete form with validation
- 📧 **Contact** - Contact form with business hours
- 🛠️ **Services** - Services showcase page
- 📱 **Responsive Design** - Mobile, tablet, desktop support
- 🎨 **Modern UI** - Tailwind CSS with smooth animations
- 🧭 **Sidebar Navigation** - Mobile-friendly sidebar

### 🔜 Coming Soon (जल्द आने वाले)
- 🔐 Authentication (Login/Register)
- 📊 Real-time Analytics
- 🗄️ Database Integration
- 🔔 Notifications System
- 👥 User Management
- 📈 Advanced Reporting

---

## 🛠️ Technologies Used (इस्तेमाल की गई टेक्नोलॉजी)

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing
- **ESLint** - Code linting

---

## 📝 Development Tips (डेवलपमेंट टिप्स)

### Code Organization
- Components को `app/components/` में रखें
- Pages को `app/[page-name]/page.js` format में बनाएं
- Reusable logic को custom hooks में डालें

### Styling Guidelines
- Tailwind utility classes use करें
- Custom CSS केवल जरूरत पड़ने पर
- Consistent spacing और colors maintain करें

### Performance
- Images को Next.js Image component से optimize करें
- Dynamic imports use करें heavy components के लिए
- Loading states add करें better UX के लिए

---

## 🐛 Common Issues (आम समस्याएं)

### Port Already in Use
```bash
# अगर port 3000 already use में है
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Dependencies फिर से install करें
rm -rf node_modules
rm package-lock.json
npm install
```

### Styling Not Working
```bash
# Tailwind को rebuild करें
npm run dev
# और browser cache clear करें (Ctrl + Shift + R)
```

---

## 📚 Useful Commands (उपयोगी कमांड्स)

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code (if prettier is installed)
npm run format
```

---

## 🤝 Contributing (योगदान)

1. Fork करें repository को
2. नई branch बनाएं (`git checkout -b feature/amazing-feature`)
3. Changes commit करें (`git commit -m 'Add amazing feature'`)
4. Branch को push करें (`git push origin feature/amazing-feature`)
5. Pull Request खोलें

---

## 📞 Support (सहायता)

अगर कोई समस्या हो तो:
- GitHub Issues पर report करें
- Email करें: fmspathankot@gmail.com

---

## 📄 License

MIT License - आप इस project को freely use कर सकते हैं!

---

**Happy Coding! 🚀**
