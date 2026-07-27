import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import ErrorPopup from './PopUps/ErrorPopUp';

export default function InviteUser({ isOpen, onClose, onInviteUser }) {
    const [manualEmail, setManualEmail] = useState('');
    const [csvEmails, setCsvEmails] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    
    // Error Popup State
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const fileInputRef = useRef(null);

    // --- STRICT EMAIL VALIDATION REGEX ---
    // Only allows standard email characters, inherently blocking XSS/SQL injection scripts
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    const showError = (message) => {
        setErrorMessage(message);
        setIsErrorOpen(true);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Security: Check MIME type and extension
        const isValidMimeType = file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';
        const isValidExtension = file.name.toLowerCase().endsWith('.csv');

        if (!isValidMimeType && !isValidExtension) {
            showError("Security Alert: Only valid .csv files are permitted.");
            handleRemoveFile(); 
            return;
        }

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            // Parse CSV text and rigidly enforce the strict email regex
            const extracted = text
                .split(/[\s,]+/)
                .filter(email => emailRegex.test(email)); // <-- Updated security check
            
            if (extracted.length === 0) {
                showError("No valid email addresses were found in the uploaded file.");
                handleRemoveFile();
                return;
            }

            setCsvEmails(extracted);
        };
        reader.readAsText(file);
    };

    const handleRemoveFile = () => {
        setCsvEmails([]);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };

    const handleSubmit = async () => {
        const allEmails = [...csvEmails];
        
        // Process manually typed emails with strict validation
        if (manualEmail.trim()) {
            const manualExtracted = manualEmail
                .split(/[\s,]+/)
                .filter(email => email.trim() !== ''); // Clear out blank spaces

            for (const email of manualExtracted) {
                if (!emailRegex.test(email)) {
                    showError(`Invalid format detected: "${email}". Please enter a valid email address.`);
                    return; // Stop the entire submission if malicious/invalid code is detected
                }
            }
            allEmails.push(...manualExtracted);
        }

        const uniqueEmails = [...new Set(allEmails)];

        if (uniqueEmails.length === 0) {
            showError("Please enter a valid email address or upload a CSV containing emails.");
            return;
        }

        setIsInviting(true);

        try {
            for (const email of uniqueEmails) {
                await onInviteUser(email); 
            }
        } catch (error) {
            showError("An error occurred while sending invitations. Please try again.");
        }

        setIsInviting(false);
        setManualEmail('');
        handleRemoveFile();
        onClose(); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Invite to Workspace</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Type an email address or upload a CSV file for mass invitations.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. philip@example.com"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Upload CSV File
                        </label>
                        
                        <input 
                            type="file" 
                            accept=".csv" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden" 
                            id="csv-upload"
                        />

                        {fileName ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="text-blue-600 flex-shrink-0" size={24} />
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-bold text-blue-900 truncate">{fileName}</span>
                                        <span className="text-xs text-blue-600 font-medium">{csvEmails.length} valid emails found</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleRemoveFile}
                                    className="p-2 text-blue-400 hover:text-red-500 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                                    title="Remove file"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <label 
                                htmlFor="csv-upload"
                                className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-500 hover:bg-blue-50 focus:outline-none"
                            >
                                <span className="flex items-center space-x-2">
                                    <UploadCloud className="text-gray-400" size={24} />
                                    <span className="font-medium text-gray-600">
                                        Click to browse files
                                    </span>
                                </span>
                                <span className="mt-1 text-xs text-gray-400">CSV files only</span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={() => {
                            setManualEmail('');
                            handleRemoveFile();
                            onClose();
                        }}
                        disabled={isInviting}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isInviting || (!manualEmail && csvEmails.length === 0)}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isInviting ? 'Sending Invites...' : 'Send Invites'}
                    </button>
                </div>
                
                <ErrorPopup 
                    isOpen={isErrorOpen} 
                    message={errorMessage} 
                    onClose={() => setIsErrorOpen(false)} 
                />
            </div>
        </div>
    );
}