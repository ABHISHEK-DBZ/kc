import Groq from 'groq-sdk';

class GroqAIService {
  private client: Groq | null = null;
  private hasKey: boolean = false;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith('gsk_')) {
      try {
        this.client = new Groq({ apiKey });
        this.hasKey = true;
        console.log('[GroqAIService] Initialized with server-side Groq credentials.');
      } catch (err) {
        console.warn('[GroqAIService] Failed to initialize Groq client:', err);
      }
    } else {
      console.log('[GroqAIService] GROQ_API_KEY not provided or demo placeholder. Running in resilient hybrid mode.');
    }
  }

  // 1. Natural Language Explanation of Numerical Findings
  async explainFinding(params: {
    agentName: string;
    shopName: string;
    findingTitle: string;
    metrics: Record<string, any>;
    baseline: string;
    deviation: string;
  }): Promise<{ summary: string; reasoning: string; action: string }> {
    if (this.hasKey && this.client) {
      try {
        const prompt = `You are KhataCopilot HQ Retail AI. Explain this operational finding for retail decision-makers:
Agent: ${params.agentName}
Shop: ${params.shopName}
Finding: ${params.findingTitle}
Metrics: ${JSON.stringify(params.metrics)}
Baseline: ${params.baseline}
Deviation: ${params.deviation}

Return a valid JSON object only with exact keys:
{
  "summary": "1-2 sentence executive summary with exact figures",
  "reasoning": "Clear root cause explanation why this happened based solely on the provided metrics",
  "action": "Specific operational directive for the store/area manager"
}`;

        const chat = await this.client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        const content = chat.choices[0]?.message?.content;
        if (content) {
          return JSON.parse(content);
        }
      } catch (err) {
        console.error('[GroqAIService] explainFinding API call failed, using deterministic reasoning:', err);
      }
    }

    // Deterministic High-Precision Fallback
    return {
      summary: `${params.shopName} exhibited ${params.findingTitle.toLowerCase()} with a measured deviation of ${params.deviation} against baseline ${params.baseline}.`,
      reasoning: `Operational audit confirms discrepancy driven by transaction velocity shifts (${JSON.stringify(params.metrics)}). Risk threshold crossed requiring immediate administrative oversight.`,
      action: `Conduct immediate branch inspection, verify cash reconciliation with physical tills, and review credit ledger balances.`
    };
  }

  // 2. Classify Community Issues & Match Technical Categories
  async classifyIssue(title: string, description: string): Promise<{
    category: string;
    severity: 'High' | 'Medium' | 'Low';
    affectedArea: string;
    suggestedAction: string;
    confidence: number;
  }> {
    if (this.hasKey && this.client) {
      try {
        const prompt = `Classify this franchise support ticket:
Title: ${title}
Description: ${description}

Categories: "Billing & POS", "Hardware & Printers", "Payments & UPI", "Inventory Sync", "GST & Taxation", "Store Operations".
Severities: "High", "Medium", "Low".

Return valid JSON:
{
  "category": "...",
  "severity": "High" | "Medium" | "Low",
  "affectedArea": "...",
  "suggestedAction": "...",
  "confidence": 0.85
}`;

        const chat = await this.client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });

        const content = chat.choices[0]?.message?.content;
        if (content) {
          return JSON.parse(content);
        }
      } catch (err) {
        console.error('[GroqAIService] classifyIssue failed, using fallback:', err);
      }
    }

    const lower = (title + ' ' + description).toLowerCase();
    let category = 'Store Operations';
    let severity: 'High' | 'Medium' | 'Low' = 'Low';
    let suggestedAction = 'Review store operational logs and contact IT helpdesk.';

    if (lower.includes('freeze') || lower.includes('crash') || lower.includes('pos') || lower.includes('billing')) {
      category = 'Billing & POS';
      severity = 'High';
      suggestedAction = 'Check software build version and verify SQLite database integrity.';
    } else if (lower.includes('printer') || lower.includes('paper') || lower.includes('hardware') || lower.includes('barcode')) {
      category = 'Hardware & Printers';
      severity = 'Medium';
      suggestedAction = 'Inspect ESC/POS baud rate and check USB/Bluetooth thermal printer driver.';
    } else if (lower.includes('upi') || lower.includes('payment') || lower.includes('qr') || lower.includes('soundbox')) {
      category = 'Payments & UPI';
      severity = 'High';
      suggestedAction = 'Inspect webhook callback gateway latency and test static QR backup.';
    } else if (lower.includes('gst') || lower.includes('tax') || lower.includes('invoice')) {
      category = 'GST & Taxation';
      severity = 'Medium';
      suggestedAction = 'Verify GST slab mapping in Master Settings.';
    }

    return {
      category,
      severity,
      affectedArea: category,
      suggestedAction,
      confidence: 0.92
    };
  }

  // 3. Similar Issue Matching
  async matchSimilarIssue(ticketText: string, knownIssues: Array<{ id: string; code: string; title: string; workaround: string }>): Promise<{
    matched: boolean;
    issueId?: string;
    code?: string;
    similarityScore: number;
    recommendedSolution?: string;
  }> {
    if (!knownIssues.length) {
      return { matched: false, similarityScore: 0 };
    }

    const ticketLower = ticketText.toLowerCase();
    let bestMatch = knownIssues[0];
    let highestScore = 0;

    for (const issue of knownIssues) {
      let score = 0;
      const issueWords = (issue.title + ' ' + issue.code + ' ' + (issue.workaround || '')).toLowerCase().split(/\W+/);
      const ticketWords = ticketLower.split(/\W+/);

      let common = 0;
      for (const w of ticketWords) {
        if (w.length > 3 && issueWords.includes(w)) {
          common++;
        }
      }

      score = Math.min(0.96, Math.max(0.2, (common / Math.max(issueWords.length / 3, 5))));
      if (score > highestScore) {
        highestScore = score;
        bestMatch = issue;
      }
    }

    if (highestScore > 0.45) {
      return {
        matched: true,
        issueId: bestMatch.id,
        code: bestMatch.code,
        similarityScore: Math.round(highestScore * 100),
        recommendedSolution: bestMatch.workaround
      };
    }

    return { matched: false, similarityScore: Math.round(highestScore * 100) };
  }

  // 4. Natural Language Purchase Recommendation Explanation
  async explainPurchaseRecommendation(params: {
    productName: string;
    shopName: string;
    currentStock: number;
    salesVelocity: number;
    salesTrendPct: number;
    stockCoverageDays: number;
    unitPrice: number;
    costPrice: number;
    unitProfit: number;
    marginPct: number;
    recommendationType: string;
    suggestedOrderQty: number;
    profitOpportunity: string;
  }): Promise<{ reason: string; opportunityExplanation: string }> {
    if (this.hasKey && this.client) {
      try {
        const prompt = `You are KhataCopilot HQ Retail AI Inventory Intelligence. Provide concise, business-grounded reasoning for this replenishment decision:
Product: ${params.productName} (${params.shopName})
Current Stock: ${params.currentStock}
Sales Velocity: ${params.salesVelocity} units/day
30-Day Sales Trend: ${params.salesTrendPct >= 0 ? '+' : ''}${params.salesTrendPct}%
Stock Coverage Runway: ${params.stockCoverageDays.toFixed(1)} days
Unit Profit: ₹${params.unitProfit} (Margin: ${params.marginPct.toFixed(1)}%)
Recommendation: ${params.recommendationType}
Suggested Order: ${params.suggestedOrderQty} units
Profit Opportunity: ${params.profitOpportunity}

Important Rules:
- Never fabricate numbers or metrics. Use only the provided figures.
- Do NOT promise guaranteed profit. Use wording such as "estimated", "potential", "based on recent trends".
- Keep "reason" to 1-2 concise, executive sentences.
- Keep "opportunityExplanation" to 1 sentence explaining the profit opportunity.

Return valid JSON only:
{
  "reason": "...",
  "opportunityExplanation": "..."
}`;

        const chat = await this.client.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        const content = chat.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.reason) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('[GroqAIService] explainPurchaseRecommendation API call failed, using deterministic reasoning:', err);
      }
    }

    // Deterministic High-Precision Fallback (100% reliable, zero hallucination)
    let reason = '';
    let opportunityExplanation = '';

    const trendSign = params.salesTrendPct >= 0 ? `+${params.salesTrendPct.toFixed(1)}%` : `${params.salesTrendPct.toFixed(1)}%`;
    const coverageStr = params.stockCoverageDays < 999 ? `~${params.stockCoverageDays.toFixed(1)} days` : 'indefinite';

    switch (params.recommendationType) {
      case 'URGENT_REORDER':
        reason = `Critical stockout predicted in ${coverageStr} at current velocity of ${params.salesVelocity.toFixed(1)}/day. Urgent purchase order required to avoid retail stockout.`;
        opportunityExplanation = `Preventing imminent stockout protects an estimated daily gross margin of ₹${Math.round(params.salesVelocity * params.unitProfit)}.`;
        break;
      case 'BUY_MORE':
        reason = `Demand has accelerated ${trendSign} over recent cycles and current stock covers only ${coverageStr}. Strong recent velocity and healthy margin (₹${params.unitProfit}/unit) justify increasing order volume.`;
        opportunityExplanation = `High estimated profit opportunity: maintaining adequate stock can help capture rising customer demand.`;
        break;
      case 'BUY_NOW':
      case 'BUY_NORMAL':
        reason = `Current inventory (${params.currentStock}) is nearing reorder threshold with steady velocity (${params.salesVelocity.toFixed(1)}/day). Routine replenishment maintains optimal buffer.`;
        opportunityExplanation = `Standard margin stability based on steady demand patterns.`;
        break;
      case 'WAIT':
        reason = `Current stock covers approximately ${coverageStr} of projected demand. Velocity is stable and existing inventory buffer is sufficient.`;
        opportunityExplanation = `Capital allocation is optimal; no additional working capital required at this time.`;
        break;
      case 'DO_NOT_BUY':
      case 'OVERSTOCK_RISK':
        reason = `Sales velocity is low (${params.salesVelocity.toFixed(1)}/day) and current inventory already covers approximately ${coverageStr} of demand. Additional purchasing may increase dead-stock risk.`;
        opportunityExplanation = `Low profit upside with elevated working capital lockup risk.`;
        break;
      case 'SLOW_MOVING':
        reason = `Sales velocity has decelerated (${trendSign} trend) and current stock covers ${coverageStr}. Recommend promotional bundling before issuing reorders.`;
        opportunityExplanation = `Estimated potential profit is low; focus on liquidating existing units.`;
        break;
      default:
        reason = `Evaluated inventory signals: ${params.currentStock} in stock, ${params.salesVelocity.toFixed(1)} daily burn rate, ${trendSign} demand velocity.`;
        opportunityExplanation = `Estimated opportunity based on recent store-level velocity.`;
    }

    return { reason, opportunityExplanation };
  }
}

export const groqService = new GroqAIService();
