import streamlit as st
import PyPDF2
from docx import Document
import io
from transformers import pipeline
import tempfile
import os

# Page configuration
st.set_page_config(
    page_title="Document Summarizer",
    page_icon="📄",
    layout="wide"
)

# Initialize summarization pipeline
@st.cache_resource
def load_summarizer():
    """Load the summarization model"""
    try:
        # Using a smaller, faster model for better performance
        summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=-1  # Use CPU (-1) or GPU (0) if available
        )
        return summarizer
    except Exception as e:
        st.error(f"Error loading summarization model: {e}")
        return None

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {e}")
        return None

def extract_text_from_docx(file):
    """Extract text from Word document"""
    try:
        doc = Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading Word document: {e}")
        return None

def extract_text_from_txt(file):
    """Extract text from text file"""
    try:
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                file.seek(0)  # Reset file pointer
                return file.read().decode(encoding)
            except UnicodeDecodeError:
                continue
        return None
    except Exception as e:
        st.error(f"Error reading text file: {e}")
        return None

def extract_text(file, file_type):
    """Extract text based on file type"""
    if file_type == "application/pdf":
        return extract_text_from_pdf(file)
    elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return extract_text_from_docx(file)
    elif file_type == "text/plain":
        return extract_text_from_txt(file)
    else:
        st.error(f"Unsupported file type: {file_type}")
        return None

def chunk_text(text, max_length=1024):
    """Split text into chunks that fit the model's max length"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        word_length = len(word) + 1  # +1 for space
        if current_length + word_length > max_length:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = word_length
        else:
            current_chunk.append(word)
            current_length += word_length
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks

def summarize_text(text, summarizer, max_length=130, min_length=30):
    """Summarize text using the loaded model"""
    if not text or len(text.strip()) < 50:
        return "Text is too short to summarize."
    
    # Chunk the text if it's too long
    chunks = chunk_text(text, max_length=1024)
    summaries = []
    
    for chunk in chunks:
        if len(chunk.strip()) < 50:
            continue
        try:
            summary = summarizer(
                chunk,
                max_length=max_length,
                min_length=min_length,
                do_sample=False
            )
            summaries.append(summary[0]['summary_text'])
        except Exception as e:
            st.warning(f"Error summarizing chunk: {e}")
            continue
    
    # Combine summaries
    if summaries:
        combined_summary = " ".join(summaries)
        # If combined summary is still too long, summarize it again
        if len(combined_summary.split()) > 200:
            try:
                final_summary = summarizer(
                    combined_summary,
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False
                )
                return final_summary[0]['summary_text']
            except:
                return combined_summary
        return combined_summary
    else:
        return "Unable to generate summary."

# Main app
def main():
    st.title("📄 Document Summarizer")
    st.markdown("Upload a document (PDF, Word, or Text) and get an AI-powered summary")
    
    # Load summarizer
    with st.spinner("Loading summarization model..."):
        summarizer = load_summarizer()
    
    if summarizer is None:
        st.error("Failed to load summarization model. Please check your installation.")
        st.stop()
    
    # File uploader
    uploaded_file = st.file_uploader(
        "Choose a file",
        type=['pdf', 'docx', 'txt'],
        help="Supported formats: PDF, Word (.docx), and Text files"
    )
    
    if uploaded_file is not None:
        # Display file info
        col1, col2 = st.columns(2)
        with col1:
            st.info(f"**File name:** {uploaded_file.name}")
        with col2:
            st.info(f"**File size:** {uploaded_file.size / 1024:.2f} KB")
        
        # Extract text
        with st.spinner("Extracting text from document..."):
            text = extract_text(uploaded_file, uploaded_file.type)
        
        if text:
            # Display extracted text (collapsible)
            with st.expander("View extracted text"):
                st.text_area("Text content", text, height=200, disabled=True)
            
            # Summarization parameters
            st.subheader("Summary Settings")
            col1, col2 = st.columns(2)
            with col1:
                max_length = st.slider(
                    "Maximum summary length",
                    min_value=50,
                    max_value=250,
                    value=130,
                    help="Maximum number of words in the summary"
                )
            with col2:
                min_length = st.slider(
                    "Minimum summary length",
                    min_value=10,
                    max_value=100,
                    value=30,
                    help="Minimum number of words in the summary"
                )
            
            # Generate summary
            if st.button("Generate Summary", type="primary"):
                with st.spinner("Generating summary..."):
                    summary = summarize_text(text, summarizer, max_length, min_length)
                
                # Display summary
                st.subheader("📝 Summary")
                st.success(summary)
                
                # Download summary option
                st.download_button(
                    label="Download Summary",
                    data=summary,
                    file_name=f"{uploaded_file.name}_summary.txt",
                    mime="text/plain"
                )
        else:
            st.error("Failed to extract text from the document. Please try another file.")

if __name__ == "__main__":
    main()

