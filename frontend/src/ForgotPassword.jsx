import { useState } from 'react';
import FetchDAL from './FetchDAL';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('');

        const response = await FetchDAL.requestPasswordReset(email);
        setStatus(response.message);
        setIsSubmitting(false);
    };

    return (
        <div className="reset-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Enter your registered email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
                </button>
            </form>
            {status && <p className="status-message">{status}</p>}
        </div>
    );
}