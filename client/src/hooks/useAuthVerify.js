import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuthVerify(role) {
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userKey = role; // 'student', 'manager', or 'admin'
        const userData = localStorage.getItem(userKey);
        
        if (!token || !userData) throw new Error();

        const response = await fetch(`http://localhost:3001/${role}s/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();
      } catch (err) {
        localStorage.clear();
        navigate(`/login/${role}`);
      }
    };

    verify();
  }, [navigate, role]);
}