import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FetchDAL from './FetchDAL';

export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const response = await FetchDAL.updatePassword(newPassword);
        
        if (response.success) {
            navigate('/login', { 
                state: { message: "Password updated successfully! Please log in." }
            });
        } else {
            setError(response.error || "Failed to update password. Link may have expired.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="update-container">
            <h2>Enter New Password</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="New Password (min 6 characters)"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    minLength="6"
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Save Password'}
                </button>
            </form>
            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}