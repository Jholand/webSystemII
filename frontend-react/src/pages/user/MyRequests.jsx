import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new service requests page
    navigate('/user/requests', { replace: true });
  }, [navigate]);

  return null;
};

export default MyRequests;
