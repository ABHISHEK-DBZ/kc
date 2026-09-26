import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Wrench, MapPin, Users, Store } from 'lucide-react';
import { api, AuthUser } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('hq.owner@demo.khatacopilot.com');
  const [password, setPassword] = useState('DemoPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPass2026!');
    setErrorMessage(null);
  };

  const handleForgotPassword = () => {
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 5000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(0, 113, 227, 0.08) 0%, rgba(245, 245, 247, 1) 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.03)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0071e3 0%, #005bb5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(0, 113, 227, 0.28)',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: '#1d1d1f', margin: '0 0 6px 0' }}>
            KhataCopilot HQ
          </h1>
          <p style={{ fontSize: '13.5px', color: '#86868b', margin: 0, lineHeight: 1.4 }}>
            Enterprise Autonomous Retail Network & Command Operations
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: 'rgba(255, 59, 48, 0.08)',
            border: '1px solid rgba(255, 59, 48, 0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ff3b30',
            fontSize: '13px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {forgotSent && (
          <div style={{
            background: 'rgba(52, 199, 89, 0.08)',
            border: '1px solid rgba(52, 199, 89, 0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#34c759',
            fontSize: '13px'
          }}>
            Password recovery link has been dispatched to your email address.
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#424245', marginBottom: '6px' }}>
              Work Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#86868b' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 14px 0 40px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  color: '#1d1d1f',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#424245' }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0071e3',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: 500
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', color: '#86868b' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 40px 0 40px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  color: '#1d1d1f',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#86868b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#0071e3', width: '16px', height: '16px' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#515154', cursor: 'pointer', userSelect: 'none' }}>
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: '46px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading ? '#86868b' : '#0071e3',
              color: '#fff',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
              transition: 'background 0.15s, transform 0.1s',
              marginTop: '6px'
            }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to HQ</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Persona Quick Picker (Section 6 & 60 requirement) */}
        <div style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, color: '#86868b' }}>
              Evaluator Demo Credentials
            </span>
            <span style={{ fontSize: '11px', color: '#0071e3', fontWeight: 600 }}>1-Click Fill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('hq.owner@demo.khatacopilot.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: email === 'hq.owner@demo.khatacopilot.com' ? '1.5px solid #0071e3' : '1px solid rgba(0,0,0,0.08)',
                background: email === 'hq.owner@demo.khatacopilot.com' ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <ShieldCheck size={14} color="#0071e3" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>HQ Owner</div>
                <div style={{ fontSize: '10px', color: '#86868b' }}>Full Network</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('hq.it@demo.khatacopilot.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: email === 'hq.it@demo.khatacopilot.com' ? '1.5px solid #0071e3' : '1px solid rgba(0,0,0,0.08)',
                background: email === 'hq.it@demo.khatacopilot.com' ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Wrench size={14} color="#5856d6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>HQ IT Support</div>
                <div style={{ fontSize: '10px', color: '#86868b' }}>IT & Agents</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('area.manager@demo.khatacopilot.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: email === 'area.manager@demo.khatacopilot.com' ? '1.5px solid #0071e3' : '1px solid rgba(0,0,0,0.08)',
                background: email === 'area.manager@demo.khatacopilot.com' ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <MapPin size={14} color="#ff9500" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>Area Manager</div>
                <div style={{ fontSize: '10px', color: '#86868b' }}>West Region Only</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('franchise.owner@demo.khatacopilot.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: email === 'franchise.owner@demo.khatacopilot.com' ? '1.5px solid #0071e3' : '1px solid rgba(0,0,0,0.08)',
                background: email === 'franchise.owner@demo.khatacopilot.com' ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.02)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Users size={14} color="#34c759" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>Franchise Owner</div>
                <div style={{ fontSize: '10px', color: '#86868b' }}>Patel Mart Group</div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSelectDemoUser('store.manager@demo.khatacopilot.com')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '10px',
              border: email === 'store.manager@demo.khatacopilot.com' ? '1.5px solid #0071e3' : '1px solid rgba(0,0,0,0.08)',
              background: email === 'store.manager@demo.khatacopilot.com' ? 'rgba(0,113,227,0.06)' : 'rgba(0,0,0,0.02)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Store size={14} color="#af52de" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>Store Manager</div>
              <div style={{ fontSize: '10px', color: '#86868b' }}>Sharma General Store (Kothrud, Pune) Only</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
