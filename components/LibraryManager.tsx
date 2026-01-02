import React, { useState, useEffect } from 'react';
import { LibraryDocument, LibraryCategory } from '../types';
import { createPDFBlobFromText } from '../utils/pdfGenerator';
import { DEFAULT_EXAMS } from '../data/defaultExams';

const LibraryManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('Past Papers');
  const [userDocuments, setUserDocuments] = useState<LibraryDocument[]>([]);
  const [defaultDocuments, setDefaultDocuments] = useState<LibraryDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LibraryDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for the PDF Blob URL to prevent "Blocked by Chrome"
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Load User Docs from LocalStorage
  useEffect(() => {
    try {
      const storedDocs = localStorage.getItem('zimed_library');
      if (storedDocs) {
        setUserDocuments(JSON.parse(storedDocs));
      }
    } catch (err) {
      console.error("Failed to load user library", err);
    }
  }, []);

  // Save User Docs to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('zimed_library', JSON.stringify(userDocuments));
    } catch (err) {
      setError("Storage full! Unable to save more files locally. Please delete some old files.");
    }
  }, [userDocuments]);

  // Load Default Docs (Generate PDFs on fly or once)
  useEffect(() => {
    const generateDefaults = async () => {
        const docs: LibraryDocument[] = DEFAULT_EXAMS.map((exam, index) => {
            // We store a placeholder here. The actual Blob will be generated when needed or eagerly if small.
            // For simplicity and performance, let's generate the blob URLs now.
            // Note: Blob URLs are session-specific.
            const blob = createPDFBlobFromText(exam.title, exam.content);
            const reader = new FileReader();
            
            // We need a synchronous way or wait.
            // Actually, createPDFBlobFromText returns a Blob. We can use URL.createObjectURL(blob).
            // But we need to fit the LibraryDocument interface which expects dataUrl for user docs.
            // We will add a 'isDefault' flag to LibraryDocument and handle it.
            // For now, let's just use the blob directly if we modify the interface, or convert to base64.
            // Base64 is heavy. Let's use a temporary ID and generate the URL when selected.
            
            return {
                id: `default-${index}`,
                name: exam.title,
                category: 'Past Papers', // All defaults go here as per prompt
                uploadDate: 'System',
                dataUrl: '', // Will hold the raw content in a special property or generate on fly
                size: '20 KB',
                type: 'application/pdf',
                isDefault: true,
                // Internal property to hold content for generation
                _content: exam.content 
            } as any;
        });
        setDefaultDocuments(docs);
    };
    generateDefaults();
  }, []);

  // Handle PDF Preview URL generation
  useEffect(() => {
    // Revoke previous URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }

    if (selectedDoc) {
      if (selectedDoc.isDefault) {
          // Generate PDF on the fly for default docs
          const content = (selectedDoc as any)._content;
          const blob = createPDFBlobFromText(selectedDoc.name, content);
          const url = URL.createObjectURL(blob);
          setPdfPreviewUrl(url);
      } else {
          // User uploaded docs (Base64)
          const isPdf = selectedDoc.type === 'application/pdf' || selectedDoc.name.toLowerCase().endsWith('.pdf');
          if (isPdf) {
            try {
              const parts = selectedDoc.dataUrl.split(',');
              const base64 = parts.length > 1 ? parts[1] : parts[0];
              const byteCharacters = atob(base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              setPdfPreviewUrl(url);
            } catch (e) {
              console.error("Error creating PDF blob", e);
              setPdfPreviewUrl(null);
            }
          }
      }
    }
    
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [selectedDoc]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    let errorMsg = "";

    const readFile = (file: File): Promise<LibraryDocument | null> => {
      return new Promise((resolve) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!allowedExtensions.includes(ext)) {
             console.warn(`Skipping ${file.name}: Invalid extension`);
             resolve(null); 
             return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
           errorMsg = "Some files were skipped because they exceed 5MB.";
           resolve(null);
           return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            category: activeCategory,
            uploadDate: new Date().toLocaleDateString(),
            dataUrl: result,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type || 'application/octet-stream',
            isDefault: false
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    };

    try {
      const promises = Array.from(files).map(file => readFile(file as File));
      const results = await Promise.all(promises);
      const validResults = results.filter((doc): doc is LibraryDocument => doc !== null);
      
      if (validResults.length > 0) {
        setUserDocuments(prev => [...prev, ...validResults]);
      } else if (!errorMsg) {
          setError("No valid files uploaded. Allowed: PDF, Word, Excel. Max 5MB.");
      }
      if (errorMsg) setError(errorMsg);

    } catch (e) {
      setError("Error processing files.");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = (doc: LibraryDocument) => {
     if (doc.isDefault && pdfPreviewUrl) {
         // For default docs, use the generated blob URL
         const link = document.createElement('a');
         link.href = pdfPreviewUrl;
         link.download = `${doc.name}.pdf`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     } else {
         // For user docs
         const link = document.createElement('a');
         link.href = doc.dataUrl;
         link.download = doc.name;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      const updated = userDocuments.filter(d => d.id !== id);
      setUserDocuments(updated);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    }
  };

  const getFileIcon = (doc: LibraryDocument) => {
    // Defaults are always PDF
    if (doc.isDefault) return <i className="fas fa-file-pdf text-red-600 text-lg"></i>;

    const name = doc.name.toLowerCase();
    const type = doc.type.toLowerCase();
    if (type.includes('pdf') || name.endsWith('.pdf')) return <i className="fas fa-file-pdf text-red-600 text-lg"></i>;
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return <i className="fas fa-file-word text-blue-600 text-lg"></i>;
    if (type.includes('sheet') || type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return <i className="fas fa-file-excel text-green-600 text-lg"></i>;
    return <i className="fas fa-file text-gray-400 text-lg"></i>;
  };

  const isPdfDoc = (doc: LibraryDocument) => {
      return doc.isDefault || doc.type === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
  };

  // Merge lists for display based on category
  const getDisplayDocuments = () => {
      const userFiltered = userDocuments.filter(doc => doc.category === activeCategory);
      // Defaults only appear in Past Papers for now
      if (activeCategory === 'Past Papers') {
          return [...defaultDocuments, ...userFiltered];
      }
      return userFiltered;
  };

  const displayDocs = getDisplayDocuments();

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-3 rounded-full bg-teal-100 text-teal-700 mb-4">
          <i className="fas fa-book-reader text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Resource Library</h2>
        <p className="text-gray-600 mt-2">Store, view, and print your teaching materials.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        
        {/* Sidebar / List View */}
        <div className="lg:w-1/3 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden h-[600px] lg:h-auto">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveCategory('Past Papers')}
              className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeCategory === 'Past Papers' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className="fas fa-history mr-2"></i> Past Papers
            </button>
            <button
              onClick={() => setActiveCategory('Textbooks')}
              className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeCategory === 'Textbooks' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className="fas fa-book mr-2"></i> Textbooks
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <label className="flex flex-col items-center px-4 py-4 bg-white text-teal-600 rounded-lg shadow-sm tracking-wide uppercase border border-teal-200 cursor-pointer hover:bg-teal-50 transition-colors">
                <i className="fas fa-cloud-upload-alt text-2xl mb-1"></i>
                <span className="text-xs font-bold leading-normal">{uploading ? 'Uploading...' : `Upload to ${activeCategory}`}</span>
                <input 
                  type='file' 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.doc,.docx,.xls,.xlsx" 
                  onChange={handleFileUpload} 
                  disabled={uploading} 
                />
            </label>
            <p className="text-xs text-gray-400 text-center mt-2">Allowed: PDF, Word, Excel (Max 5MB)</p>
            {error && <p className="text-red-500 text-xs mt-2 text-center font-semibold">{error}</p>}
          </div>

          {/* Document List */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-2">
            {displayDocs.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 p-4">
                <i className="fas fa-folder-open text-4xl mb-2 opacity-50"></i>
                <p>No documents in this folder.</p>
              </div>
            ) : (
              displayDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center justify-between group ${selectedDoc?.id === doc.id ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center overflow-hidden">
                    <div className="w-10 h-10 rounded flex items-center justify-center mr-3 flex-shrink-0 bg-gray-50">
                      {getFileIcon(doc)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate" title={doc.name}>{doc.name}</h4>
                      <p className="text-xs text-gray-500">
                          {doc.isDefault ? <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-[10px] mr-1">SYSTEM</span> : null}
                          {doc.uploadDate} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                        className="text-gray-300 hover:text-blue-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      {!doc.isDefault && (
                        <button 
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Viewer Area */}
        <div className="lg:w-2/3 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden flex flex-col h-[600px] lg:h-auto">
          {selectedDoc ? (
            <>
              <div className="bg-gray-900 text-white p-3 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center min-w-0">
                  <div className="mr-3">{getFileIcon(selectedDoc)}</div>
                  <span className="font-medium truncate max-w-xs">{selectedDoc.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-400 hidden md:inline">{selectedDoc.category}</span>
                  <button 
                    onClick={() => handleDownload(selectedDoc)}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded flex items-center"
                  >
                    <i className="fas fa-download mr-1"></i> Download
                  </button>
                </div>
              </div>
              
              <div className="flex-grow bg-gray-200 relative flex flex-col">
                 {/* PDF Viewer */}
                 {isPdfDoc(selectedDoc) && pdfPreviewUrl ? (
                    <div className="w-full h-full flex flex-col">
                        <iframe 
                            src={pdfPreviewUrl} 
                            className="w-full flex-grow" 
                            title="PDF Viewer"
                        />
                        <div className="bg-gray-700 p-2 text-center text-xs text-gray-300 border-t border-gray-600">
                            Having trouble viewing? <a href={pdfPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline font-bold">Open in new tab</a>
                        </div>
                    </div>
                 ) : (
                    /* Fallback for Word/Excel or if PDF fails */
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-600 p-10 bg-gray-100">
                        <div className="mb-4 text-6xl opacity-50">
                            {getFileIcon(selectedDoc)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Preview Not Available</h3>
                        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
                            This file format cannot be viewed directly in the app. Please download it to view.
                        </p>
                        <button 
                            onClick={() => handleDownload(selectedDoc)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-transform hover:scale-105"
                        >
                            <i className="fas fa-download mr-2"></i> Download File
                        </button>
                    </div>
                 )}
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500 p-10">
              <i className="fas fa-book-reader text-6xl mb-4 opacity-50"></i>
              <h3 className="text-xl font-bold text-gray-400">Document Viewer</h3>
              <p className="text-sm">Select a document from the library to view or download.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LibraryManager;