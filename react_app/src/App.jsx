import React, { useState, useRef } from "react";

const App = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setResult(null); // Reset the result when a new file is uploaded
    setError(null); // Clear previous errors

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error occurred.");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message); // Show error message in UI
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Breast Cancer Detection</h1>
        <p>Upload an image to get a prediction about the skin cancer type.</p>
      </header>

      <main>
        <div style={styles.uploadSection}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={styles.input}
            aria-label="Upload an image"
          />
          {preview && (
            <div style={styles.imagePreview}>
              <h3>Image Preview:</h3>
              <img src={preview} alt="Preview" style={styles.previewImage} />
              <div style={styles.buttonContainer}>
                <button
                  onClick={handleRemoveImage}
                  style={styles.removeButton}
                  aria-label="Remove image"
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  style={styles.button}
                  disabled={!file || loading}
                  aria-label="Upload and predict"
                >
                  {loading ? "Processing..." : "Upload and Predict"}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={styles.errorMessage}>
            <p>Error: {error}</p>
          </div>
        )}

        {result && (
          <div style={styles.resultSection}>
            <h2>Prediction Result</h2>
            <div style={styles.resultCard}>
              <p>
                <strong>Class:</strong> {result.class}
              </p>
              <p>
                <strong>Confidence:</strong> {result.confidence.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
  },
  header: {
    marginBottom: "20px",
  },
  uploadSection: {
    marginBottom: "20px",
  },
  input: {
    marginBottom: "10px",
  },
  imagePreview: {
    margin: "20px 0",
  },
  previewImage: {
    width: "100%",
    maxWidth: "300px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  removeButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  errorMessage: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #f44336",
    backgroundColor: "#fdecea",
    color: "#f44336",
    borderRadius: "8px",
  },
  resultSection: {
    marginTop: "20px",
  },
  resultCard: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
};

export default App;