# Smart Faculty Attendance System (SVPCET) 🎓⚡

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=for-the-badge&logo=github)](https://koneti-kalyan.github.io/Smart-Faculty-Attendance/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A modern, high-fidelity AI-powered facial biometric and GPS geofenced attendance system prototype designed for **Sri Venkatesa Perumal College of Engineering & Technology (SVPCET)** faculty members.

![Smart Faculty Attendance Preview](https://img.shields.io/badge/UI%20Design-Glassmorphism%20%26%20Android%20SDK%2034-00F2FE?style=for-the-badge)

---

## 🌟 Key Features

- 👁️ **Biometric Face Scan Engine**: Live real-time webcam integration with Canvas facial landmark mesh overlays, scanning laser beam animations, distance detection, and dynamic confidence score computation.
- 📍 **GPS Geofencing Integration**: Real-time geolocation check powered by Leaflet.js interactive maps to verify faculty attendance within campus radius boundaries.
- 📱 **Interactive Android UI Frame**: High-resolution mobile simulator interface alongside full desktop control simulation panel.
- 📊 **Faculty Dashboard & Analytics**: Displays real-time status badges, daily check-in/out timestamps, monthly logs, and percentage rings.
- 📅 **Interactive Attendance Logs**: Complete calendar and filterable history logs with built-in **CSV Export** functionality.
- 🔔 **Audio & Visual Cues**: Synthesized sound effects and haptic visual feedback on successful biometric check-ins and check-outs.
- ⚙️ **Simulation Controls**: Live test controls to simulate lighting conditions, distance warnings, force match/mismatch states, and campus vs. remote GPS positions.

---

## 🚀 Live Demo

Access the live web application on GitHub Pages:  
👉 **[https://koneti-kalyan.github.io/Smart-Faculty-Attendance/](https://koneti-kalyan.github.io/Smart-Faculty-Attendance/)**

---

## 💻 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design Tokens, Glassmorphism, Responsive Grid/Flexbox), Vanilla ES6 JavaScript
- **Mapping & Geofencing**: [Leaflet.js](https://leafletjs.com/) v1.9.4
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Typography**: Google Fonts (*Outfit* & *Plus Jakarta Sans*)

---

## 🛠️ Local Development & Testing

### Option 1: Static Web Server (Recommended)
You can directly open `index.html` in any modern web browser or serve it using Node.js:

```bash
# Run the built-in HTTP server
node server.js
```

Then visit `http://localhost:8080` in your web browser.

### Option 2: Live Server Extension
Open the repository folder in VS Code and launch using the **Live Server** extension.

---

## 🌐 GitHub Pages Deployment Guide

If deploying from your own repository, follow these quick steps:

1. Push code to the `main` branch of your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy Smart Faculty Attendance System"
   git push -u origin main
   ```
2. Navigate to your GitHub repository in your browser.
3. Click on **Settings** > **Pages** (under Code and automation).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` and folder `/ (root)`
5. Click **Save**.
6. Wait 1–2 minutes, and your site will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ for **SVPCET (Sri Venkatesa Perumal College of Engineering & Technology)**.
