/**
 * @file gemini.service.js
 * @module service/geminiService
 * @description Dedicated service layer handling core prompts via the native Google GenAI SDK.
 */

const { GoogleGenAI } = require('@google/genai');
const AppError = require('../errors/app-error');

const getGeminiClient = (explicitApiKey) => {
  const apiKey = explicitApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      'Missing Gemini API configuration key. Please add it to step parameters or .env file.',
      500
    );
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Pipeline 1: Description Assistant Engine
 */
const generateAssistedDescription = async ({
  category,
  title,
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const prompt = `
      You are an expert behavioral scientist and mental wellness coach. 
      The user has selected the following focus area:
      - Category: ${category}
      - Selected Theme/Goal: "${title}"

      Write a compelling, encouraging, and clear actionable description for this goal.
      
      CRITICAL CONSTRAINT:
      The output must be an short sentence of MAXIMUM 50 words total.
      
      Focus on the psychological "why" and how it helps their mental clarity. 
      Do not use any markdown formatting, quotation marks, or meta-commentary; return only the clean raw text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });

    const aiText = response.text;

    if (!aiText || aiText.trim().length === 0) {
      throw new AppError(
        'The Gemini generation engine returned an empty text payload.',
        502
      );
    }

    return aiText.trim();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Description generation failure: ${error.message}`, 502);
  }
};

/**
 * Pipeline 2: Full Roadmap Compilation Engine
 * Synthesizes all parameters into a combined Markdown layout and structured tasks array.
 */
const generateActionableRoadmap = async ({
  category,
  title,
  timelineType,
  selectedDays,
  dailyCommitment,
  description,
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const prompt = `
      You are a world-class clinical psychologist and habit formation consultant specializing in micro-stepping progression models.
      
      Synthesize these parameters into an actionable wellness roadmap:
      - Focus Category: ${category}
      - Ultimate Goal Objective: "${title}"
      - Timeline Horizon: ${timelineType.replace('_', ' ')}
      - Active Weekly Rhythm: Only on these days: [${selectedDays.join(', ')}]
      - Daily Time Allocation Box: ${dailyCommitment} every active day
      - Core Context/Description: "${description || 'Build baseline consistency.'}"

      Core Structural Rules for the Roadmap output:
      1. Create a detailed, chronological master text roadmap using clear markdown structures (##, ###, bullet points) inside the "roadmapMarkdown" property.
      2. Respect the active weekly pattern ([${selectedDays.join(', ')}]) and daily commitment block (${dailyCommitment}).

      CRITICAL TASK COUNT CONSTRAINT:
      You must dynamically calculate the EXACT number of tasks to generate based on the combination of the Timeline Horizon and the Active Weekly Rhythm. 
      Follow this strict mathematical matrix to fill the "tasks" array:
      - If Timeline is "1 week": Generate exactly 1 task for each day listed in the active weekly rhythm. (e.g., 3 selected days = exactly 3 total tasks).
      - If Timeline is "1 month": Assume a 4-week horizon. Generate exactly (4 weeks × number of active weekly days) tasks. (e.g., 3 selected days = exactly 12 total tasks).
      - If Timeline is "3 months": Assume a 13-week horizon. Generate exactly (13 weeks × number of active weekly days) tasks. (e.g., 2 selected days = exactly 26 total tasks).

      Each generated task object must represent a single, real-world actionable session on an active day.
    `;

    // Corrected to use native SDK .generateContent() with strict JSON schema modeling
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 3500, // Room for both comprehensive markdown text and task arrays
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            roadmapMarkdown: {
              type: 'STRING',
              description:
                'Detailed roadmap with milestone instructions and psychology checks formatted in markdown.',
            },
            tasks: {
              type: 'ARRAY',
              description:
                'The dynamically scaled array containing each interactive, trackable checklist task session.',
              items: {
                type: 'OBJECT',
                properties: {
                  title: {
                    type: 'STRING',
                    description:
                      'Actionable milestone or daily exercise title description.',
                  },
                  phase: {
                    type: 'STRING',
                    description:
                      'Chronological indicator (e.g. Week 1, Phase 2).',
                  },
                },
                required: ['title', 'phase'],
              },
            },
          },
          required: ['roadmapMarkdown', 'tasks'],
        },
      },
    });

    const aiText = response.text;
    if (!aiText) {
      throw new AppError('Roadmap compiler returned an empty payload.', 502);
    }

    // Safely parse the strict JSON layout returned by Gemini
    const parsedData = JSON.parse(aiText.trim());

    if (!parsedData.roadmapMarkdown || !Array.isArray(parsedData.tasks)) {
      throw new AppError(
        'Gemini JSON payload structure is missing critical roadmap validation paths.',
        502
      );
    }

    return parsedData;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Gemini roadmap compilation failure: ${error.message}`,
      502
    );
  }
};

/**
 * Pipeline 3: Goals Behavioral Telemetry Analytics Engine
 * Deep psychological and behavioral analysis of goal achievement patterns.
 */
const generateGoalsAnalytics = async ({
  userId,
  operationalDataSummary,
  explicitApiKey,
  rangeMode = 'biweekly',
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const days =
      rangeMode === 'quarterly' ? 90 : rangeMode === 'monthly' ? 30 : 15;

    const systemPromptInstruction = `
  You are a world-class performance psychologist and goal achievement specialist with 20+ years of clinical experience.
  
  Your task is to analyze the user's goals data and provide **deep, psychologically-grounded, actionable insights** that actually help them achieve their goals.
  
  # CRITICAL ANALYSIS FRAMEWORKS:
  
  1. **PREDICTIVE SUCCESS SCORING**:
     - Calculate a realistic success probability score (0-100%) based on:
       * Current progress vs. timeline
       * Consistency of effort (not just completion)
       * Whether they're working on the right things
       * Psychological momentum indicators
     - Provide a confidence interval (High/Medium/Low)
     - Explain the rationale with specific evidence from the data
  
  2. **BEHAVIORAL BOTTLENECKS**:
     - Identify specific psychological or behavioral friction points
     - For each bottleneck, provide:
       * The specific friction factor (e.g., "Perfectionism paralysis on Task X")
       * Impact level on overall progress (High/Medium/Low)
       * A concrete, actionable fix (not generic advice)
  
  3. **MOMENTUM TREND ANALYSIS**:
     - Determine if they're Improving, Stagnant, or Declining
     - Provide a velocity description that explains WHY they're in that state
     - Identify what's working well and what needs immediate attention
  
  4. **ADAPTIVE SCHEDULE OPTIMIZATIONS**:
     - For each goal, suggest one specific schedule adjustment
     - Based on their actual performance patterns, not generic advice
  
  5. **UNDER-PERFORMING SECTORS**:
     - Identify categories or areas where they're struggling most
     - Be specific about which goals are lagging behind
  
  6. **OVERALL INSIGHT**:
     - One powerful, motivating summary sentence
     - Must be specific to their data, not generic
  
  CRITICAL RULES:
  - Be direct, tactical, and evidence-based. Base everything strictly on the actual data provided.
  - Use short, clear sentences (max 12-15 words per insight when possible).
  - Never hallucinate goals that don't exist in the data.
  - If only one goal or limited data, be honest about data limitations.
  - For completed goals, emphasize maintenance and sustainability.
  - OUTPUT ONLY VALID JSON. DO NOT include any explanations, markdown, or extra text.
`;

    const dynamicExecutionPayload = `
  User ID: ${userId}
  Range: ${rangeMode} (${days} days)
  GOALS TELEMETRY DATA:
  ${JSON.stringify(operationalDataSummary, null, 2)}
  
  Analyze this data and produce the exact JSON response following the schema.
  Provide DEEP, ACTIONABLE insights that would actually help this user succeed.
`;

    let response;
    const maxRetries = 3;
    let initialDelay = 1200;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: dynamicExecutionPayload,
          config: {
            systemInstruction: systemPromptInstruction,
            responseMimeType: 'application/json',
            temperature: 0.55,
            maxOutputTokens: 2500,
            responseSchema: {
              type: 'OBJECT',
              properties: {
                predictiveSuccessScore: {
                  type: 'OBJECT',
                  properties: {
                    scorePercentage: { type: 'INTEGER' },
                    confidenceInterval: {
                      type: 'STRING',
                      enum: ['High', 'Medium', 'Low'],
                    },
                    predictiveRationale: { type: 'STRING' },
                  },
                  required: [
                    'scorePercentage',
                    'confidenceInterval',
                    'predictiveRationale',
                  ],
                },
                behavioralBottlenecks: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      frictionFactor: { type: 'STRING' },
                      impactLevel: {
                        type: 'STRING',
                        enum: ['High', 'Medium', 'Low'],
                      },
                      actionableFix: { type: 'STRING' },
                    },
                    required: [
                      'frictionFactor',
                      'impactLevel',
                      'actionableFix',
                    ],
                  },
                },
                momentumTrendAnalysis: {
                  type: 'OBJECT',
                  properties: {
                    trajectory: {
                      type: 'STRING',
                      enum: ['Improving', 'Stagnant', 'Declining'],
                    },
                    velocityDescription: { type: 'STRING' },
                  },
                  required: ['trajectory', 'velocityDescription'],
                },
                adaptiveScheduleOptimizations: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      goalId: { type: 'STRING' },
                      goalTitle: { type: 'STRING' },
                      proposedAdjustment: { type: 'STRING' },
                    },
                    required: ['goalId', 'goalTitle', 'proposedAdjustment'],
                  },
                },
                underPerformingSectors: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                overallInsight: {
                  type: 'STRING',
                  description:
                    'One powerful, motivating summary sentence specific to their data',
                },
              },
              required: [
                'predictiveSuccessScore',
                'behavioralBottlenecks',
                'momentumTrendAnalysis',
                'adaptiveScheduleOptimizations',
                'underPerformingSectors',
              ],
            },
          },
        });
        break;
      } catch (apiError) {
        const isTransient =
          apiError.status === 503 ||
          apiError.status === 429 ||
          (apiError.message &&
            /503|429|high demand|overloaded/i.test(apiError.message));

        if (isTransient && attempt < maxRetries) {
          const backoff = initialDelay * attempt;
          console.warn(
            `⚠️ Gemini Goals transient error (attempt ${attempt}/${maxRetries}). Retrying in ${backoff}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw apiError;
      }
    }

    const rawText =
      response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new AppError('Goals analytics: Empty response from Gemini', 502);
    }

    const parsed = JSON.parse(rawText.trim());

    // Safety post-processing
    parsed.behavioralBottlenecks = parsed.behavioralBottlenecks || [];
    parsed.adaptiveScheduleOptimizations =
      parsed.adaptiveScheduleOptimizations || [];
    parsed.underPerformingSectors = parsed.underPerformingSectors || [];
    if (!parsed.overallInsight) {
      parsed.overallInsight =
        'Goals data analyzed successfully. Keep pushing forward!';
    }

    return parsed;
  } catch (error) {
    console.error('Goals Analytics Generation Failed:', {
      userId,
      error: error.message,
      stack: error.stack?.substring(0, 300),
    });

    if (error instanceof AppError) throw error;

    if (error.status === 503 || /high demand|overloaded/i.test(error.message)) {
      throw new AppError(
        'Our AI behavioral engine is currently under heavy load. Please try again shortly.',
        503
      );
    }

    if (error instanceof SyntaxError) {
      throw new AppError(
        'AI returned malformed response. Please refresh analytics.',
        502
      );
    }

    throw new AppError(
      `Goals analytics pipeline failed: ${error.message}`,
      502
    );
  }
};

/**
 * Pipeline 4: Reflective Journal & Weekly Review Analytics Engine
 * Deeply analyzes mood trajectories, psychological blocks, and growth patterns.
 */
const generateJournalAnalytics = async ({
  userId,
  journalsDataArray,
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const systemPromptInstruction = `
  You are an expert Clinical Psychologist, AI Mindfulness Coach, and Behavioral Analyst with 20+ years of experience.
  
  Your task is to analyze the user's chronological journals and provide **deep, psychologically-grounded insights** that actually help them grow.
  
  # CRITICAL ANALYSIS FRAMEWORKS:
  
  1. **EMOTIONAL TRAJECTORY**:
     - Identify the dominant emotional state across the period
     - Determine the trend direction (Improving/Fluctuating/Stagnant/Declining)
     - Provide a mental clarity insight explaining the WHY behind their emotional state
     - Look for emotional patterns: Are they consistently stressed on certain days? Is there a correlation with specific events?
  
  2. **PSYCHOLOGICAL BOTTLENECKS**:
     - Identify recurring negative patterns, cognitive distortions, or emotional blocks
     - For each bottleneck:
       * Name the core issue (e.g., "Catastrophizing", "Self-Doubt Spiral", "Burnout Creep")
       * Provide evidence from their actual journal entries
       * Give ONE specific coaching adjustment that addresses this specific block
     - Be brutally honest but compassionate - this is for their growth
  
  3. **WEEKLY REVIEW SYNTHESES**:
     - Aggregate insights from each weekly review (if available)
     - Identify macro wins and growth takeaways
     - Look for patterns: Are they consistently celebrating the same types of wins?
  
  4. **MINDFULNESS ACTION ITEMS**:
     - Provide 3-5 highly specific, immediate micro-steps
     - Each must be a concrete action, not vague advice
     - Examples: "Write down 3 things you're grateful for before sleep" vs just "Practice gratitude"
  
  CRITICAL RULES:
  - Be direct, deeply perceptive, and split into clear analytical categories.
  - Every textual analysis statement or actionable coaching item must be limited to a single concise sentence (max 15 words).
  - Base everything strictly on the actual data provided.
  - If data is sparse, be honest and suggest more frequent journaling.
  - OUTPUT ONLY VALID JSON. DO NOT include any explanations, markdown, or extra text.
`;

    const payloadContext = `
  Perform comprehensive reflection telemetry evaluation for User ID [${userId}].
  Raw chronological mixed journal & weekly review dataset array to scan:
  ${JSON.stringify(journalsDataArray, null, 2)}
  
  Provide DEEP, ACTIONABLE psychological insights that would actually help this user grow.
`;

    let response;
    const maxRetries = 3;
    let initialDelay = 1500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: payloadContext,
          config: {
            systemInstruction: systemPromptInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 2500,
            temperature: 0.5,
            responseSchema: {
              type: 'OBJECT',
              properties: {
                emotionalTrajectory: {
                  type: 'OBJECT',
                  properties: {
                    dominantState: {
                      type: 'STRING',
                      description:
                        'Calculated baseline emotion (e.g., Content, Overwhelmed, Driven)',
                    },
                    trendDirection: {
                      type: 'STRING',
                      enum: [
                        'Improving',
                        'Fluctuating',
                        'Stagnant',
                        'Declining',
                      ],
                    },
                    mentalClarityInsight: {
                      type: 'STRING',
                      description:
                        'One short sentence explaining the WHY behind their emotional state',
                    },
                  },
                  required: [
                    'dominantState',
                    'trendDirection',
                    'mentalClarityInsight',
                  ],
                },
                psychologicalBottlenecks: {
                  type: 'ARRAY',
                  description: 'Core recurring blockages detected across logs',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      coreIssue: {
                        type: 'STRING',
                        description:
                          'Short name for the block (e.g., Self-Doubt Spiral)',
                      },
                      evidenceSummary: {
                        type: 'STRING',
                        description:
                          'One brief phrase linking back to their actual entries',
                      },
                      coachingAdjustment: {
                        type: 'STRING',
                        description:
                          'One targeted, specific action to counter this block',
                      },
                    },
                    required: [
                      'coreIssue',
                      'evidenceSummary',
                      'coachingAdjustment',
                    ],
                  },
                },
                weeklyReviewSyntheses: {
                  type: 'ARRAY',
                  description:
                    'Aggregated assessment for distinct weekly review boundary groups',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      weekRange: {
                        type: 'STRING',
                        description:
                          'The boundary block label (e.g., 31 May - 06 June)',
                      },
                      macroWinInsight: {
                        type: 'STRING',
                        description:
                          'One concise summary of their top success vector for the week',
                      },
                      growthTakeaway: {
                        type: 'STRING',
                        description:
                          'One clear growth summary takeaway sentence',
                      },
                    },
                    required: [
                      'weekRange',
                      'macroWinInsight',
                      'growthTakeaway',
                    ],
                  },
                },
                mindfulnessActionItems: {
                  type: 'ARRAY',
                  description:
                    'Highly concrete, immediate micro-steps for self-care',
                  items: { type: 'STRING' },
                },
                overallInsight: {
                  type: 'STRING',
                  description:
                    'One powerful, motivating summary sentence specific to their journey',
                },
              },
              required: [
                'emotionalTrajectory',
                'psychologicalBottlenecks',
                'weeklyReviewSyntheses',
                'mindfulnessActionItems',
              ],
            },
          },
        });
        break;
      } catch (apiError) {
        const isTransientError =
          apiError.status === 503 ||
          apiError.status === 429 ||
          (apiError.message && apiError.message.includes('503')) ||
          (apiError.message && apiError.message.includes('high demand'));

        if (isTransientError && attempt < maxRetries) {
          const backoffTime = initialDelay * attempt;
          console.warn(
            `⚠️ Gemini Journal Engine Busy [Attempt ${attempt}/${maxRetries}]. Retrying in ${backoffTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }
        throw apiError;
      }
    }

    const rawTextResponse =
      response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawTextResponse) {
      throw new AppError(
        'AI Journal analysis pipeline returned blank analytics response.',
        502
      );
    }

    const parsed = JSON.parse(rawTextResponse.trim());

    // Add overall insight if missing
    if (!parsed.overallInsight) {
      parsed.overallInsight =
        'Your journaling journey shows meaningful patterns. Keep reflecting!';
    }

    return parsed;
  } catch (error) {
    if (
      error.status === 503 ||
      (error.message && error.message.includes('high demand'))
    ) {
      throw new AppError(
        'Our journal assessment model is experiencing heavy load. Please give it a brief moment and refresh your insight panel.',
        503
      );
    }
    if (error instanceof SyntaxError) {
      throw new AppError(
        'AI parsing system dropped a malformed non-JSON data block.',
        502
      );
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Gemini journal analytics pipeline failure: ${error.message}`,
      502
    );
  }
};

/**
 * Pipeline 5: Todo Telemetry Engine - Deep & Actionable
 */
const generateTodoAnalytics = async ({
  userId,
  todosSummaryArray,
  rangeMode = 'biweekly',
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const days =
      rangeMode === 'quarterly' ? 90 : rangeMode === 'monthly' ? 30 : 15;

    const systemPromptInstruction = `
  You are a senior workflow optimization specialist and productivity psychologist with 15+ years of experience.
  
  Your task is to analyze the user's todo data and provide **deep, psychologically-grounded, actionable insights** that actually help them become more productive.
  
  # CRITICAL ANALYSIS FRAMEWORKS:
  
  1. **TELEMETRY SUMMARY**:
     - Calculate the true completion rate (not just binary done/not done)
     - Analyze rollover drift: Are tasks consistently slipping? This reveals procrastination patterns
     - Determine execution velocity: Optimal, Steady, Stalling, or Stuck
     - Identify the WHY behind these metrics
  
  2. **TYPE BALANCE ANALYSIS**:
     - Analyze the ratio of DAILY (maintenance) vs GOAL (forward progress) tasks
     - Determine if they're over-focused on maintenance vs progress
     - Provide strategic insight: Should they shift more energy toward goals?
  
  3. **ROLLOVER FATIGUE BOTTLENECKS**:
     - Identify specific tasks that keep getting postponed
     - For each, provide:
       * The task snippet
       * How many times it's been rolled over
       * A friction diagnosis explaining WHY it keeps getting postponed
     - This reveals psychological avoidance patterns
  
  4. **ACTIONABLE DIRECTIVES**:
     - Provide 3-5 specific, concrete operational changes
     - Each must be a clear action, not generic advice
     - Examples: "Break 'Write Report' into 3 smaller tasks" vs just "Break tasks down"
  
  CRITICAL RULES:
  - Be direct, tactical, and evidence-based.
  - Every text field must be a single concise sentence (max 15 words).
  - If all tasks are incomplete or data is sparse, be honest and provide motivational guidance.
  - OUTPUT ONLY VALID JSON. DO NOT include any explanations, markdown, or extra text.
`;

    const dynamicExecutionPayload = `
  Analyze performance telemetry for User [${userId}] over the past ${days} days:
  ${JSON.stringify(todosSummaryArray, null, 2)}
  
  Provide DEEP, ACTIONABLE productivity insights that would actually help this user.
`;

    let response;
    let lastError = null;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: dynamicExecutionPayload,
          config: {
            systemInstruction: systemPromptInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 2500,
            temperature: 0.4,
            responseSchema: {
              type: 'OBJECT',
              properties: {
                telemetrySummary: {
                  type: 'OBJECT',
                  properties: {
                    completionRate: { type: 'INTEGER' },
                    averageRolloverDrift: { type: 'NUMBER' },
                    executionVelocity: {
                      type: 'STRING',
                      enum: ['Optimal', 'Steady', 'Stalling', 'Stuck'],
                    },
                    velocityInsight: { type: 'STRING' },
                  },
                  required: [
                    'completionRate',
                    'averageRolloverDrift',
                    'executionVelocity',
                    'velocityInsight',
                  ],
                },
                typeBalanceAnalysis: {
                  type: 'OBJECT',
                  properties: {
                    allocationRatio: { type: 'STRING' },
                    strategicInsight: { type: 'STRING' },
                    recommendedShift: { type: 'STRING' },
                  },
                  required: [
                    'allocationRatio',
                    'strategicInsight',
                    'recommendedShift',
                  ],
                },
                rolloverFatigueBottlenecks: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      taskTitleSnippet: { type: 'STRING' },
                      accumulatedRollovers: { type: 'INTEGER' },
                      frictionDiagnosis: { type: 'STRING' },
                      unblockAction: { type: 'STRING' },
                    },
                    required: [
                      'taskTitleSnippet',
                      'accumulatedRollovers',
                      'frictionDiagnosis',
                      'unblockAction',
                    ],
                  },
                },
                actionableOperationalDirectives: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                overallInsight: {
                  type: 'STRING',
                  description:
                    'One powerful, motivating summary sentence specific to their data',
                },
              },
              required: [
                'telemetrySummary',
                'typeBalanceAnalysis',
                'rolloverFatigueBottlenecks',
                'actionableOperationalDirectives',
              ],
            },
          },
        });

        const rawText = response.text;
        if (!rawText) throw new Error('Empty response from Gemini');

        let jsonString = rawText.trim();
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString
            .replace(/```json\s*/, '')
            .replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonString);

        // Add overall insight if missing
        if (!parsed.overallInsight) {
          parsed.overallInsight =
            'Your task completion patterns reveal clear opportunities for improvement.';
        }

        return parsed;
      } catch (err) {
        lastError = err;
        console.warn(
          `⚠️ Todo analytics attempt ${attempt} failed:`,
          err.message
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    throw (
      lastError ||
      new Error('Failed to generate valid Todo analytics after retries')
    );
  } catch (error) {
    console.error('❌ Gemini Todo Analytics fatal error:', error.message);

    return {
      telemetrySummary: {
        completionRate: 0,
        averageRolloverDrift: 0,
        executionVelocity: 'Stuck',
        velocityInsight:
          'No tasks completed in this period. Start with one small task today.',
      },
      typeBalanceAnalysis: {
        allocationRatio: 'No data',
        strategicInsight:
          'No tasks tracked. Set up your first todo to get insights.',
        recommendedShift: 'Start with a single daily task to build momentum.',
      },
      rolloverFatigueBottlenecks: [],
      actionableOperationalDirectives: [
        'Start with one small, achievable task today.',
        'Set a specific time for task completion.',
        'Break big tasks into smaller steps.',
      ],
      overallInsight:
        'Every journey begins with a single step. Start tracking your tasks today!',
    };
  }
};

/**
 * Pipeline 6: Habit Actionables Triad Engine
 * Synthesizes a custom habit title into behavioral change execution triggers (Stop, Start, Continue).
 */
const generateHabitActionables = async ({
  title,
  category,
  habitType,
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const systemPromptInstruction = `
      You are an expert clinical psychologist and elite habit-formation coach specializing in behavioral modifications.
      Your goal is to split a custom habit intention into a structured "Stop-Start-Continue" triad.

      CRITICAL PHRASING FRAMEWORKS:
      1. STOP: Identify the exact negative friction point, trigger behavior, or bad pattern to eliminate.
      2. START: Formulate a highly actionable, clear daily atomic replacement metric or substitute action.
      3. CONTINUE: Pinpoint the long-term mental clarity vector or lifestyle compounding health reward.

      CRITICAL CONSTRAINTS:
      - Each statement string value MUST be completely direct, crisp, and limited to a single concise sentence (maximum 5-8 words total).
      - Return absolutely NO introductory chatter or markdown text fences.
    `;

    const executionContextPayload = `
      Compile Actionable Triad fields for:
      - Target Category Focus: ${category}
      - Habit Intention Objective: "${title}"
      - Strategy Vector Selected: ${habitType.toUpperCase()} a habit
    `;

    let parsedPayload = null;
    const maxRetries = 3;
    let initialDelay = 300;

    // 🔄 CORE RESILIENT COMPUTATION LOOP
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let rawText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: executionContextPayload,
          config: {
            systemInstruction: systemPromptInstruction,
            maxOutputTokens: 750,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                stop: { type: 'STRING' },
                start: { type: 'STRING' },
                continue: { type: 'STRING' },
              },
              required: ['stop', 'start', 'continue'],
            },
          },
        });

        rawText = response?.text;
        if (!rawText || !rawText.trim()) {
          throw new Error(
            'API returned an empty or missing text payload segment.'
          );
        }

        // 🧼 SANITIZE CONTENT FENCES (Strip accidental markdown wrappers if present)
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7, cleanText.length - 3).trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3, cleanText.length - 3).trim();
        }

        // Attempt parsing inside the safety loop execution line
        parsedPayload = JSON.parse(cleanText);

        // If we reach this line, parsing succeeded. Break out of retry engine safely!
        break;
      } catch (error) {
        const isTransientError =
          error.status === 503 ||
          error.status === 429 ||
          error instanceof SyntaxError || // Catching JSON validation errors inside the loop
          (error.message && error.message.includes('503')) ||
          (error.message && error.message.includes('high demand')) ||
          (error.message && error.message.includes('Unexpected token'));

        if (isTransientError && attempt < maxRetries) {
          const backoffTime = initialDelay * attempt;
          console.warn(
            `⚠️ Gemini Habit Engine encountered overload or malformed stream [Attempt ${attempt}/${maxRetries}]. Retrying in ${backoffTime}ms...`
          );

          // Debugging log to see exactly what was returned if it failed parsing
          if (error instanceof SyntaxError) {
            console.debug(`🔍 Raw payload on parse failure was: "${rawText}"`);
          }

          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }

        // If we exhausted retries, preserve the raw text onto the error object for debugging before throwing
        if (error instanceof SyntaxError) {
          error.rawResponsePayload = rawText;
        }
        throw error;
      }
    }

    if (!parsedPayload) {
      throw new AppError(
        'The habit actionable generator engine failed to yield a validated telemetry matrix.',
        502
      );
    }

    return parsedPayload;
  } catch (error) {
    // Graceful error classification mapping
    if (
      error.status === 503 ||
      (error.message && error.message.includes('high demand'))
    ) {
      throw new AppError(
        'Our habit assistance engine is currently experiencing high demand from global servers. Please hold on a brief second and tap the generate button again.',
        503
      );
    }
    if (error instanceof SyntaxError) {
      console.error(
        '💥 Terminal Definitve Parse Failure Content Trace:',
        error.rawResponsePayload
      );
      throw new AppError(
        'AI parsing system dropped a malformed non-JSON data stream after maximum retries.',
        502
      );
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Gemini habit compilation engine failure: ${error.message}`,
      502
    );
  }
};

/**
 * Pipeline 7: Comprehensive Habits Behavioral Analytics Engine
 * Deep psychological and behavioral analysis of habit formation patterns.
 */
const generateHabitsAnalytics = async ({
  userId,
  habitsSummaryArray,
  rangeMode = 'biweekly',
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const days =
      rangeMode === 'quarterly' ? 90 : rangeMode === 'monthly' ? 30 : 15;

    const systemPromptInstruction = `
  You are a world-class behavioral psychologist and habit formation expert with 20+ years of clinical experience.
  
  Your task is to analyze the user's habit tracking data and provide **deep, psychologically-grounded, actionable insights** that actually help them build lasting habits.
  
  # CRITICAL ANALYSIS FRAMEWORKS:
  
  1. **GLOBAL ADHERENCE OVERVIEW**:
     - Calculate the true macro adherence rate across ALL habits (0-100%)
     - Determine consistency rating: Consistent, Building, Inconsistent, Erratic, or None
     - Identify the behavioral drivers: What's motivating or demotivating them?
     - Look for patterns: Do they struggle with starting habits? Breaking them? Maintaining?
  
  2. **TRIAD EXECUTION FRICTION** (STOP, START, CONTINUE):
     - For each habit, identify which actionable is failing most often
     - Determine the specific friction trigger (e.g., "No cue to start", "Environment makes it hard to stop")
     - Provide a micro-action correction that targets THIS SPECIFIC friction
     - This reveals which part of the habit loop is broken
  
  3. **STREAK RESILIENCE MATRIX**:
     - Determine streak trajectory: Strengthening, Plateaued, Vulnerable, or None
     - Assess relapse vulnerability risk with specific reasoning
     - Identify which habits are most at risk of breaking
  
  4. **PSYCHOLOGICAL ADHERENCE DRIVERS**:
     - What psychological factors are helping them stick to habits?
     - What psychological factors are causing friction?
     - Provide insights on their habit motivation profile
  
  5. **COACHING DIRECTIVES**:
     - Provide 3-5 specific, actionable coaching directives
     - Each must be tied to their specific data, not generic advice
     - Examples: "Start with a 2-minute version of 'Exercise' before expanding" vs just "Start small"
  
  CRITICAL RULES:
  - Be direct, tactical, and evidence-based. Base everything strictly on the actual data provided.
  - Every text field must be concise (max 15 words per sentence).
  - If no habits exist, provide motivational guidance to start.
  - OUTPUT ONLY VALID JSON. DO NOT include any explanations, markdown, or extra text.
`;

    const dynamicExecutionPayload = `
  Analyze habit performance telemetry for User [${userId}] over the past ${days} days:
  ${JSON.stringify(habitsSummaryArray, null, 2)}
  
  Provide DEEP, ACTIONABLE habit insights that would actually help this user build lasting habits.
`;

    let response;
    let lastError = null;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: dynamicExecutionPayload,
          config: {
            systemInstruction: systemPromptInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 2500,
            temperature: 0.4,
            responseSchema: {
              type: 'OBJECT',
              properties: {
                globalAdherenceOverview: {
                  type: 'OBJECT',
                  properties: {
                    macroAdherenceRate: { type: 'INTEGER' },
                    consistencyRating: {
                      type: 'STRING',
                      enum: [
                        'Consistent',
                        'Building',
                        'Inconsistent',
                        'Erratic',
                        'None',
                      ],
                    },
                    behavioralDrivers: { type: 'STRING' },
                  },
                  required: [
                    'macroAdherenceRate',
                    'consistencyRating',
                    'behavioralDrivers',
                  ],
                },
                triadExecutionFriction: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      habitTitle: { type: 'STRING' },
                      failingVector: {
                        type: 'STRING',
                        enum: ['STOP', 'START', 'CONTINUE'],
                      },
                      identifiedFrictionTrigger: { type: 'STRING' },
                      microActionCorrection: { type: 'STRING' },
                    },
                    required: [
                      'habitTitle',
                      'failingVector',
                      'identifiedFrictionTrigger',
                      'microActionCorrection',
                    ],
                  },
                },
                streakResilienceMatrix: {
                  type: 'OBJECT',
                  properties: {
                    streakTrajectory: {
                      type: 'STRING',
                      enum: [
                        'Strengthening',
                        'Plateaued',
                        'Vulnerable',
                        'None',
                      ],
                    },
                    relapseVulnerabilityRisk: { type: 'STRING' },
                    mostVulnerableHabit: { type: 'STRING' },
                  },
                  required: [
                    'streakTrajectory',
                    'relapseVulnerabilityRisk',
                    'mostVulnerableHabit',
                  ],
                },
                psychologicalAdherenceDrivers: {
                  type: 'OBJECT',
                  properties: {
                    positiveDrivers: { type: 'STRING' },
                    frictionSources: { type: 'STRING' },
                    motivationProfile: { type: 'STRING' },
                  },
                  required: [
                    'positiveDrivers',
                    'frictionSources',
                    'motivationProfile',
                  ],
                },
                coachingDirectives: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                overallInsight: {
                  type: 'STRING',
                  description:
                    'One powerful, motivating summary sentence specific to their habit journey',
                },
              },
              required: [
                'globalAdherenceOverview',
                'triadExecutionFriction',
                'streakResilienceMatrix',
                'psychologicalAdherenceDrivers',
                'coachingDirectives',
              ],
            },
          },
        });

        const rawText = response.text;
        if (!rawText) throw new Error('Empty response from Gemini');

        let jsonString = rawText.trim();
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString
            .replace(/```json\s*/, '')
            .replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonString);

        if (!parsed.overallInsight) {
          parsed.overallInsight =
            parsed.habitsSummaryArray?.length > 0
              ? 'Your habit journey is unfolding. Keep showing up!'
              : 'Start your first habit today - small steps lead to big changes.';
        }

        return parsed;
      } catch (err) {
        lastError = err;
        console.warn(
          `⚠️ Habit analytics attempt ${attempt} failed:`,
          err.message
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    throw (
      lastError ||
      new Error('Failed to generate valid Habit analytics after retries')
    );
  } catch (error) {
    console.error('❌ Gemini Habit Analytics fatal error:', error.message);

    const hasData = habitsSummaryArray && habitsSummaryArray.length > 0;

    return {
      globalAdherenceOverview: {
        macroAdherenceRate: hasData ? 50 : 0,
        consistencyRating: hasData ? 'Building' : 'None',
        behavioralDrivers: hasData
          ? 'AI analysis temporarily unavailable. Please refresh or try again later.'
          : 'No habits tracked in this period. Start building your routine!',
      },
      triadExecutionFriction: hasData
        ? habitsSummaryArray.slice(0, 3).map((h) => ({
            habitTitle: h.title || 'Unnamed Habit',
            failingVector: 'START',
            identifiedFrictionTrigger: 'Analysis pending - please refresh',
            microActionCorrection:
              'Try starting with the smallest possible version of this habit',
          }))
        : [],
      streakResilienceMatrix: {
        streakTrajectory: hasData ? 'Vulnerable' : 'None',
        relapseVulnerabilityRisk: hasData
          ? 'Moderate - check your habit consistency'
          : 'High - no habits established yet',
        mostVulnerableHabit: hasData
          ? habitsSummaryArray[0]?.title || 'Unknown'
          : 'No habits',
      },
      psychologicalAdherenceDrivers: {
        positiveDrivers: hasData
          ? "You have started tracking habits - that's the first step!"
          : 'Start tracking to discover your habit patterns.',
        frictionSources: hasData
          ? 'AI analysis pending - refresh to get insights'
          : 'No habits to analyze yet.',
        motivationProfile: hasData
          ? 'Determination stage - building consistency'
          : 'Pre-contemplation - waiting to start',
      },
      coachingDirectives: hasData
        ? [
            'Refresh the analytics to get personalized insights.',
            'Focus on completing all three actionables daily.',
            'Track your habits consistently for better AI insights.',
          ]
        : [
            'Set your first habit to start tracking.',
            'Start with a simple, daily habit.',
            'Use the "Suggested Habits" feature for inspiration.',
          ],
      overallInsight: hasData
        ? 'Keep going - every day you show up counts.'
        : 'Your habit journey starts with a single step. Take it today!',
    };
  }
};

// ================================================================================
// 🔥 NEW ADDITION: HIGHER-RANGE SNAPSHOT MERGING PIPELINE
// ================================================================================
/**
 * Pipeline 6: Hierarchical Analytics Merger Engine
 * Combines multiple lower-range snapshots into a unified master insight.
 */
const mergeSnapshotsIntoHigherRange = async ({
  rangeMode,
  snapshotsArray,
  explicitApiKey,
}) => {
  try {
    const ai = getGeminiClient(explicitApiKey);

    const systemPromptInstruction = `
  You are a Principal Behavioral Data Scientist and Senior Workflow Architect.
  Your task is to merge an array of historical analytical snapshots into a single, cohesive ${rangeMode.toUpperCase()} master report.
  
  # CRITICAL ANALYSIS FRAMEWORKS:
  
  1. **PATTERN RECOGNITION**: Look for consistent themes across the time periods
  2. **PROGRESSION TRACKING**: How has the user evolved across these windows?
  3. **COMPOUNDING BOTTLENECKS**: What issues are persisting across time?
  4. **MACRO INSIGHTS**: What's the big picture story of their journey?
  
  CRITICAL INSTRUCTIONS:
  - Be brutally direct, macro-focused, tactical, and concise.
  - Every textual explanation, insight, or fix MUST be a single short sentence (maximum 12-15 words).
  - Maintain structural uniformity so the frontend layout parses smoothly.
  - Provide DEEP, ACTIONABLE insights that actually help the user.
`;

    const dynamicExecutionPayload = `
  Execute chronological consolidation into a [${rangeMode.toUpperCase()}] Master Report.
  Target snapshots array to reconcile and aggregate:
  ${JSON.stringify(snapshotsArray, null, 2)}
  
  Provide a comprehensive, actionable master report.
`;

    let response;
    const maxRetries = 3;
    let initialDelay = 1500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: dynamicExecutionPayload,
          config: {
            systemInstruction: systemPromptInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 3000,
            temperature: 0.5,
            responseSchema: {
              type: 'OBJECT',
              properties: {
                journals: {
                  type: 'OBJECT',
                  properties: {
                    emotionalTrajectory: {
                      type: 'OBJECT',
                      properties: {
                        dominantState: { type: 'STRING' },
                        trendDirection: {
                          type: 'STRING',
                          enum: [
                            'Improving',
                            'Fluctuating',
                            'Stagnant',
                            'Declining',
                          ],
                        },
                        mentalClarityInsight: { type: 'STRING' },
                      },
                      required: [
                        'dominantState',
                        'trendDirection',
                        'mentalClarityInsight',
                      ],
                    },
                    psychologicalBottlenecks: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          coreIssue: { type: 'STRING' },
                          evidenceSummary: { type: 'STRING' },
                          coachingAdjustment: { type: 'STRING' },
                        },
                        required: [
                          'coreIssue',
                          'evidenceSummary',
                          'coachingAdjustment',
                        ],
                      },
                    },
                    mindfulnessActionItems: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                    overallInsight: { type: 'STRING' },
                  },
                  required: [
                    'emotionalTrajectory',
                    'psychologicalBottlenecks',
                    'mindfulnessActionItems',
                  ],
                },
                todos: {
                  type: 'OBJECT',
                  properties: {
                    telemetrySummary: {
                      type: 'OBJECT',
                      properties: {
                        completionRate: { type: 'INTEGER' },
                        averageRolloverDrift: { type: 'NUMBER' },
                        executionVelocity: {
                          type: 'STRING',
                          enum: ['Optimal', 'Steady', 'Stalling', 'Stuck'],
                        },
                        velocityInsight: { type: 'STRING' },
                      },
                      required: [
                        'completionRate',
                        'averageRolloverDrift',
                        'executionVelocity',
                        'velocityInsight',
                      ],
                    },
                    typeBalanceAnalysis: {
                      type: 'OBJECT',
                      properties: {
                        allocationRatio: { type: 'STRING' },
                        strategicInsight: { type: 'STRING' },
                        recommendedShift: { type: 'STRING' },
                      },
                      required: [
                        'allocationRatio',
                        'strategicInsight',
                        'recommendedShift',
                      ],
                    },
                    actionableOperationalDirectives: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                    overallInsight: { type: 'STRING' },
                  },
                  required: [
                    'telemetrySummary',
                    'typeBalanceAnalysis',
                    'actionableOperationalDirectives',
                  ],
                },
                goals: {
                  type: 'OBJECT',
                  properties: {
                    predictiveSuccessScore: {
                      type: 'OBJECT',
                      properties: {
                        scorePercentage: { type: 'INTEGER' },
                        confidenceInterval: {
                          type: 'STRING',
                          enum: ['High', 'Medium', 'Low'],
                        },
                        predictiveRationale: { type: 'STRING' },
                      },
                      required: [
                        'scorePercentage',
                        'confidenceInterval',
                        'predictiveRationale',
                      ],
                    },
                    momentumTrendAnalysis: {
                      type: 'OBJECT',
                      properties: {
                        trajectory: {
                          type: 'STRING',
                          enum: ['Improving', 'Stagnant', 'Declining'],
                        },
                        velocityDescription: { type: 'STRING' },
                      },
                      required: ['trajectory', 'velocityDescription'],
                    },
                    underPerformingSectors: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                    overallInsight: { type: 'STRING' },
                  },
                  required: [
                    'predictiveSuccessScore',
                    'momentumTrendAnalysis',
                    'underPerformingSectors',
                  ],
                },
                habits: {
                  type: 'OBJECT',
                  properties: {
                    globalAdherenceOverview: {
                      type: 'OBJECT',
                      properties: {
                        macroAdherenceRate: { type: 'INTEGER' },
                        consistencyRating: {
                          type: 'STRING',
                          enum: [
                            'Consistent',
                            'Building',
                            'Inconsistent',
                            'Erratic',
                            'None',
                          ],
                        },
                        behavioralDrivers: { type: 'STRING' },
                      },
                      required: [
                        'macroAdherenceRate',
                        'consistencyRating',
                        'behavioralDrivers',
                      ],
                    },
                    streakResilienceMatrix: {
                      type: 'OBJECT',
                      properties: {
                        streakTrajectory: {
                          type: 'STRING',
                          enum: [
                            'Strengthening',
                            'Plateaued',
                            'Vulnerable',
                            'None',
                          ],
                        },
                        relapseVulnerabilityRisk: { type: 'STRING' },
                        mostVulnerableHabit: { type: 'STRING' },
                      },
                      required: [
                        'streakTrajectory',
                        'relapseVulnerabilityRisk',
                        'mostVulnerableHabit',
                      ],
                    },
                    coachingDirectives: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                    overallInsight: { type: 'STRING' },
                  },
                  required: [
                    'globalAdherenceOverview',
                    'streakResilienceMatrix',
                    'coachingDirectives',
                  ],
                },
                masterOverallInsight: {
                  type: 'STRING',
                  description: 'One powerful summary of the entire period',
                },
              },
              required: ['journals', 'todos', 'goals', 'habits'],
            },
          },
        });
        break;
      } catch (apiError) {
        const isTransientError =
          apiError.status === 503 ||
          apiError.status === 429 ||
          (apiError.message && apiError.message.includes('503')) ||
          (apiError.message && apiError.message.includes('high demand'));

        if (isTransientError && attempt < maxRetries) {
          const backoffTime = initialDelay * attempt;
          console.warn(
            `⚠️ Merger Engine Busy [Attempt ${attempt}/${maxRetries}]. Retrying in ${backoffTime}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }
        throw apiError;
      }
    }

    const rawTextResponse =
      response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawTextResponse) {
      throw new AppError(
        'AI Merger Engine returned blank response matrix.',
        502
      );
    }

    return JSON.parse(rawTextResponse.trim());
  } catch (error) {
    console.error(`❌ Merger Engine fatal error:`, error.message);
    if (error instanceof SyntaxError) {
      throw new AppError(
        'AI merger compiled malformed non-JSON data stream.',
        502
      );
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Hierarchical merger pipeline failure: ${error.message}`,
      502
    );
  }
};

module.exports = {
  generateAssistedDescription,
  generateActionableRoadmap,
  generateHabitActionables,
  generateGoalsAnalytics,
  generateJournalAnalytics,
  generateTodoAnalytics,
  generateHabitsAnalytics,
  mergeSnapshotsIntoHigherRange,
};
