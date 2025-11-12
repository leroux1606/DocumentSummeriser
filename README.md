# Document Summarizer

A Streamlit-based web application that allows you to upload documents (PDF, Word, or Text files) and get AI-powered summaries using transformer models.

## Features

- 📄 Support for multiple document formats:
  - PDF files (.pdf)
  - Word documents (.docx)
  - Text files (.txt)
- 🤖 AI-powered summarization using Facebook's BART model
- ⚙️ Customizable summary length (min/max words)
- 📥 Download summaries as text files
- 👀 View extracted text before summarization

## Installation

1. **Clone or navigate to this repository**

2. **Install dependencies using pnpm** (Note: For Python projects, use pip instead):
   ```bash
   pip install -r requirements.txt
   ```

   Or if you prefer using a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## Usage

1. **Start the Streamlit app**:
   ```bash
   streamlit run app.py
   ```

2. **Open your browser** - Streamlit will automatically open the app (usually at `http://localhost:8501`)

3. **Upload a document** using the file uploader

4. **Adjust summary settings** (optional):
   - Maximum summary length (50-250 words)
   - Minimum summary length (10-100 words)

5. **Click "Generate Summary"** to get your AI-powered summary

6. **Download the summary** if needed using the download button

## How It Works

1. **Text Extraction**: The app extracts text from your uploaded document based on its format:
   - PDFs: Uses PyPDF2 to extract text from each page
   - Word documents: Uses python-docx to read paragraphs
   - Text files: Reads directly with UTF-8 encoding support

2. **Text Processing**: Long documents are automatically chunked to fit the model's input requirements

3. **Summarization**: Uses Facebook's BART-large-CNN model, which is specifically fine-tuned for summarization tasks

4. **Result Display**: Shows the summary and allows you to download it

## Requirements

- Python 3.8 or higher
- See `requirements.txt` for all dependencies

## Notes

- The first run will download the BART model (~1.6GB), which may take a few minutes
- Large documents may take longer to process
- The model runs on CPU by default. For faster processing, ensure PyTorch with CUDA support is installed for GPU acceleration

## Troubleshooting

- **Model download issues**: Ensure you have a stable internet connection for the first run
- **Memory errors**: Try processing smaller documents or reduce the summary length
- **File reading errors**: Ensure your document is not corrupted and is in a supported format

## License

This project is open source and available for personal and commercial use.

