import React, { useState } from 'react';
import { 
  MessagesSquare, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  ExternalLink,
  Search,
  BookOpen,
  Send
} from 'lucide-react';
import { Shop, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface SupportAgentViewProps {
  shops: Shop[];
  findings: AgentFinding[];
  tasks: AgentTask[];
  runs: AgentRun[];
  settings: Record<string, any>;
  onRunAgent: () => void;
  isRunning: boolean;
  runningProgress?: string;
  onUpdateTaskStatus: (taskId: string, status: any) => void;
  onSaveSettings: (settings: Record<string, any>) => void;
  onNavigateToCommunity?: () => void;
}

export const SupportAgentView: React.FC<SupportAgentViewProps> = ({
  shops,
  findings,
  tasks,
  runs,
  settings,
  onRunAgent,
  isRunning,
  runningProgress,
  onUpdateTaskStatus,
  onSaveSettings,
  onNavigateToCommunity
}) => {
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  const mockOverviewContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div className="apple-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Triage Status
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--apple-blue)', marginTop: '4px' }}>
            Autonomous
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Triggered on new community post
          </div>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Known Bugs Matched
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--apple-green)', marginTop: '4px' }}>
            94%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            AI pattern match accuracy
          </div>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Verified Resolutions
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            18
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Cataloged by HQ IT
          </div>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Avg First Response
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            &lt; 3.2s
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Instant AI Copilot suggestion
          </div>
        </div>
      </div>

      {/* Primary Triage Flow Banner */}
      <div className="apple-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.05) 0%, rgba(88, 86, 214, 0.05) 100%)', border: '1px solid rgba(0, 113, 227, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--apple-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Autonomous Issue Classifier & Known Bug Resolver
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Whenever a store manager or franchise owner reports a technical barrier in the Franchise Community, this agent uses Groq LLM reasoning to classify the issue, searches verified bugs (BUG-1821, BUG-1904), and provides an instant verified workaround.
              </p>
            </div>
          </div>

          {onNavigateToCommunity && (
            <button
              onClick={onNavigateToCommunity}
              className="apple-btn apple-btn-primary"
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Open Community Hub</span>
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Active Known Issues Spotlight */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="var(--apple-blue)" />
          <span>Active Verified Known Issues (IT Support Catalog)</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--apple-blue)', fontSize: '12px' }}>BUG-1821</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Billing terminal freezes after GST rate update in v2.8.1
                </span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--apple-green)', fontWeight: 700 }}>
                  FIXED IN v2.8.2
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Workaround: Restart POS service or toggle offline cache in Terminal Settings. Verified by Priya Nair (HQ IT Lead).
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--apple-orange)', fontSize: '12px' }}>BUG-1904</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Thermal printer truncates barcode on 58mm paper rolls
                </span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 149, 0, 0.1)', color: 'var(--apple-orange)', fontWeight: 700 }}>
                  WORKAROUND AVAILABLE
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Workaround: Change print density to Compact in Hardware Settings. Fixed in build 2.8.3.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="support"
      agentName="Support & Community Agent"
      agentTitle="Franchise Support & Known Issue Resolver"
      agentDescription="Autonomous triage and matching of technical questions against verified bug workarounds"
      agentIcon={<MessagesSquare size={18} />}
      iconBg="var(--apple-blue)"
      status="Active"
      shops={shops}
      isRunning={isRunning}
      runningProgress={runningProgress}
      onRunAgent={onRunAgent}
      findings={findings}
      tasks={tasks}
      runs={runs}
      settings={settings}
      onSaveSettings={onSaveSettings}
      onUpdateTaskStatus={onUpdateTaskStatus}
      renderOverview={() => mockOverviewContent}
      renderSettingsForm={(currentSettings, onChange) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Minimum AI Similarity Match Threshold (%)
            </label>
            <input
              type="number"
              value={currentSettings.similarityThreshold || 85}
              onChange={(e) => onChange('similarityThreshold', Number(e.target.value))}
              style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              AI Reasoning Engine
            </label>
            <select
              value={currentSettings.aiModel || 'llama-3.1-8b-instant'}
              onChange={(e) => onChange('aiModel', e.target.value)}
              style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="llama-3.1-8b-instant">Groq LLaMA 3.1 8B Instant (Ultra-Fast)</option>
              <option value="llama-3.3-70b-versatile">Groq LLaMA 3.3 70B Versatile (Deep Reasoning)</option>
            </select>
          </div>
        </div>
      )}
    />
  );
};
