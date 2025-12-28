# Support Centre

A compassionate website providing support services and resources for mental health, degenerative conditions, death, and loss.

## 🌿 Overview

Support Centre is a single-page website designed to connect people with vital support resources during life's most challenging moments. The site aggregates information from trusted organizations and pulls live content from RSS feeds.

## ✨ Features

- **Crisis Support Banner** - Immediate access to emergency helpline numbers
- **Mental Health Resources** - Links to Mind, Mental Health Foundation, HelpGuide, and Beyond Blue
- **Grief & Loss Support** - Resources from Cruse Bereavement, Marie Curie, What's Your Grief, and Samaritans
- **Degenerative Conditions** - Support from Alzheimer's Society, Parkinson's UK, MND Association, and MS Society
- **Live RSS Feed** - Automatically fetches latest articles from grief and mental health sources
- **Comprehensive Resource Directory** - Accordion-style list of additional support services
- **Self-Care Tips** - Evidence-based wellbeing suggestions
- **Mobile Responsive** - Works on all devices

## 🔗 RSS Feed Sources

The site pulls live content from:
- [What's Your Grief](https://whatsyourgrief.com/feed/) - Grief support and education

## 📱 Support Organizations Featured

### Mental Health
- Mind (UK) - www.mind.org.uk
- Mental Health Foundation - www.mentalhealth.org.uk
- HelpGuide - www.helpguide.org
- Beyond Blue (Australia) - www.beyondblue.org.au

### Grief & Loss
- Cruse Bereavement Support - www.cruse.org.uk
- Marie Curie - www.mariecurie.org.uk
- What's Your Grief - whatsyourgrief.com
- Samaritans - www.samaritans.org

### Degenerative Conditions
- Alzheimer's Society - www.alzheimers.org.uk
- Parkinson's UK - www.parkinsons.org.uk
- MND Association - www.mndassociation.org
- MS Society - www.mssociety.org.uk

### Crisis Lines (UK)
- Samaritans: 116 123 (24/7, free)
- NHS Mental Health: 111
- Mind: 0300 123 3393
- Cruse: 0808 808 1677

## 🛠 Technical Details

### Structure
```
supportcentre/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── main.js         # JavaScript functionality
└── README.md           # This file
```

### Technologies Used
- HTML5
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter, Playfair Display)
- RSS2JSON API for RSS feed parsing

### Features
- Responsive design (mobile-first approach)
- Smooth scroll navigation
- Accordion components for resource lists
- RSS feed integration with fallback content
- Intersection Observer for scroll animations
- Accessible design with ARIA labels

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in a web browser
3. No build process required - it's a static site

### Local Development
Simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve
```

## 📝 Customization

### Adding New Resources
Edit `index.html` to add new resource cards in the appropriate section.

### Modifying RSS Feeds
Edit the `feeds` array in `js/main.js`:
```javascript
const feeds = [
    {
        url: 'https://example.com/feed/',
        name: 'Feed Name'
    }
];
```

### Styling
All styles are in `css/styles.css`. Key variables are defined at the top:
```css
:root {
    --primary-color: #2d5a4a;
    --secondary-color: #7eb5a6;
    /* ... */
}
```

## ⚠️ Disclaimer

This website provides information only and is not a substitute for professional medical advice, diagnosis, or treatment. If you're in crisis, please contact emergency services or one of the helplines listed on the site.

## 📄 License

This project is open source. Feel free to use and modify for non-commercial purposes.

---

*"You are not alone. Help is available."*
