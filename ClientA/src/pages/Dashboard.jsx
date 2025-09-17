import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Clock, Shield, CheckCircle, XCircle, Server, Key, Globe, ArrowRight, Cookie, Lock, UserPlus, Mail, LogIn, RefreshCw, AlertCircle, LogOut } from 'lucide-react';

// ---------- tiny helpers ----------
const BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const api = (path) => fetch(`${BASE}${path}`, { credentials: 'include' });

// Timeline item
const TimelineItem = ({ action, client, time }) => (
  <div className="flex items-start space-x-3 py-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
    <div>
      <p className="text-sm text-gray-900">
        {action} from Client{client}
      </p>
      <p className="text-xs text-gray-500">
        {new Date(time).toLocaleString()}
      </p>
    </div>
  </div>
);

// Client badge
const ClientBadge = ({ name, active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
    {active ? (
      <CheckCircle className="w-3 h-3 mr-1" />
    ) : (
      <XCircle className="w-3 h-3 mr-1" />
    )}
    {name}
  </span>
);

function SSOFlowDiagram() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Globe className="w-5 h-5 mr-2 text-blue-600" />
        How SSO Works (Visual Flow)
      </h3>
      
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">You login once to MySSOproject</p>
            <p className="text-xs text-gray-600">Enter username/password → Server validates credentials</p>
          </div>
          <Key className="w-4 h-4 text-blue-500" />
        </div>

        {/* Step 2 */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">2</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Server creates tokens & cookies</p>
            <p className="text-xs text-gray-600">AccessToken (15min) + RefreshToken (7days) stored in browser</p>
          </div>
          <Cookie className="w-4 h-4 text-green-500" />
        </div>

        {/* Step 3 */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">3</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Access ClientA & ClientB automatically</p>
            <p className="text-xs text-gray-600">Browser sends tokens → No re-login needed!</p>
          </div>
          <Shield className="w-4 h-4 text-purple-500" />
        </div>
      </div>
    </div>
  );
}

// Workflow Steps Component
function WorkflowSteps() {
  const steps = [
    {
      icon: UserPlus,
      title: "Register",
      description: "Enter name, email, password",
      detail: "Get verification link by email",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Mail,
      title: "Verify Email",
      description: "Click the link",
      detail: "Account marked 'verified'",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: LogIn,
      title: "Login",
      description: "Enter credentials",
      detail: "Get accessToken (15 min) + refreshToken (7 days)",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Globe,
      title: "Access App",
      description: "Use access token to interact",
      detail: "Auto-refresh token when expired",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: AlertCircle,
      title: "Forgot Password",
      description: "Enter email → Get reset link",
      detail: "Set new password",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: LogOut,
      title: "Logout (SSO)",
      description: "Logs out from all clients",
      detail: "Tokens are invalidated",
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <ArrowRight className="w-5 h-5 mr-2 text-slate-600" />
        🧠 Authentication Workflow Steps
      </h3>
      
      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-gray-600 mb-1">{step.description}</p>
                <p className="text-xs text-gray-500">{step.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center`}>
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <h4 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-gray-600 mb-1">{step.description}</p>
              <p className="text-xs text-gray-500">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>SSO Magic:</strong> Once you complete steps 1-3, you can access multiple apps (ClientA, ClientB) without logging in again!
        </p>
      </div>
    </div>
  );
}

// ---------- main dashboard ----------
export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [clients, setClients] = useState({ A: false, B: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const logsRes    = await api('/api/auth/logs');
        const clientsRes = await api('/api/auth/clients');

        if (logsRes.ok)    setLogs((await logsRes.json()).slice(0, 5));
        if (clientsRes.ok) setClients(await clientsRes.json());
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'friend'} to My SSO Project</h1>
   <h2 className="text-xl font-bold">This is your Client A</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* timeline */}
        <section className="bg-white border rounded-lg p-6">
          <header className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </header>

          {logs.length ? (
            logs
            .slice(0, 3) 
            .map((l) => (
            <TimelineItem key={l._id} {...l} />
           ))
         ) : (
         <p className="text-sm text-gray-500">No recent activity</p>
        )}
       </section>

        {/* client status */}
        <section className="bg-white border rounded-lg p-6">
          <header className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Client Sessions</h2>
          </header>

          <div className="space-y-3">
            <ClientBadge name="Client A" active={clients.A} />
            <ClientBadge name="Client B" active={clients.B} />
          </div>
        </section>
      </div>

    
   <div className="space-y-6">
        <SSOFlowDiagram />

        <WorkflowSteps />
      </div>
    </div>
  );
}
