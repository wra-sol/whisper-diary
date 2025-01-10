# 🎙️ Whisper Diary

A sleek, retro-futuristic web application that merges and processes transcription files from Whisper AI and Adobe Premiere, creating clean, formatted transcripts for your audio and video content.

![Whisper Diary Screenshot](screenshot.png)

## 🚀 Features

- **File Merging**: Combines Whisper AI transcriptions with Adobe Premiere timestamps
- **Multiple Export Formats**:
  - CSV with aligned timestamps and text
  - Markdown with timestamps
  - Clean Markdown (text only)
- **Modern UI**: Retro-futuristic design with animated particles and glowing effects
- **Error Handling**: Robust validation and informative error messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Framework**: [Remix](https://remix.run/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Typography**: Space Mono font
- **Container**: Docker support

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/whisper-diary.git
   cd whisper-diary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t whisper-diary .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 whisper-diary
   ```

## 📝 Usage

1. **Prepare Your Files**:
   - Export your Whisper AI transcription as CSV
   - Export your Adobe Premiere markers/timestamps as CSV

2. **Upload Files**:
   - Upload both files through the web interface
   - Click "Merge Transcripts"

3. **Download Results**:
   - Choose from three export formats:
     - CSV (with timestamps)
     - Markdown with timestamps
     - Clean Markdown (text only)

## 📄 File Format Requirements

### Whisper CSV
- Must contain transcription text
- One segment per row
- UTF-8 encoding

### Adobe Premiere CSV
- Must contain timestamp markers
- One marker per row
- Timestamps in standard format

## 🔧 Configuration

The application can be configured using environment variables:

```env
PORT=3000
NODE_ENV=production
```

## 🐳 Docker Configuration

The included Dockerfile provides:
- Multi-stage build process
- Production-optimized image
- Minimal footprint using Alpine Linux
- Proper security practices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Whisper AI](https://openai.com/research/whisper) by OpenAI
- [Adobe Premiere](https://www.adobe.com/products/premiere.html)
- [Remix](https://remix.run/) team
- [Tailwind CSS](https://tailwindcss.com/) team

## 🐛 Known Issues

- Large files (>100MB) may require increased memory allocation
- Some special characters in transcriptions may need manual review

## 📞 Support

For support, please:
1. Check the [Issues](https://github.com/yourusername/whisper-diary/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible about your setup and the problem
