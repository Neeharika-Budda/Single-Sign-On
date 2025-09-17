import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginApi,
  registerApi,
  logoutApi,
  checkApi,
  refreshApi,
} from '../api/fetcher.js';
import { io } from 'socket.io-client';
import { BASE } from '../api/fetcher.js'; // export BASE from fetcher



const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const CLIENT_ID      = 'B';
  const IDLE_LIMIT_MS  =  15 * 60 * 1000;   
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

  // initial token check
  useEffect(() => {
    (async () => {
      try {
        const { name, email, id } = await checkApi();
        setUser({ id, name, email });

      } catch {
        // maybe try silent refresh
        try {
          await refreshApi();
          const data = await checkApi();
          setUser(data);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (loading) return; // wait for initial auth check to finish

  //   const id = setInterval(async () => {
  //     try {
  //       const data = await checkApi();
  //       setUser(data);
  //     } catch {
  //       setUser(null);
  //     }
  //   }, 15000); // poll every 15 seconds
  //   return () => clearInterval(id); // cleanup
  // }, [loading]);


  useEffect(() => {
    if (!user) return; 

    let idleTimer = startIdleTimer();

    // reset timer on any user activity
    const reset = () => {
      clearTimeout(idleTimer);
      idleTimer = startIdleTimer();
    };

    activityEvents.forEach(evt => window.addEventListener(evt, reset));

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach(evt => window.removeEventListener(evt, reset));
    };
  }, [user]);

  useEffect(() => {
  // open socket the moment we have a logged‑in user
  if (user && !socket) {
    const s = io(BASE, { withCredentials: true });

    s.on('connect', () => console.log('🔗 WS connected', s.id));

    s.on('force-logout', async () => {
      console.log('⛔ force‑logout received');
      await logout();              // reuse existing logout
    });

    setSocket(s);
  }

  // cleanup if user logs out
  if (!user && socket) {
    socket.disconnect();
    setSocket(null);
  }
}, [user, socket]);

  function startIdleTimer() {
    return setTimeout(async () => {
      try {
        await logoutApi({ client: CLIENT_ID });
      } finally {
        setUser(null);          
      }
    }, IDLE_LIMIT_MS);
  }


  async function login(email, password) {
    const client = 'B';
    const data = await loginApi({ email, password, client });
    setUser(data.user);
  }

  async function register(name, email, password) {
    await registerApi({ name, email, password });
  }

  async function logout() {
    const client = 'B';
    try {
      await logoutApi({ client });
    } catch (err) {
      if (err.message !== 'Unauthorized') {
        console.error('Logout error:', err);
      }
    } finally {
      setUser(null);
    }
  }

  const value = { user, login, register, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
